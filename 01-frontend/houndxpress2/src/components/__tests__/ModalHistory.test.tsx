import React from "react";
import ModalHistory from "../Modals/ModalHistory";
import { prettyDOM, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { GuidesState } from "../../state/types";

describe("ModalHistory", () => {
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
          <ModalHistory />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  it("should render the ModalHistory component when typeModal is 'History'", () => {
    renderWithStore();
    const modalTitle = screen.getByText("Historial de envío");
    expect(modalTitle).toBeInTheDocument();
  });

  it("should not render the modal when typeModal is not 'History'", () => {
    const store = renderWithStore({
      modalData: { guideNumber: "", typeModal: "other" },
    });
    const modalTitle = screen.queryByText("Historial de envío");
    expect(modalTitle?.parentNode).toHaveClass("hiddeModal");
  });

  it("should render the modal unhidden when typeModal is 'History'", () => {
    const store = renderWithStore({
      modalData: { guideNumber: "", typeModal: "History" },
    });
    const modalTitle = screen.getByText("Historial de envío").parentNode;
    expect(modalTitle).toHaveClass("table__modal--history");
    expect(modalTitle).not.toHaveClass("hiddeModal");
  });

  it("should render HistoryTable component child", () => {
    renderWithStore({
      modalData: { guideNumber: "", typeModal: "History" },
    });
    const historyTableRole = screen.getByRole("table");
    const historyTable = screen.getByText("Número de guía");
    expect(historyTableRole).toBeInTheDocument();
    expect(historyTable).toBeInTheDocument();
  });

  it("should render HistoryPath component child", () => {
    renderWithStore();
    const errorMessage = screen.getAllByText(/No hay valores para mostrar/i);
    expect(errorMessage).toBeTruthy();
    expect(errorMessage[0]).toBeInTheDocument();
  });
  
});
