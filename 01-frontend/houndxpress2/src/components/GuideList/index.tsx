import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GuideListContainer,
  GuideFilter,
  GuideTable,
  TableHeader,
  TableData,
  TableButtonsContainer,
} from "./styles";
import useDraggTable from "../../hooks/useDraggTable";
import { useAppSelector, useAppDispatch } from "../../hooks/useStoreTypes";
import { changeModalData, fetchGuides } from "../../state/guides.slice";
import { useModalGuides } from "../../hooks/useModalGuides";
import { ASYNC_STATUS } from "../../constants/asyncStatus";
import ServerError from "../ServerError";

const GuideList = () => {
  //Variables to aply some filter
  const [filterState, setFilterState] = useState<string>("");
  const [filterNumber, setFilterNumber] = useState<string>("");

  //Function to dragg the table on scroll, it needs styles of overflow
  const tableRef = useDraggTable();

  //Redux state
  const guides = useAppSelector((state) => state.guides.guides);
  const status = useAppSelector((state) => state.guides.listStatus);
  const error = useAppSelector((state) => state.guides.listError);
  const dispatch = useAppDispatch();
  const updateButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  type ModalType = "History" | "Update";

  const openModal = (guide: string, type: ModalType) => {
    dispatch(changeModalData({ guideNumber: guide, typeModal: type }));
  };

  // Disparamos la operación asíncrona para listar guías
  useEffect(() => {
    dispatch(fetchGuides());
  }, [dispatch]);

  // Filtrar guías por estatus
  const filteredGuides = useMemo(() => {
    // 1. Normaliza tus filtros primero
    const cleanStateFilter = filterState.toLowerCase();
    const cleanNumberFilter = filterNumber.toLowerCase();

    // 2. Inicia con la lista completa
    let tempGuides = guides;

    // 3. Aplica el filtro de estado (si está activo)
    if (cleanStateFilter) {
      tempGuides = tempGuides.filter(
        (g) => g.current_status.toLowerCase() === cleanStateFilter
      );
    }

    // 4. Aplica el filtro de número (si está activo)
    if (cleanNumberFilter) {
      tempGuides = tempGuides.filter((g) =>
        g.guide_number.toLowerCase().includes(cleanNumberFilter)
      );
    }

    // 5. Devuelve la lista que pasó por todos los filtros
    return tempGuides;
  }, [guides, filterState, filterNumber]);

  //Function for accesibility of aria-expanded
  const [ariaExpanded, setAriaExpanded] = useState(false);
  const modalFilled1 = useAppSelector(
    (state) => state.guides.modalData.guideNumber
  );
  const modalFilled2 = useAppSelector(
    (state) => state.guides.modalData.typeModal
  );

  const resetFilter = () => {
    setFilterState("");
    setFilterNumber("");
  };

  useEffect(() => {
    if (modalFilled1 === "" && modalFilled2 === "") {
      setAriaExpanded(false);
    } else {
      setAriaExpanded(true);
    }
  }, [modalFilled1, modalFilled2]);

  return (
    /* <!--Lista de guías--> */
    <GuideListContainer className="guide__list" id="guide__list">
      <h2 className="list__title">Lista de guías</h2>
      <GuideFilter role="form" action="#" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="filterState">Filtrar por estado de envío:</label>
        <select
          name="filterState"
          id="filterState"
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          aria-controls="mainTable"
          aria-label="Filtrar por estado de envío:"
          title="Filtrar por estado de envío:"
        >
          <option value="">Mostrar todos</option>
          <option value="Pendiente">Pendientes</option>
          <option value="En tránsito">En tránsito</option>
          <option value="Entregado">Entregados</option>
        </select>
        <hr />
        <label htmlFor="findGuide">Buscar guía:</label>
        <input
          type="text"
          name="findGuide"
          id="findGuide"
          value={filterNumber}
          onChange={(e) => setFilterNumber(e.target.value)}
          title="Buscar guía"
          placeholder="Añade un número de guía"
        />
        <button
          type="button"
          onClick={resetFilter}
          role="button"
          aria-label="Limpiar filtro"
          title="Limpiar filtro"
          aria-controls="mainTable"
        >
          Limpiar filtro
        </button>
      </GuideFilter>
      <section ref={tableRef} className="list__tableContainer">
        <GuideTable id="mainTable" className="guide__table" cellPadding={5}>
          <TableHeader className="table__header">
            <tr className="table__header--row">
              <th className="guide__table--header">Número de guía</th>
              <th className="guide__table--header">Estado actual</th>
              <th className="guide__table--header">Origen</th>
              <th className="guide__table--header">Destino</th>
              <th className="guide__table--header">Destinatario</th>
              <th className="guide__table--header">
                Fecha de la última actualización.
              </th>
              <th className="guide__table--header">Opciones</th>
            </tr>
          </TableHeader>
          <tbody data-testid="table-body" className="table__body">
            {status === ASYNC_STATUS.FULFILLED &&
              filteredGuides.map((g, index) => {
                const dateObj = new Date(g.updated_at);
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
                  <tr className="guide__table--row" key={g.guide_number}>
                    <TableData
                      className="guide__table--data"
                      data-label="Número de guía"
                    >
                      {g.guide_number}
                    </TableData>

                    <TableData
                      className="guide__table--data"
                      data-label="Estado actual"
                    >
                      {g.current_status}
                    </TableData>

                    <TableData
                      className="guide__table--data"
                      data-label="Origen"
                    >
                      {g.guide_origin}
                    </TableData>

                    <TableData
                      className="guide__table--data"
                      data-label="Destino"
                    >
                      {g.guide_destination}
                    </TableData>

                    <TableData
                      className="guide__table--data"
                      data-label="Destinatario"
                    >
                      {g.guide_recipient}
                    </TableData>

                    <TableData
                      className="guide__table--data"
                      data-label="Fecha"
                    >
                      {`${fecha} ${hora}`}
                    </TableData>

                    <TableButtonsContainer
                      className="guide__table--data list__buttonsContainer"
                      data-label="Opciones"
                    >
                      <button
                        ref={(el) => {
                          updateButtonRefs.current[index] = el;
                        }}
                        className="guide__button guideButton--seeHistory"
                        onClick={() => openModal(g.guide_number, "History")}
                        type="button"
                        role="button"
                        aria-label={`Ver historial de la guía ${g.guide_number}`}
                        title={`Ver historial de la guía ${g.guide_number}`}
                        aria-haspopup="dialog"
                        aria-controls="modalHistory"
                        aria-expanded={ariaExpanded ? true : false}
                      >
                        Ver Historial
                      </button>
                      <button
                        ref={(el) => {
                          updateButtonRefs.current[index] = el;
                        }}
                        className="guide__button guide__button--updateState"
                        onClick={() => openModal(g.guide_number, "Update")}
                        type="button"
                        role="button"
                        aria-label={`Actualizar estado de la guía ${g.guide_number}`}
                        title={`Actualizar estado de la guía ${g.guide_number}`}
                        aria-haspopup="dialog"
                        aria-controls="modalUpdate"
                        aria-expanded={ariaExpanded ? true : false}
                      >
                        Actualizar Estado
                      </button>
                    </TableButtonsContainer>
                  </tr>
                );
              })}
            {status === ASYNC_STATUS.FULFILLED && filteredGuides.length === 0 && (<p> No hay Guías para mostrar</p>)}
            {status === ASYNC_STATUS.PENDING && (
              <div>
                <h2>Loading... 🥱</h2>
              </div>
            )}
            {status === ASYNC_STATUS.REJECTED && <ServerError error={error} />}
          </tbody>
        </GuideTable>
      </section>
    </GuideListContainer>
  );
};

export default GuideList;
