import React, { useEffect, useState } from "react";
import BannerCanva from "../../assets/IMG/bannerCanva-HX.png";
import BannerLogistics from "../../assets/IMG/bannerUS__HX.png";
import {
  BannerContainer,
  CarouselContainer,
  CarouselImages,
  CarouselNav,
} from "./styles";

const Banner = () => {
  //Capture the input radio position
  const [position, setPosition] = useState<"left" | "right">("left");

  //Function to listen the scroll event and change the position of the carousel
  useEffect(() => {
    /* console.log("Position changed:", position); */
  }, [position]);

  return (
    /* <!--Banner--> */
    <BannerContainer className="banner">
      <CarouselContainer className="carousel">
        <CarouselImages className="carousel__images" $position={position}>
          <section className="carousel__element">
            <img
              className="banner__img"
              src={BannerCanva}
              alt="Hound Express te acompaña, mensajería y envíos."
            />
          </section>
          <section className="carousel__element">
            <img
              className="banner__img"
              src={BannerLogistics}
              alt="Hound Express con cobertura en EU"
            />
          </section>
        </CarouselImages>
        <CarouselNav className="carousel__nav" $position={position}>
          <button
            onClick={() => setPosition("left")}
            tabIndex={0}
            role="button"
            aria-label={`${
              position === "left" ? "Prohibido" : ""
            } Desplazar carrusel a la izquierda`}
            title={`${
              position === "left" ? "Prohibido" : ""
            } Desplazar carrusel a la izquierda`}
          >
            ⬅️
          </button>
          <button
            onClick={() => setPosition("right")}
            tabIndex={0}
            role="button"
            aria-label={`${
              position === "right" ? "Prohibido" : ""
            } Desplazar carrusel a la derecha`}
            title={`${
              position === "right" ? "Prohibido" : ""
            } Desplazar carrusel a la derecha`}
          >
            ➡️
          </button>
        </CarouselNav>
      </CarouselContainer>
    </BannerContainer>
  );
};

export default Banner;
