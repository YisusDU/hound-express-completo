import React, { useEffect } from "react";
import Paw from "../../../../assets/IMG/paw-solid.svg";
import {
  PathContainer,
  ModalHistoryPath,
  ModalPathContent,
  ModalSVGContainer,
} from "./styles";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../hooks/useStoreTypes";
import { ASYNC_STATUS } from "../../../../constants/asyncStatus";
import ServerError from "../../../ServerError";
import { fetchStages } from "../../../../state/guides.slice";

const HistoryPath = () => {
  //Redux state
  const dispatch = useAppDispatch();

  const guides = useAppSelector((state) => state.guides.guides);
  const status = useAppSelector((state) => state.guides.stagesStatus);
  const stages = useAppSelector((state) => state.guides.stages);
  const error = useAppSelector((state) => state.guides.stagesError);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );

  // Disparamos la operación asíncrona para listar guías
  useEffect(() => {
    if (guideNumber) {
      dispatch(fetchStages(guideNumber));
    }
  }, [dispatch, guideNumber]);

  return (
    <PathContainer>
      {/* Dinamics paths of following  */}
      {status == ASYNC_STATUS.FULFILLED &&
        (stages && stages.length >= 1 ? (
          <>
            {stages.map((stage, idx) => {
              const dateObj = new Date(stage.timestamp);
              // 'es-MX' usa el formato DD/MM/YYYY
              const fecha = dateObj.toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const hora = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              return (
                <ModalHistoryPath key={idx}>
                  <ModalSVGContainer>
                    <img src={Paw} alt="paw-icon" />
                  </ModalSVGContainer>
                  <ModalPathContent>
                    <h3
                      className={
                        stage.guide_status === "Pendiente"
                          ? "status--pending"
                          : stage.guide_status === "En tránsito"
                          ? "status--transit"
                          : stage.guide_status === "Entregado"
                          ? "status--delivered"
                          : stage.guide_status === "Cancelado"
                          ? "status--cancelled"
                          : ""
                      }
                    >
                      {stage.guide_status}
                    </h3>
                    <div>
                      <span>{`${fecha} ${hora} | `}</span>
                      <span>
                        {stage.guide_status === "Pendiente" &&
                          "Tu envío está en preparación"}
                        {stage.guide_status === "En tránsito" &&
                          "Tu envío está en camino"}
                        {stage.guide_status === "Entregado" &&
                          "¡Tu envío fue entregado!"}
                        {stage.guide_status === "Cancelado" &&
                          "¡Tu envío fue Cancelado!"}
                      </span>
                    </div>
                    <hr />
                  </ModalPathContent>
                </ModalHistoryPath>
              );
            })}
          </>
        ) : (
          <p>No hay valores para mostrar</p>
        ))}
      {status === ASYNC_STATUS.PENDING && (
        <div>
          <h2>Loading... 🥱</h2>
        </div>
      )}
      {status === ASYNC_STATUS.REJECTED && <ServerError error={error} />}
    </PathContainer>
  );
};

export default HistoryPath;
