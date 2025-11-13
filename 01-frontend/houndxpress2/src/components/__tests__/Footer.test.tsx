import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";

describe("Footer", () => {
  beforeEach(() => {
    render(
      <ThemeProvider theme={Theme}>
        <Footer />
      </ThemeProvider>
    );
  });

  it("should render the Footer component", () => {
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
});
