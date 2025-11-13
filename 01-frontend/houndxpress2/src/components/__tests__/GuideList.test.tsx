import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GuideList from "../GuideList";
import { GuidesState } from "../../state/types";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import guidesReducer, { changeModalData } from "../../state/guides.slice";
import { configureStore } from "@reduxjs/toolkit";

describe("GuidesList", () => {
  // Create a Redux store with the guides reducer and preloaded state
  const defaultState: GuidesState = {
    guides: [],
    menuDisplay: false,
    modalData: { guideNumber: "", typeModal: "" },
  };

  const renderWithStore = (overrides = {}) => {
    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: {
        guides: { ...defaultState, ...overrides },
      },
    });
    render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <GuideList />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  //Clear all mock after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  //Renders
  it("should render the GuideList component", () => {
    renderWithStore();
    const guideList = screen.getByText("Lista de guías");
    expect(guideList).toBeInTheDocument();
  });

  it("should render the filter form", () => {
    renderWithStore();
    const filterLabel = screen.getByLabelText("Filtrar por estado de envío:");
    expect(filterLabel).toBeInTheDocument();
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    const clearButton = screen.getByText("Limpiar filtro");
    expect(clearButton).toBeInTheDocument();
  });

  it("should render the table header", () => {
    renderWithStore();
    const tableHeader = screen.getByText(/Número de guía/i);
    expect(tableHeader).toBeInTheDocument();
    const statusHeader = screen.getByText(/Estado actual/i);
    expect(statusHeader).toBeInTheDocument();
    const originHeader = screen.getByText(/Origen/i);
    expect(originHeader).toBeInTheDocument();
    const destinyHeader = screen.getByText(/Destino/i);
    expect(destinyHeader).toBeInTheDocument();
    const recipientHeader = screen.getByText(/Destinatario/i);
    expect(recipientHeader).toBeInTheDocument();
    const optionsHeader = screen.getByText(/Opciones/i);
    expect(optionsHeader).toBeInTheDocument();
  });

  it("should render the table with no guides", () => {
    renderWithStore();
    const tBodyEmpty = screen.getByTestId("table-body");
    expect(tBodyEmpty).toBeInTheDocument();
    expect(tBodyEmpty).toBeEmptyDOMElement();
  });

  it("should render the table with guides", () => {
    const mockGuides = [
      {
        guide__number: "123456",
        guide__stage: [{ guide__status: "Pendiente" }],
        guide__origin: "Ciudad A",
        guide__destination: "Ciudad B",
        guide__recipient: "Juan Perez",
      },
      {
        guide__number: "654321",
        guide__stage: [{ guide__status: "En tránsito" }],
        guide__origin: "Ciudad C",
        guide__destination: "Ciudad D",
        guide__recipient: "Maria Lopez",
      },
    ];
    renderWithStore({ guides: mockGuides });
    const tBody = screen.getByTestId("table-body");
    expect(tBody).toBeInTheDocument();
    expect(tBody.children.length).toBe(mockGuides.length);
  });

  // Functionality
  it("should filter guides by status", () => {
    const mockGuides = [
      {
        guide__number: "123456",
        guide__stage: [{ guide__status: "Pendiente" }],
        guide__origin: "Ciudad A",
        guide__destination: "Ciudad B",
        guide__recipient: "Juan Perez",
      },
      {
        guide__number: "654321",
        guide__stage: [{ guide__status: "En tránsito" }],
        guide__origin: "Ciudad C",
        guide__destination: "Ciudad D",
        guide__recipient: "Maria Lopez",
      },
      {
        guide__number: "789012",
        guide__stage: [{ guide__status: "Entregado" }],
        guide__origin: "Ciudad E",
        guide__destination: "Ciudad F",
        guide__recipient: "Carlos Gomez",
      },
    ];
    renderWithStore({ guides: mockGuides });
    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    // Set the value to filter by "Pendiente"
    fireEvent.change(selectElement, { target: { value: "Pendiente" } });
    const tBody = screen.getByTestId("table-body");
    const filteredRows = Array.from(tBody.querySelectorAll("tr"));
    expect(filteredRows.length).toBe(1);
    expect(filteredRows[0]).toHaveTextContent("Pendiente");

    //set the value to filter by "En tránsito"
    fireEvent.change(selectElement, { target: { value: "En tránsito" } });
    const filteredRows2 = Array.from(tBody.querySelectorAll("tr"));
    expect(filteredRows2.length).toBe(1);
    expect(filteredRows2[0]).toHaveTextContent("En tránsito");

    //set the value to filter by "Entregado"
    fireEvent.change(selectElement, { target: { value: "Entregado" } });
    const filteredRows3 = Array.from(tBody.querySelectorAll("tr"));
    expect(filteredRows3.length).toBe(1);
    expect(filteredRows3[0]).toHaveTextContent("Entregado");
  });

  it("should clear the filter when clicking the clear button", () => {
    const mockGuides = [
      {
        guide__number: "123456",
        guide__stage: [{ guide__status: "Pendiente" }],
        guide__origin: "Ciudad A",
        guide__destination: "Ciudad B",
        guide__recipient: "Juan Perez",
      },
      {
        guide__number: "654321",
        guide__stage: [{ guide__status: "En tránsito" }],
        guide__origin: "Ciudad C",
        guide__destination: "Ciudad D",
        guide__recipient: "Maria Lopez",
      },
    ];
    renderWithStore({ guides: mockGuides });
    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: "Pendiente" } });
    const clearButton = screen.getByText("Limpiar filtro");
    fireEvent.click(clearButton);
    expect(selectElement.value).toBe("");
    const tBody = screen.getByTestId("table-body");
    expect(tBody.children.length).toBe(mockGuides.length);
  });

  it("should call the function preventDefault on form submit", () => {
    renderWithStore();
    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();
    const preventDefaultMock = jest.fn();
    form.addEventListener("submit", (e) => preventDefaultMock(e));
    fireEvent.submit(form);
    expect(preventDefaultMock).toHaveBeenCalled();
  });

  it("should dispatch changeModalData with type 'History' when clicking on the history button", () => {
    const mockGuides = [
      {
        guide__number: "123456",
        guide__origin: "Ciudad A",
        guide__destination: "Ciudad B",
        guide__recipient: "Juan Perez",
        guide__stage: [
          {
            guide__status: "Pendiente",
            guide__date: "2024-06-24",
            guide__hour: "10:00",
          },
        ],
      },
    ];
    const defaultState: GuidesState = {
      guides: mockGuides,
      menuDisplay: false,
      modalData: { guideNumber: "", typeModal: "" },
    };
    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: {
        guides: defaultState,
      },
    });
    const dispatchSpy = jest.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <GuideList />
        </ThemeProvider>
      </Provider>
    );
    const historyButton = screen.getByText("Ver Historial");
    fireEvent.click(historyButton);
    expect(dispatchSpy).toHaveBeenCalledWith(
      changeModalData({ guideNumber: "123456", typeModal: "History" })
    );
  });

  it("should dispatch changeModalData with type 'update' when clicking on the update button", () => {
    const mockGuides = [
      {
        guide__number: "123456",
        guide__origin: "Ciudad A",
        guide__destination: "Ciudad B",
        guide__recipient: "Juan Perez",
        guide__stage: [
          {
            guide__status: "Pendiente",
            guide__date: "2024-06-24",
            guide__hour: "10:00",
          },
        ],
      },
    ];
    const defaultState: GuidesState = {
      guides: mockGuides,
      menuDisplay: false,
      modalData: { guideNumber: "", typeModal: "" },
    };
    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: {
        guides: defaultState,
      },
    });
    const dispatchSpy = jest.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <GuideList />
        </ThemeProvider>
      </Provider>
    );
    const updateButton = screen.getByText("Actualizar Estado");
    fireEvent.click(updateButton);
    expect(dispatchSpy).toHaveBeenCalledWith(
      changeModalData({ guideNumber: "123456", typeModal: "Update" })
    );
  });
});
