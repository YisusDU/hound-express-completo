import { SetStateAction, useState } from "react";
import validateFields from "./useValidateFields";
import { Guide } from "../components/GuideReguister/types";
import { useAppDispatch, useAppSelector } from "./useStoreTypes";
import { ApiError } from "../state/types";
import { updateStatus } from "../state/guides.slice";
// import { updateGuide } from "../state/guides.slice";

const useUpdateForm = () => {
  //Redux state
  const dispatch = useAppDispatch();

  //Set errors from the form
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Encontrar la guía actual
  const guides = useAppSelector((state) => state.guides.guides);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide_number === guideNumber);

  //Validate the form on submit
  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    //validate all the fields empty
    const requiredFields = ["guide__date", "guide__hour", "guide__status"];
    const { isValid } = validateFields(requiredFields, formData, setErrors);

    // console.log("Formulario válido:", validForm ? "true" : "false");
    if (!isValid) {
      return;
    }

    // Validar que se encontró la guía
    if (!currentGuide) {
      return console.error("Guía no encontrada");
    }

    //Take the info into an object
    const newGuideStage = {
      id: currentGuide.id,
      guide_status: (formData.get("guide__status") as string)?.trim() || "",
    };

    try {
      await dispatch(updateStatus(newGuideStage)).unwrap();
      alert("Guía actualizada con éxito");
      //clean the form
      form.reset();
    } catch (rejectedValue) {
      console.error("Falló al actualiar la guía:", rejectedValue);
      alert("There was an error creating your order. Please try again.");
      if (typeof rejectedValue === "object" && rejectedValue !== null) {
        // Transforma el ApiError en el estado de errores local
        const backendErrors: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(rejectedValue as ApiError)) {
          // Asumimos que los nombres de campo coinciden (ej. guide_number)
          // y tomamos solo el primer mensaje de error
          const newKey = `guide__${key.split("_")[1]}`; // Transforma 'guide_number' a 'guide__number'
          if (Array.isArray(value)) {
            backendErrors[newKey] = value[0];
          }
        }
        setErrors(backendErrors);
      } else {
        // Es un error de string genérico, no lo podemos poner en un campo
        // 'renderServerError' lo mostrará de todas formas.
        console.log("Error de servidor genérico:", rejectedValue);
      }
    }
  };
  return { handleValidate, errors, setErrors, currentGuide };
};

export { useUpdateForm };
