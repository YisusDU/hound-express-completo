import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { ModalUpdateContainer } from "./styles";
import UpdateTable from "./UpdateTable";
import UpdateForm from "./UpdateForm";
import { Guide } from "../../../types/guides";
import { useModalGuides } from "../../../hooks/useModalGuides";
import XIcon from "../../../assets/IMG/x-solid.svg";
import { useAppSelector } from "../../../hooks/useStoreTypes";

export interface ModalUpdateProp {
  modalData: string;
  guides: Guide[];
  setGuides: React.Dispatch<SetStateAction<Guide[]>>;
  setModalData: React.Dispatch<SetStateAction<string>>;
  isOpenModal: string;
  setIsOpenModal: React.Dispatch<SetStateAction<"Update" | "History" | "">>;
}

const ModalUpdate = () => {
  
  //Redux state typeModal
  const isOpenModal = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );
const { cleanGuideData } = useModalGuides();

  //Make a focus trap for the inputs container
  const inputsContainer = useRef<HTMLUListElement>(null);
  const [focusableEls, setFocusableEls] = useState<HTMLElement[]>([]);

  useEffect(() => {
    if (!isOpenModal) return;
    const container = inputsContainer.current;
    if (!container) return;
    const selectors = "input, button:not([disabled])";
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(selectors)
    );
    setFocusableEls(elements);
    if (elements.length) elements[0].focus();
  }, [isOpenModal]);

  return (
    <ModalUpdateContainer
      id="modalUpdate"
      className={`table__modal--Update ${
        isOpenModal === "Update" ? "" : " hiddeModal"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="Actualizar estado del envío"
      ref={inputsContainer}
    >
      <button
        className="table__closeModal"
        type="button"
        onClick={cleanGuideData}
        aria-label="Cerrar modal"
        title="Cerrar modal"
      >
        <img src={XIcon} alt="close--modal" />
      </button>
      <h3 className="tableModal__title">Actualizar estado del envío</h3>
      <UpdateTable />
      <UpdateForm focusableEls={focusableEls} />
    </ModalUpdateContainer>
  );
};

export default ModalUpdate;
