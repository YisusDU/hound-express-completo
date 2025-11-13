import React from "react";
import Logo from "../../../assets/IMG/M6-imagotipo-Hound_Express/logoAzulBlancoHE.png";
import Facebook from "../../../assets/IMG/square-facebook-brands.svg";
import Instagram from "../../../assets/IMG/instagram-brands.svg";
import Twitter from "../../../assets/IMG/twitter-brands.svg";
import {
  FooterAboutContainer,
  FooterSocialMedia,
  FooterPicture,
  FooterSocialIcons,
  FooterDescription,
  FooterNavContainer,
  FooterNav,
} from "./styles";

const FooterAbout = () => {
  return (
    <FooterAboutContainer className="footer__about">
      <FooterSocialMedia className="footer__socialmedia" role="complementary">
        <FooterPicture className="footer__picture">
          <a href="index.html" rel="noopener" aria-label="Recargar página">
            <img
              className="footer__img"
              src={Logo}
              alt="Logotipo Hound Express"
              title="Recargar página"
            />
          </a>
          <FooterSocialIcons className="footer__socialIcons">
            <a
              href="#"
              rel="noopener nofollow noreferer"
              aria-label="Ir a Facebook de HoundExpress"
            >
              <img
                src={Facebook}
                alt="Icono facebook"
                className="Footer__socialImg"
                title="Facebook"
              />
            </a>
            <a
              href="#"
              rel="noopener nofollow noreferer"
              aria-label="Ir a Instagram de HoundExpress"
            >
              <img
                src={Instagram}
                alt="Icono instagram"
                className="Footer__socialImg"
                title="Instagram"
              />
            </a>
            <a
              href="#"
              rel="noopener nofollow noreferer"
              aria-label="Ir a Twitter de HoundExpress"
            >
              <img
                src={Twitter}
                alt="Icono twitter"
                className="Footer__socialImg"
                title="Twitter"
              />
            </a>
          </FooterSocialIcons>
        </FooterPicture>
        <FooterDescription className="footer__description">
          Somos un equipo de expertos en logística, tecnología y comercio
          internacional. Te queremos ayudar a llevar tu empresa al siguiente
          nivel con soluciones de importación, exportación y logística nacional
          e internacional.
        </FooterDescription>
      </FooterSocialMedia>
      <FooterNavContainer className="footer__navContainer">
        <h2 className="footer__title">Somos</h2>
        <h2 className="footer__title">Hound Express</h2>
        <FooterNav className="footer__nav">
          <ul>
            <li>
              <a
                className="footer__link"
                href="index.html"
                rel="noopener"
                aria-label="Ir a inicio"
                title="Ir a inicio"
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                className="footer__link"
                href="#guide__register"
                rel="noopener nofollow"
                aria-label="Ir a Registro de guías"
                title="Ir a Registro de guías"
              >
                Registro de Guías
              </a>
            </li>
            <li>
              <a
                className="footer__link"
                href="#general__state"
                rel="noopener nofollow"
                aria-label="Ir a Estado General"
                title="Ir a Estado General"
              >
                Estado General
              </a>
            </li>
            <li>
              <a
                className="footer__link"
                href="#guide__list"
                rel="noopener nofollow"
                aria-label="Ir a Lista de Guías"
                title="Ir a Lista de Guías"
              >
                Lista de Guías
              </a>
            </li>
            <li>
              <a
                className="footer__link"
                href="#"
                rel="noopener"
                aria-label="Ir a Buscar Guías"
                title="Ir a Buscar Guías"
              >
                🔍 Buscar Guías
              </a>
            </li>
            <li>
              <a
                className="footer__link"
                href="#"
                rel="noopener"
                aria-label="Ir a Historial de Guías"
                title="Ir a Historial de Guías"
              >
                Historial de Guías
              </a>
            </li>
          </ul>
        </FooterNav>
      </FooterNavContainer>
    </FooterAboutContainer>
  );
};

export default FooterAbout;
