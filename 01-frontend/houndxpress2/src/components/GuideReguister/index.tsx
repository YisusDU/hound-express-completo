import React from "react";
import Paws from "../../assets/IMG/paw-solid.svg";
import { useGuideRegister } from "../../hooks/useGuideRegister";
import {
  GuideRegisterContainer,
  GuideContainer,
  GuideForm,
  GuideSubmit,
  GuideAnimation,
} from "./styles";
import { useCleanErrorOnFocus } from "../../hooks/useCleanErrorOnFocus";
import { useAppSelector } from "../../hooks/useStoreTypes";
import { ASYNC_STATUS } from "../../constants/asyncStatus";
import ServerError from "../ServerError";

const GuideRegister = () => {
  const { errors, handleValidate, setErrors } = useGuideRegister();
  const cleanErrorOnFocus = useCleanErrorOnFocus(errors, setErrors);
  const status = useAppSelector((state) => state.guides.status);

  return (
    <GuideRegisterContainer className="guide__register" id="guide__register">
      {/* <!--Formulario--> */}
      <GuideContainer className="guide__container">
        <h2 className="guide__title">Registro de guías</h2>
        <GuideForm
          className="guide__form"
          action="#"
          onSubmit={handleValidate}
          role="form"
        >
          <label className="guide__form--label" htmlFor="guide__number">
            Número de guía:
          </label>
          <input
            className="guide__form--input"
            id="guide__number"
            name="guide__number"
            type="text"
            inputMode="numeric"
            pattern="\d{1,8}"
            maxLength={8}
            placeholder="Número de guía:"
            aria-label="Añade un número de guía de máximo 8 caracteres"
            title="Añade un número de guía de máximo 8 caracteres"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__number ? "true" : "false"}
            aria-describedby={
              errors.guide__number ? errors.guide__number : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__number}
          </span>

          <label className="guide__form--label" htmlFor="guide__origin">
            Origen del envío:
          </label>
          <input
            className="guide__form--input"
            id="guide__origin"
            name="guide__origin"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Origen del envío:"
            aria-label="Origen del envío:"
            title="Añade la ciudad de origen"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__origin ? "true" : "false"}
            aria-describedby={
              errors.guide__origin ? errors.guide__origin : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__origin}
          </span>

          <label className="guide__form--label" htmlFor="guide__destination">
            Destino del envío:
          </label>
          <input
            className="guide__form--input"
            id="guide__destination"
            name="guide__destination"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Destino del envío:"
            aria-label="Añade el destino del envío:"
            title="Añade la ciudad de destino"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__destination ? "true" : "false"}
            aria-describedby={
              errors.guide__destination ? errors.guide__destination : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__destination}
          </span>

          <label className="guide__form--label" htmlFor="guide__recipient">
            Destinatario:
          </label>
          <input
            className="guide__form--input"
            id="guide__recipient"
            name="guide__recipient"
            type="text"
            inputMode="text"
            maxLength={30}
            placeholder="Destinatario:"
            aria-label="Añade el nombre y apellido del destinatario"
            title="Añade el nombre y apellido del destinatario"
            onFocus={cleanErrorOnFocus}
            aria-required="true"
            aria-invalid={errors.guide__recipient ? "true" : "false"}
            aria-describedby={
              errors.guide__recipient ? errors.guide__recipient : undefined
            }
          />
          <span className="error-message" role="alert" aria-live="polite">
            {errors.guide__recipient}
          </span>
          <br />
          <GuideSubmit
            className="guide__form--submit"
            type="submit"
            role="button"
            aria-label="Enviar formulario"
            title="Enviar formulario"
          >
            Enviar
          </GuideSubmit>
        </GuideForm>
        {status === ASYNC_STATUS.REJECTED && <ServerError error={errors} />}
      </GuideContainer>

      {/* <!--Animacion--> */}
      <GuideAnimation className="guide__animation">
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--right"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--right"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
        <img
          className="guide__svg guide__svg--left"
          src={Paws}
          alt="Huella de perro"
          aria-hidden="true"
        />
      </GuideAnimation>
    </GuideRegisterContainer>
  );
};

export default GuideRegister;
