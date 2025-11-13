import React from "react";
import App from "../App";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { GuidesState } from "../../state/types";

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
        <App />
      </ThemeProvider>
    </Provider>
  );
  return store;
};

describe("App component", () => {
  it("should render the header", () => {
    renderWithStore();
    const header = screen.getAllByText("Inicio");
    expect(header[0]).toBeInTheDocument();
  });

  it("should render the main", () => {
    renderWithStore();
    const main = screen.getAllByRole("main");
    expect(main).toBeInTheDocument;
  });

  it("should render the banner", () => {
    renderWithStore();
    expect(
      screen.getByAltText("Hound Express te acompaña, mensajería y envíos.")
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Hound Express con cobertura en EU")
    ).toBeInTheDocument();
  });

  it("should render GuideRegister", () => {
    renderWithStore();
    const guideRegister = screen.getByText("Registro de guías");
    expect(guideRegister).toBeInTheDocument();
  });

  it("should render the GeneralState", () => {
    renderWithStore();
    const generalState = screen.getByText("Estado general");
    expect(generalState).toBeInTheDocument();
  });

  it("should render the GuideList", () => {
    renderWithStore();
    const guideList = screen.getByText("Lista de guías");
    expect(guideList).toBeInTheDocument();
  });

  it("should render the Footer component", () => {
    renderWithStore();
    //Render the first child of the Footer component
    const firstChild = screen.getByText(/Somos un equipo/i);
    expect(firstChild.parentNode?.parentNode).toHaveClass("footer__about");
    expect(firstChild.parentNode?.parentNode).not.toHaveClass(
      "footer__socialmedia"
    );

    //Render the second child of the Footer component
    const secondChild = screen.getByText(
      /Copyright © 2025 Hound Express. Todos los derechos reservados./i
    );
    expect(secondChild).toBeInTheDocument();
    expect(secondChild).toHaveClass("footer__text");
    expect(secondChild).toHaveRole("paragraph");
  });

  it("should render the ModalHistory ", () => {
    renderWithStore();
    const modalTitle = screen.getByText("Historial de envío");
    expect(modalTitle).toBeInTheDocument();
  });

  it("should render the ModalUpdate", () => {
    renderWithStore();
    const modalUpdate = screen.getByText(/Actualizar estado del envío/i);
    expect(modalUpdate).toBeInTheDocument();
  });
});
