import React from "react";
import GeneralState from "../GeneralState";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { GuidesState } from "../../state/types";

describe("GeneralState", () => {
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
          <GeneralState />
        </ThemeProvider>
      </Provider>
    );
    return store;
  };

  it("should render the GeneralState component", () => {
    renderWithStore();
    const generalState = screen.getByText("Estado general");
    expect(generalState).toBeInTheDocument();
  });

  it("should render the three state elements", () => {
    renderWithStore();
    const activeGuides = screen.getByText(/Guías activas/i);
    const transitGuides = screen.getByText(/Guías en tránsito/i);
    const deliveredGuides = screen.getByText(/Guías entregadas/i);

    expect(activeGuides).toBeInTheDocument();
    expect(transitGuides).toBeInTheDocument();
    expect(deliveredGuides).toBeInTheDocument();
  });

  it("should render the gif image", () => {
    jest.mock(
      "../../assets/IMG/Animacion-beneficios-sistema-v2.gif",
      () => "Animacion-beneficios-sistema-v2.gif"
    );
    renderWithStore();
    const gifImage = screen.getByAltText(
      /Almacenamiento, envío y rastreo por Hound Expres/i
    );
    expect(gifImage).toBeInTheDocument();
  });

  it("shows 0 when there are no guides", () => {
    renderWithStore({ guides: [] });
    expect(screen.getByTestId("totalGuidesActive").textContent).toBe("0");
  });

  it("shows the correct number with many guides", () => {
    const manyGuides = Array.from({ length: 10000 }, () => ({
      guide__stage: [],
    }));
    renderWithStore({ guides: manyGuides });
    expect(screen.getByTestId("totalGuidesActive").textContent).toBe("10000");
  });

  it("shows the correct number of active guides", () => {
    const activeGuides = [
      { guide__stage: [{ guide__status: "Pendiente" }] },
      { guide__stage: [{ guide__status: "En tránsito" }] },
      { guide__stage: [{ guide__status: "Entregado" }] },
    ];
    renderWithStore({ guides: activeGuides });
    expect(screen.getByTestId("totalGuidesActive").textContent).toBe("2");
  });

  it("shows the correct number of guides in transit", () => {
    const transitGuides = [
      { guide__stage: [{ guide__status: "En tránsito" }] },
      { guide__stage: [{ guide__status: "Pendiente" }] },
    ];
    renderWithStore({ guides: transitGuides });
    expect(screen.getByTestId("onTransitGuides").textContent).toBe("1");
  });

  it("shows the correct number of delivered guides", () => {
    const deliveredGuides = [
      { guide__stage: [{ guide__status: "Entregado" }] },
      { guide__stage: [{ guide__status: "Pendiente" }] },
    ];
    renderWithStore({ guides: deliveredGuides });
    expect(screen.getByTestId("deliveredGuides").textContent).toBe("1");
  });
});
