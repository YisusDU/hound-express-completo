import React from "react";
import { useUpdateForm } from "../../../../hooks/useUpdateForm";
import {
  ModalUpdateContainer,
  ModalForm,
  ModalSelect,
  ModalOptionSelect,
  ModalInput,
  ModalFormSubmit,
  ModalMessage,
} from "./styles";
import { useCleanErrorOnFocus } from "../../../../hooks/useCleanErrorOnFocus";
import { useAppSelector } from "../../../../hooks/useStoreTypes";

interface RefEls {
  focusableEls: HTMLElement[];
}

const UpdateForm = ({ focusableEls }: RefEls) => {
  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);
  const UpdateModalOpen = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide__number === guideNumber);

  const { handleValidate, errors, setErrors } = useUpdateForm();
  /* useEffect(()=> {
    console.log("currentGuideUpdate", currentGuide)
  }) */
  //Function to clear errors on focus
  const clearErrosOnFocus = useCleanErrorOnFocus(errors, setErrors);

  //----Funcion para limitar el input de fecha a la fecha actual
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

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
      {!currentGuide?.guide__stage
        ?.at(-1)
        ?.guide__status?.includes("Entregado") && (
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
            <ModalOptionSelect
              className="tableModal__form--option option--2"
              value="En tránsito"
              $state={String(currentGuide?.guide__stage.at(-1)?.guide__status)}
            >
              En tránsito 🚚
            </ModalOptionSelect>
            <option
              className="tableModal__form--option option--3"
              value="Entregado"
            >
              Entregado ✅
            </option>
          </ModalSelect>
          <span className="error-message">{errors.guide__status}</span>

          <label className="table__form--label" htmlFor="guide__newDate">
            Fecha de la última actualización DD/MM/AAAA:
          </label>
          <ModalInput
            className="tableModal__form--input tableModal__input"
            id="guide__newDate"
            name="guide__date"
            type="date"
            placeholder="Fecha de creación:"
            title="Añade la fecha de creación en formato DD/MM/YYYY"
            aria-label="Añade la fecha de creación en formato DD/MM/YYYY"
            onFocus={clearErrosOnFocus}
            max={formattedDate}
          />
          <span className="error-message">{errors.guide__date}</span>

          <label className="table__form--label" htmlFor="guide__hourUpdated">
            Hora de la última actualización HH:MM:
          </label>
          <ModalInput
            className="tableModal__form--input tableModal__input"
            id="guide__hourUpdated"
            name="guide__hour"
            type="time"
            placeholder="Hora de actualización:"
            title="Añade la hora de la actualización en formato HH:MM"
            aria-label="Añade la hora de la actualización en formato HH:MM"
            onFocus={clearErrosOnFocus}
          />
          <span className="error-message">{errors.guide__hour}</span>
          <br />
          <ModalFormSubmit
            className="tableModal__form--submit"
            type="submit"
            aria-label={`Actualizar estado de la guía ${currentGuide?.guide__number}`}
            title={`Actualizar estado de la guía ${currentGuide?.guide__number}`}
          >
            Actualizar
          </ModalFormSubmit>
        </ModalForm>
      )}
      {currentGuide?.guide__stage
        ?.at(-1)
        ?.guide__status?.includes("Entregado") && (
        <ModalMessage>
          *Tu envío ya fue entregado, no es posible actualizar su estado*
        </ModalMessage>
      )}
    </ModalUpdateContainer>
  );
};

export default UpdateForm;
