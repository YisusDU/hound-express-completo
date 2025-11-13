import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import Banner from "../Banner/index";
import { ThemeProvider } from "styled-components";
import Theme from "../../theme/index";

//mocks
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

const setPositionMock = jest.fn();

describe("Banner component", () => {
  beforeEach(() => {
    (React.useState as jest.Mock).mockImplementationOnce((init) => [
      init,
      setPositionMock,
    ]);
    render(
      <ThemeProvider theme={Theme}>
        <Banner />
      </ThemeProvider>
    );
  });

  it("renders the images of the carrusel", () => {
    //We mock the imgs to avoid errors
    jest.mock(
      "../../assets/IMG/bannerCanva-HX.png",
      () => "bannerCanva-HX.png"
    );
    jest.mock("../../assets/IMG/bannerUS__HX.png", () => "bannerUS__HX.png");
    expect(
      screen.getByAltText("Hound Express te acompaña, mensajería y envíos.")
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Hound Express con cobertura en EU")
    ).toBeInTheDocument();
  });

  it("renders the buttons of the carrusel", () => {
    expect(screen.getByText("⬅️")).toBeInTheDocument();
    expect(screen.getByText("➡️")).toBeInTheDocument();
  });

  it("should to call the funtion when the button is clicked", () => {
    const leftButton = screen.getByText("⬅️");
    const rightButton = screen.getByText("➡️");

    //Verify the function of the buttons
    fireEvent.click(leftButton);
    expect(setPositionMock).toHaveBeenCalledTimes(1);
    expect(setPositionMock).toHaveBeenCalledWith("left");
    fireEvent.click(rightButton);
    expect(setPositionMock).toHaveBeenCalledTimes(2);
    expect(setPositionMock).toHaveBeenCalledWith("right");
  });
});
