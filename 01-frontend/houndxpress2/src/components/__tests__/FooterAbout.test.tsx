import React from "react";
import FooterAbout from "../Footer/FooterAbout";
import { render, screen } from "@testing-library/react";
import Logo from "../../../assets/IMG/M6-imagotipo-Hound_Express/logoAzulBlancoHE.png";
import Facebook from "../../../assets/IMG/square-facebook-brands.svg";
import Instagram from "../../../assets/IMG/instagram-brands.svg";
import Twitter from "../../../assets/IMG/twitter-brands.svg";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme";

//Mock the images
jest.mock(
  "../../assets/IMG/M6-imagotipo-Hound_Express/logoAzulBlancoHE.png",
  () => "imagotipo-Hound_Express"
);
jest.mock("../../assets/IMG/square-facebook-brands.svg", () => "facebook");
jest.mock("../../assets/IMG/instagram-brands.svg", () => "instagram");
jest.mock("../../assets/IMG/twitter-brands.svg", () => "twitter");

describe("FooterAbout component", () => {
  beforeEach(() => {
    render(
      <ThemeProvider theme={Theme}>
        <FooterAbout />
      </ThemeProvider>
    );
  });

  it("should render the FooterAbout component", () => {
    const component = screen.getByText(/Somos un equipo/i);
    expect(component.parentNode?.parentNode).toHaveClass("footer__about");
    expect(component.parentNode?.parentNode).not.toHaveClass(
      "footer__socialmedia"
    );
  });

  it("should render the images and icons", () => {
    expect(screen.getByAltText("Logotipo Hound Express")).toBeInTheDocument();
    expect(screen.getByAltText("Icono facebook")).toBeInTheDocument();
    expect(screen.getByAltText("Icono instagram")).toBeInTheDocument();
    expect(screen.getByAltText("Icono twitter")).toBeInTheDocument();
  });

  it("should render FooterPicture container", () => {
    const imgRef = screen.getByAltText("Logotipo Hound Express");
    expect(imgRef.parentNode?.parentNode).toHaveClass("footer__picture");
  });

  it("should render footer__titles", () => {
    const titleRef = screen.getAllByRole("heading", { level: 2 });
    expect(titleRef[0]).toHaveTextContent(/somos/i);
    expect(titleRef[0]).toHaveClass("footer__title");

    expect(titleRef[1]).toHaveTextContent(/hound express/i);
    expect(titleRef[1]).toHaveClass("footer__title");
  });

  it("should navigate to the correct URL when clicking on the icons", () => {
    const imgRef = screen.getByAltText("Logotipo Hound Express");
    expect(imgRef.parentNode).toHaveAttribute("href", "index.html");

    //A inicio
    const startLink = screen.getByText(/inicio/i);
    expect(startLink).toHaveRole("link");
    expect(startLink).toHaveAttribute("href", "index.html");

    //A registro de guías
    const registerLink = screen.getByText(/registro de guías/i);
    expect(registerLink).toHaveRole("link");
    expect(registerLink).toHaveAttribute("href", "#guide__register");

    //A estado general
    const generalLink = screen.getByText(/estado general/i);
    expect(generalLink).toHaveRole("link");
    expect(generalLink).toHaveAttribute("href", "#general__state");

    //A lista de guías
    const listLink = screen.getByText(/lista de guías/i);
    expect(listLink).toHaveRole("link");
    expect(listLink).toHaveAttribute("href", "#guide__list");

    //A buscar guías
    const searchLink = screen.getByText(/buscar guías/i);
    expect(searchLink).toHaveRole("link");
    expect(searchLink).toHaveAttribute("href", "#");

    //A historial de guías
    const historyLink = screen.getByText(/historial de guías/i);
    expect(historyLink).toHaveRole("link");
    expect(historyLink).toHaveAttribute("href", "#");
  });
});
