import React, { useEffect } from "react";
import Paw from "../../../../assets/IMG/paw-solid.svg";
import {
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
  const status = useAppSelector((state) => state.guides.status);
  const stages = useAppSelector((state) => state.guides.stages);
  const error = useAppSelector((state) => state.guides.error);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide_number === guideNumber);

  // Disparamos la operación asíncrona para listar guías
  useEffect(() => {
    if (guideNumber) {
      dispatch(fetchStages(guideNumber));
    }
  }, [dispatch, status]);

  return (
    <section>
      {/* Dinamics paths of following  */}
      {status == ASYNC_STATUS.FULFILLED &&
        (stages && stages.length >= 1 ? (
          <>
            {stages.map((stage, idx) => (
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
                        : ""
                    }
                  >
                    {stage.guide_status}
                  </h3>
                  <div>
                    <span>{`${stage.timestamp} | `}</span>
                    <span>
                      {stage.guide_status === "Pendiente" &&
                        "Tu envío está en preparación"}
                      {stage.guide_status === "En tránsito" &&
                        "Tu envío está en camino"}
                      {stage.guide_status === "Entregado" &&
                        "¡Tu envío fue entregado!"}
                    </span>
                  </div>
                  <hr />
                </ModalPathContent>
              </ModalHistoryPath>
            ))}
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
    </section>
  );
};

export default HistoryPath;
