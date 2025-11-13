import React, { useEffect, useRef, useState } from "react";
import XIcon from "../../../assets/IMG/x-solid.svg";
import HistoryTable from "./HistoryTable";
import HistoryPath from "./HistoryPath";
import { useModalGuides } from "../../../hooks/useModalGuides";
import { ModalHistoryContainer } from "./styles";
import { useAppSelector } from "../../../hooks/useStoreTypes";

const ModalHistory = () => {
  //Redux state typeModal
  const isOpenModal = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );

  const { cleanGuideData } = useModalGuides();

  //Make a focus trap for the button close modal
  const buttonCloseModal = useRef<HTMLElement>(null);
  const [focusableEls, setFocusableEls] = useState<HTMLElement[]>([]);

  useEffect(() => {
    if (!isOpenModal) return;
    const container = buttonCloseModal.current;
    if (!container) return;
    const selectors = "button:not([disabled])";
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(selectors)
    );
    setFocusableEls(elements);
    if (elements.length) elements[0].focus();
  }, [isOpenModal]);

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
    <ModalHistoryContainer
      id="modalHistory"
      className={`table__modal--history ${
        isOpenModal === "History" ? "" : " hiddeModal"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="Historial de envío"
      ref={buttonCloseModal}
      onKeyDown={isOpenModal ? handleKeyDown : undefined}
    >
      <button
        className="tableHistory__closeModal"
        type="button"
        onClick={cleanGuideData}
        tabIndex={0}
        aria-label="Cerrar modal"
        title="Cerrar modal"
      >
        <img src={XIcon} alt="close--modal" />
      </button>
      <h3 className="tableModal__title">Historial de envío</h3>
      <section className="tableModal__container">
        {/* Current info into a table */}
        <HistoryTable />
        <HistoryPath />
      </section>
    </ModalHistoryContainer>
  );
};

export default ModalHistory;
