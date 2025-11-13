import React from "react";
import { render, screen } from "@testing-library/react";
import FooterCopy from "../Footer/FooterCopy/index";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";

describe("FooterCopy", () => {
  beforeEach(() => {
    render(
      <ThemeProvider theme={Theme}>
        <FooterCopy />
      </ThemeProvider>
    );
  });

  it("should render the FooterCopy component", () => {
    const copyRigth = screen.getByText(
      /Copyright © 2025 Hound Express. Todos los derechos reservados./i
    );
    expect(copyRigth).toBeInTheDocument();
    expect(copyRigth).toHaveClass("footer__text");
    expect(copyRigth).toHaveRole("paragraph");
  });

  it("should render the terms and conditions link", () => {
    const termsLink = screen.getByText(/Términos y condiciones/i);
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveClass("footer__text--link");
    expect(termsLink).toHaveRole("link");
    expect(termsLink).toHaveAttribute("href", "#");
  });

  it("should render the privacy policy link", () => {
    const privacyLink = screen.getByText(/Política de privacidad/i);
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveClass("footer__text--link");
    expect(privacyLink).toHaveRole("link");
    expect(privacyLink).toHaveAttribute("href", "#");
  });
});
