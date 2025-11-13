import React from "react";
import Header from "../Header";
import { fireEvent, prettyDOM, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { GuidesState } from "../../state/types";

describe("Header component", () => {
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
    const utils = render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <Header />
        </ThemeProvider>
      </Provider>
    );
    return { store, ...utils };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the Header component", () => {
    renderWithStore();
    const header = screen.getByText("Inicio");
    expect(header).toBeInTheDocument();
  });

  it("should render the logo image", () => {
    renderWithStore();
    const logoImage = screen.getByAltText("Logotipo Hound Express");
    expect(logoImage).toBeInTheDocument();
  });

  it("should render the menu button", () => {
    renderWithStore();
    const menuButton = screen.getByAltText("Icono de menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("should render the close menu button", () => {
    renderWithStore();
    const menuButton = screen.getByAltText("Icono de menu");
    fireEvent.click(menuButton);
    const closeButton = screen.getByAltText("Icono de cerrar menu");
    expect(closeButton).toBeInTheDocument();
  });

  it("should render the navigation links", () => {
    renderWithStore();
    const navLinks = [
      "Inicio",
      "Registro de Guías",
      "Estado General",
      "Lista de Guías",
      "🔍 Buscar Guías",
      "Historial de Guías",
    ];
    navLinks.forEach((linkText) => {
      const link = screen.getByText(linkText);
      expect(link).toBeInTheDocument();
    });
  });

  it("should toogle the menu display when the menu button is clicked", () => {
    renderWithStore();
    const linksContainer = screen.getByText(/inicio/i).parentNode?.parentNode;
    const menuButton = screen.getByAltText("Icono de menu");

    // Initially, the menu should be hidden
    expect(linksContainer).toHaveClass("hidde");

    // Click the menu button to show the menu
    fireEvent.click(menuButton);
    expect(linksContainer).not.toHaveClass("hidde");
    const closeButton = screen.getByAltText("Icono de cerrar menu");

    // Click the close button to hide the menu
    fireEvent.click(closeButton);
    expect(linksContainer).toHaveClass("hidde");
  });

  it("should render the header with fixed class when menuDisplay is true", () => {
    renderWithStore({ menuDisplay: true });
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("fixed");
  });

  it("should not have fixed class when menuDisplay is false", () => {
    renderWithStore({ menuDisplay: false });
    const header = screen.getByRole("banner");
    expect(header).not.toHaveClass("fixed");
  });

  it("should close the menu when Escape key is pressed", () => {
    renderWithStore();
    const menuButton = screen.getByAltText("Icono de menu");
    fireEvent.click(menuButton); // Open menu
    expect(screen.getByAltText("Icono de cerrar menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByAltText("Icono de menu")).toBeInTheDocument(); // Menu is closed
  });

  it("should clean up the Escape key event listener on unmount", () => {
    const { unmount } = renderWithStore();
    const menuButton = screen.getByAltText("Icono de menu");
    fireEvent.click(menuButton);
    unmount();
  });

  it("should cycle focus with Tab and Shift+Tab in the menu", () => {
    renderWithStore();
    const menuButton = screen.getByAltText("Icono de menu");
    fireEvent.click(menuButton);
    // Select all focusable elements: links and the close button
    const container = screen.getByRole("navigation");
    const focusable = Array.from(
      container.querySelectorAll("a[href], button:not([disabled])")
    ) as HTMLElement[];
    focusable[0].focus();
    // Tab from last goes to first
    focusable[focusable.length - 1].focus();
    const linksContainer = document.getElementById("header__linksContainer");
    expect(linksContainer).not.toBeNull();
    fireEvent.keyDown(linksContainer as HTMLElement, { key: "Tab" });
    expect(document.activeElement).toBe(focusable[0]);
    // Shift+Tab from first goes to last
    focusable[0].focus();
    fireEvent.keyDown(linksContainer as HTMLElement, {
      key: "Tab",
      shiftKey: true,
    });
    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });

  it("should close the menu on link click", () => {
    renderWithStore();
    const menuButton = screen.getByAltText("Icono de menu");
    fireEvent.click(menuButton);
    const link = screen.getByText("Registro de Guías");
    fireEvent.click(link);
    expect(screen.getByAltText("Icono de menu")).toBeInTheDocument();
  });
});
