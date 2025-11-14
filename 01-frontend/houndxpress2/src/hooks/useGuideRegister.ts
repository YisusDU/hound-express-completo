import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./useStoreTypes";
import { addGuide, createGuide } from "../state/guides.slice";
import validateFields from "./useValidateFields";
import { Guide } from "../types/guides";
import { GuideFormPayload } from "../state/types";

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
      (guide: Guide) => guide["guide__number"] === guideNumber
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
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("There was an error creating your order. Please try again.");
    }

    //clean the form
    form.reset();
  };
  return { errors, handleValidate, setErrors };
};

export { useGuideRegister };
