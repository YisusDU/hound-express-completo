import { useEffect, useState } from "react";
import { useAppDispatch } from "./useStoreTypes";
import { toggleMenu } from "../state/guides.slice";

// ¡Este hook ahora solo se encarga de cambiar la APARIENCIA!
const useFixedHeader = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const changeDisplay = () => {
      if (window.scrollY > 165) {
        dispatch(toggleMenu(true));
      } else {
        dispatch(toggleMenu(false));
      }
    };
    window.addEventListener("scroll", changeDisplay);
    return () => window.removeEventListener("scroll", changeDisplay);
  }, [dispatch]);
};

export default useFixedHeader;
