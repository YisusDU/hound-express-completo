import React from "react";
import useDraggTable from "../../../../hooks/useDraggTable";
import { HistoryTableContainer } from "./styles";
import { useAppSelector } from "../../../../hooks/useStoreTypes";

const HistoryTable = () => {
  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);
  const guideNumber = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const currentGuide = guides.find((g) => g.guide_number === guideNumber);
  //Verify if the current guide has stages, if not, it will be an empty array
  const stages = useAppSelector((state) => state.guides.stages);
  //Function to dragg the table on scroll, it needs styles of overflow
  const tableRef = useDraggTable();

  return (
    <HistoryTableContainer ref={tableRef}>
      <table className="tableHistory__currentGuide">
        <thead className="tableHistory__currentGuide--header">
          <tr className="tableHistory__modalUptade--row">
            <th className="tableHistory__table--modal">Número de guía</th>
            <th className="tableHistory__table--modal">Estado actual</th>
            <th className="tableHistory__table--modal">Origen</th>
            <th className="tableHistory__table--modal">Destino</th>
            <th className="tableHistory__table--modal">Destinatario</th>
          </tr>
        </thead>
        <tbody className="tableHistory__currentGuide--body">
          {currentGuide ? (
            <tr>
              <td data-label="Número de guía">{currentGuide.guide_number}</td>
              <td data-label="Estado">
                {currentGuide.current_status}
              </td>
              <td data-label="Origen">{currentGuide.guide_origin}</td>
              <td data-label="Destino">{currentGuide.guide_destination}</td>
              <td data-label="Destinatario">{currentGuide.guide_recipient}</td>
            </tr>
          ) : (
            <tr>
              <td>No hay valores para mostrar</td>
            </tr>
          )}
        </tbody>
      </table>
    </HistoryTableContainer>
  );
};

export default HistoryTable;
