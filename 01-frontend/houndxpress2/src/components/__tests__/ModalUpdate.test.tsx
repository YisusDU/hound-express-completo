import React from "react";
import ModalUpdate from "../Modals/ModalUpdate";
import { fireEvent, prettyDOM, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { GuidesState } from "../../state/types";

describe("ModalUpdate component", () => {
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
          <ModalUpdate />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  //Renders
  it("should render the ModalUpdate component", () => {
    renderWithStore();
    const modalUpdate = screen.getByText(/Actualizar estado del envío/i);
    expect(modalUpdate).toBeInTheDocument();
  });

  it("should render the img closebutton", () => {
    renderWithStore();
    const closeButton = screen.getByAltText("close--modal");
    expect(closeButton).toBeInTheDocument();
  });

  it("should render the table", () => {
    renderWithStore();
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass("table__currentGuide");
  });

  it("should render the form", () => {
    renderWithStore();
    const newStatelabel = screen.getByText(/Nuevo estado/i, {
      selector: "label",
    });
    const newStateInput = screen.getByTitle(
      "Selecciona el estado actualizado del envío"
    );
    expect(newStatelabel).toBeInTheDocument();
    expect(newStateInput).toBeInTheDocument();
  });

  //Test the close button functionality
  it("should call cleanGuideData when close button is clicked", () => {
    const mockModalData = {
      guideNumber: "123456",
      typeModal: "update",
    };
    const mockGuide = [
      {
        guide__number: "123456",
        guide__origin: "Ciudad A",
        guide__destination: "Ciudad B",
        guide__recipient: "Juan Perez",
        guide__stage: [
          {
            guide__status: "Entregado",
            guide__date: "2024-06-24",
            guide__hour: "10:00",
          },
        ],
      },
    ];

    renderWithStore({
      modalData: mockModalData,
      guides: mockGuide,
    });
    const Xicon = screen.getByAltText("close--modal");
    //Check if the modal data is displayed
    const deliveredMessage = screen.getByText(
      /Tu envío ya fue entregado, no es posible actualizar su estado/i
    );

    //Clean the modal
    fireEvent.click(Xicon);
    expect(deliveredMessage).not.toBeInTheDocument();
    const emptyModal = screen.getByText(/No hay valores para mostrar/i);
    expect(emptyModal).toBeInTheDocument();
  });

  it("should have the class hiddeModal when modalData.typeModal is not 'update'", () => {
    // Render the component with a different typeModal
    const store = renderWithStore({
      modalData: { guideNumber: "", typeModal: "other" },
    });
    const modalUpdate = screen.getByText(/Actualizar estado del envío/i);
    expect(modalUpdate?.parentNode).toHaveClass("hiddeModal");
  });

  it("should not to have the class hiddeModal when modalData.typeModal is 'update'", () => {
    //Render the component with typeModal 'update'
    renderWithStore({
      modalData: { guideNumber: "", typeModal: "Update" },
    });
    const modalUpdateVisible = screen.getByText(/Actualizar estado del envío/i);
    expect(modalUpdateVisible?.parentNode).toHaveClass("table__modal--Update");
    expect(modalUpdateVisible?.parentNode).not.toHaveClass("hiddeModal");
  });
});
