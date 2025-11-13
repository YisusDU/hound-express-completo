import React from "react";
import HistoryTable from "../Modals/ModalHistory/HistoryTable";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { GuidesState } from "../../state/types";

describe("HistoryTable component", () => {
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
          <HistoryTable />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  it("should render the HistoryTable component", () => {
    renderWithStore();
    const historyTable = screen.getByText("Número de guía");
    expect(historyTable).toBeInTheDocument();
  });

  it("should render the HistoryTable with empty state", () => {
    renderWithStore();
    const noValuesText = screen.getByText("No hay valores para mostrar");
    expect(noValuesText).toBeInTheDocument();
  });

  it("should render the HistoryTable with current guide data", () => {
    const mockGuide = {
      guide__number: "12345",
      guide__origin: "Origin City",
      guide__destination: "Destination City",
      guide__recipient: "Recipient Name",
      guide__stage: [
        {
          guide__status: "In Transit",
          guide__date: "2023-10-01",
          guide__hour: "10:00 AM",
        },
      ],
    };
    const store = renderWithStore({
      guides: [mockGuide],
      modalData: { guideNumber: "12345", typeModal: "history" },
    });

    const tableData = [
      "12345",
      "In Transit",
      "Origin City",
      "Destination City",
      "Recipient Name",
    ];
    for (const data of tableData) {
      expect(screen.getByText(data)).toBeInTheDocument();
    }
  });
});
