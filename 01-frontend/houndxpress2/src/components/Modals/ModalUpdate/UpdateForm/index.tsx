import React from "react";
import { useUpdateForm } from "../../../../hooks/useUpdateForm";
import {
  ModalUpdateContainer,
  ModalForm,
  ModalSelect,
  ModalFormSubmit,
  ModalMessage,
} from "./styles";
import { useCleanErrorOnFocus } from "../../../../hooks/useCleanErrorOnFocus";
import { useAppSelector } from "../../../../hooks/useStoreTypes";
import { ASYNC_STATUS } from "../../../../constants/asyncStatus";
import ServerError from "../../../ServerError";

interface RefEls {
  focusableEls: HTMLElement[];
}

const UpdateForm = ({ focusableEls }: RefEls) => {
  //Redux state
  const status = useAppSelector((state) => state.guides.updateStatus);
  const error = useAppSelector((state) => state.guides.updateError);
  const UpdateModalOpen = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );

  const { handleValidate, errors, setErrors, currentGuide } = useUpdateForm();
  /* useEffect(()=> {
    console.log("currentGuideUpdate", currentGuide)
  }) */
  //Function to clear errors on focus
  const clearErrosOnFocus = useCleanErrorOnFocus(errors, setErrors);

  //Make a focus trap for the links container
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Tab" || focusableEls.length === 0) return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <ModalUpdateContainer>
      {!["Cancelado", "Entregado"].includes(
        currentGuide?.current_status || ""
      ) && (
        <ModalForm
          action="#"
          className="tableModal__form"
          onSubmit={handleValidate}
          onKeyDown={UpdateModalOpen === "Update" ? handleKeyDown : undefined}
        >
          <label className="table__form--label" htmlFor="guide__newStatus">
            Nuevo estado:
          </label>
          <ModalSelect
            className="tableModal__form--select tableModal__input"
            id="guide__newStatus"
            name="guide__status"
            title="Selecciona el estado actualizado del envío"
            aria-label="Selecciona el estado actualizado del envío"
            onFocus={clearErrosOnFocus}
          >
            <option className="tableModal__form--option option--1" value="">
              Nuevo estado:
            </option>
            <option
              className="tableModal__form--option option--2"
              value="Pendiente"
            >
              Pendiente 📦
            </option>
            <option
              className="tableModal__form--option option--2"
              value="En tránsito"
            >
              En tránsito 🚚
            </option>
            <option
              className="tableModal__form--option option--3"
              value="Entregado"
            >
              Entregado ✅
            </option>
            <option
              className="tableModal__form--option option--2"
              value="Cancelado"
            >
              Cancelado ❌
            </option>
          </ModalSelect>
          <span className="error-message">{errors.guide__status}</span>
          <br />
          <ModalFormSubmit
            className="tableModal__form--submit"
            type="submit"
            aria-label={`Actualizar estado de la guía ${currentGuide?.guide_number}`}
            title={`Actualizar estado de la guía ${currentGuide?.guide_number}`}
          >
            Actualizar
          </ModalFormSubmit>
        </ModalForm>
      )}
      {(currentGuide?.current_status === "Entregado" ||
        currentGuide?.current_status === "Cancelado") && (
        <ModalMessage>
          *Tu envío fue {currentGuide.current_status}, no es posible actualizar
          su estado*
        </ModalMessage>
      )}
      {status === ASYNC_STATUS.REJECTED && (
        <p>Hubo un problema al actualizar tu guía</p>
      )}
    </ModalUpdateContainer>
  );
};

export default UpdateForm;
