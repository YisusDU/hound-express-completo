import React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./useStoreTypes";
import { /* addGuide, */ createGuide } from "../state/guides.slice";
import validateFields from "./useValidateFields";
import { ApiError, ApiGuidePayload, GuideFormPayload } from "../state/types";

const useGuideRegister = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //Redux dispatch:
  const dispatch = useAppDispatch();
  const guides = useAppSelector((state) => state.guides.guides);

  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    //Validate the guide number
    const guideNumber = (formData.get("guide__number") as string)?.trim();

    const existingGuide = guides.some(
      (guide: ApiGuidePayload) => guide["guide_number"] === guideNumber
    );
    // console.log("existingGuide", existingGuide);

    if (existingGuide) {
      // console.log("existingGuide", existingGuide);
      // console.log("The guide number is valid?", isValidNumber)
      setErrors({ guide__number: "El número de guía ya existe" });
      return;
    } else {
      // console.log("the guide number is valid")
    }

    //validate all the fields empty
    const requiredFields = [
      "guide__number",
      "guide__origin",
      "guide__destination",
      "guide__recipient",
    ];

    const { isValid } = validateFields(requiredFields, formData, setErrors);

    //Validate if the form is valid to go ahead
    // console.log("Formulario válido:", validForm ? "true" : "false");
    if (!isValid) {
      e.preventDefault();
      return;
    }

    //Take the info into an object
    const guideData: GuideFormPayload = {
      guide_number: (formData.get("guide__number") as string)?.trim() || "",
      guide_origin: (formData.get("guide__origin") as string)?.trim() || "",
      guide_destination:
        (formData.get("guide__destination") as string)?.trim() || "",
      guide_recipient:
        (formData.get("guide__recipient") as string)?.trim() || "",
    };

    //Redux dispatch:
    // dispatch(addGuide(guideData));

    try {
      await dispatch(createGuide(guideData)).unwrap();
      alert("Guía registrada con éxito");
      //clean the form
      form.reset();
    } catch (rejectedValue) {
      console.error("Falló al crear la guía:", rejectedValue);
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

  return { errors, handleValidate, setErrors };
};

export { useGuideRegister };
