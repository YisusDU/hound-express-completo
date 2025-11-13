import React from "react";
import HistoryPath from "../Modals/ModalHistory";
import { prettyDOM, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { GuidesState } from "../../state/types";

describe("HistoryPath component", () => {
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
          <HistoryPath />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the HistoryPath component with guide data", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "Pendiente",
            guide__hour: "12:34",
          },
        ],
      },
    ];
    renderWithStore({ guides: guides, modalData: guideData });
    const titleStatus = screen.getByText(/Pendiente/i, { selector: "h3" });
    expect(titleStatus).toBeInTheDocument();
  });

  it("should render the HistoryPath component with empty state", () => {
    renderWithStore();
    const errorMessage = screen.getAllByText(/No hay valores para mostrar/i);
    expect(errorMessage).toBeTruthy();
    expect(errorMessage[0]).toBeInTheDocument();
  });

  it("should render the status without no styles with empty stage", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "",
            guide__hour: "12:34",
          },
        ],
      },
    ];
    renderWithStore({ guides: guides, modalData: guideData });
    const emptyStatusH3 = screen.getByText("", { selector: "h3" });
    expect(emptyStatusH3).toBeInTheDocument();
  });

  it("should render the HistoryPath component with correct status styles", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "Pendiente",
            guide__hour: "12:34",
          },
          {
            guide__date: "2025-05-26",
            guide__status: "En tránsito",
            guide__hour: "14:00",
          },
          {
            guide__date: "2025-05-27",
            guide__status: "Entregado",
            guide__hour: "16:45",
          },
        ],
      },
    ];
    renderWithStore({ guides: guides, modalData: guideData });
    const pendingStatus = screen.getByText(/Pendiente/i, { selector: "h3" });
    const transitStatus = screen.getByText(/En tránsito/i, { selector: "h3" });
    const deliveredStatus = screen.getByText(/Entregado/i, { selector: "h3" });
    expect(pendingStatus).toHaveClass("status--pending");
    expect(transitStatus).toHaveClass("status--transit");
    expect(deliveredStatus).toHaveClass("status--delivered");
  });

  it("should render the HistoryPath component with multiple stages", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "Pendiente",
            guide__hour: "12:34",
          },
          {
            guide__date: "2025-05-26",
            guide__status: "En tránsito",
            guide__hour: "14:00",
          },
          {
            guide__date: "2025-05-27",
            guide__status: "Entregado",
            guide__hour: "16:45",
          },
        ],
      },
    ];
    renderWithStore({ guides: guides, modalData: guideData });
    const statusElements = screen.getAllByText(
      /Pendiente|En tránsito|Entregado/i,
      { selector: "h3" }
    );
    expect(statusElements.length).toBe(3);
  });

  it("should render the HistoryPath component with correct date and hour format", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "Pendiente",
            guide__hour: "12:34",
          },
          {
            guide__date: "2025-05-26",
            guide__status: "En tránsito",
            guide__hour: "14:00",
          },
          {
            guide__date: "2025-05-27",
            guide__status: "Entregado",
            guide__hour: "16:45",
          },
        ],
      },
    ];
    renderWithStore({ guides: guides, modalData: guideData });
    const dateElements = screen.getAllByText(
      /2025-05-25|2025-05-26|2025-05-27/
    );
    const hourElements = screen.getAllByText(/12:34|14:00|16:45/);
    expect(dateElements.length).toBe(3);
    expect(hourElements.length).toBe(3);

    for (let i = 0; i < dateElements.length; i++) {
      expect(dateElements[i]).toBeInTheDocument();
      expect(hourElements[i]).toBeInTheDocument();
    }
  });

  it("should render the HistoryPath component with correct status messages", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "Pendiente",
            guide__hour: "12:34",
          },
          {
            guide__date: "2025-05-26",
            guide__status: "En tránsito",
            guide__hour: "14:00",
          },
          {
            guide__date: "2025-05-27",
            guide__status: "Entregado",
            guide__hour: "16:45",
          },
        ],
      },
    ];
    renderWithStore({ guides: guides, modalData: guideData });
    const pendingMessage = screen.getByText(/tu envío está en preparación/i);
    const transitMessage = screen.getByText(/tu envío está en camino/i);
    const deliveredMessage = screen.getByText(/¡tu envío fue entregado!/i);
    expect(pendingMessage).toBeInTheDocument();
    expect(transitMessage).toBeInTheDocument();
    expect(deliveredMessage).toBeInTheDocument();
  });

  it("should render the empty state when guide__stage is empty", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [],
      },
    ];
    renderWithStore({ guides, modalData: guideData });
    expect(
      screen.getByText(/No hay valores para mostrar/i)
    ).toBeInTheDocument();
  });

  it("should render the empty state when guide__stage is null", () => {
    const guideData = {
      guideNumber: "12345678",
      typeModal: "history",
    };
    const guides = [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: null,
      },
    ];
    renderWithStore({ guides, modalData: guideData });
    expect(
      screen.getByText(/No hay valores para mostrar/i)
    ).toBeInTheDocument();
  });
});
