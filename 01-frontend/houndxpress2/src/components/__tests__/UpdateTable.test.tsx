import React from "react";
import UpdateTable from "../Modals/ModalUpdate/UpdateTable";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { GuidesState } from "../../state/types";

describe("UpdateTable", () => {
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
          <UpdateTable />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  it("should render the UpdateTable component", () => {
    renderWithStore();
    const updateTable = screen.getByRole("table");
    expect(updateTable).toBeInTheDocument();
    expect(updateTable).toHaveClass("table__currentGuide");
  });

  it("should render the table header", () => {
    renderWithStore();
    const tableHeader = screen.getByText(/Número de guía/i);
    expect(tableHeader).toBeInTheDocument();
  });

  it("should render the table body with no data message", () => {
    renderWithStore();
    const noDataMessage = screen.getByText(/No hay valores para mostrar/i);
    expect(noDataMessage).toBeInTheDocument();
  });

  it("should render the table with current guide data", () => {
    const mockGuide = {
      guide__number: "12345",
      guide__origin: "Ciudad A",
      guide__destination: "Ciudad B",
      guide__recipient: "Juan Pérez",
      guide__stage: [
        {
          guide__status: "En tránsito",
          guide__date: "2023-10-01",
          guide__hour: "10:00",
        },
      ],
    };

    renderWithStore({
      guides: [mockGuide],
      modalData: { guideNumber: "12345", typeModal: "update" },
    });

    //Data should be rendered in the table
    const tableData = [
      "12345",
      "En tránsito",
      "Ciudad A",
      "Ciudad B",
      "Juan Pérez",
      "2023-10-01",
      "10:00",
    ];

    // Check if the table contains the data
    tableData.forEach((data) => {
      const cell = screen.getByText(data);
      expect(cell).toBeInTheDocument();
    });
  });
});
