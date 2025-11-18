import { changeModalData, resetUpdateStatus } from "../state/guides.slice";
import { useAppDispatch } from "./useStoreTypes";

const useModalGuides = () => {
  const dispatch = useAppDispatch();

  const cleanGuideData = () => {
    dispatch(changeModalData({ guideNumber: "", typeModal: "" }));
    dispatch(resetUpdateStatus());

    // Devolver foco al primer elemento interactivo visible (que no esté oculto)
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>('select[name="filterState"]')
    );

    const firstVisibleFocusable = focusable.find(
      (el) =>
        el.offsetParent !== null && // visible en layout
        getComputedStyle(el).visibility !== "hidden"
    );

    firstVisibleFocusable?.focus();
  };

  return { cleanGuideData };
};

export { useModalGuides };
