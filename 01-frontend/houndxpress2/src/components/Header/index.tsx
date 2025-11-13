import React, {
  useState,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import logoHeader from "../../assets/IMG/M6-imagotipo-Hound_Express/logo-Hound_Express-bg-white.png";
import buttonShow from "../../assets/IMG/bars-solid.svg";
import buttonHidde from "../../assets/IMG/x-solid.svg";
import { useAppSelector } from "../../hooks/useStoreTypes";
import {
  HeaderContainer,
  HeaderBottom,
  HeaderNav,
  HeaderIcons,
  HeaderLinksContainer,
} from "./styles";

const Header = forwardRef<HTMLElement>(({}, ref) => {
  /* ------------Banner */
  // State to manage the visibility of the menu
  const [openMenu, setOpenMenu] = useState(false);

  //Redux state
  const menuDisplay = useAppSelector((state) => state.guides.menuDisplay);

  //Close with key scape for accesibility
  useEffect(() => {
    if (!openMenu) return;

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [openMenu]);

  //Close menu at click on link
  const handleLinkClick = () => {
    setOpenMenu(false);
  };

  //Make a focus trap for the links container
  const linksContainerRef = useRef<HTMLUListElement>(null);
  const [focusableEls, setFocusableEls] = useState<HTMLElement[]>([]);

  useEffect(() => {
    if (!openMenu) return;
    const container = linksContainerRef.current;
    if (!container) return;
    const selectors = "a[href], button:not([disabled])";
    const elements = Array.from(container.querySelectorAll<HTMLElement>(selectors));
    setFocusableEls(elements);
    if (elements.length) elements[0].focus();
  }, [openMenu]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "Tab" || focusableEls.length === 0) return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <HeaderContainer
      role="banner"
      ref={ref}
      className={`header ${menuDisplay ? "fixed" : ""}`}
      id="start"
    >
      <section className="header__top">
        <a
          href="index.html"
          rel="noopener"
          aria-label="Recargar página"
          role="link"
          title="Recargar página"
        >
          <img
            className="header__logo"
            src={logoHeader}
            alt="Logotipo Hound Express"
          />
        </a>
      </section>
      <HeaderBottom className="header__bottom">
        <HeaderNav className="header__nav" ref={linksContainerRef}>
          <HeaderIcons className={`header__show ${openMenu ? "hidde" : ""}`}>
            {openMenu ? (
              <button
                className="header__menuButton--hidde hidde"
                onClick={() => setOpenMenu(false)}
                type="button"
                role="button"
                aria-label="Cerrar menu"
                aria-haspopup="dialog"
                aria-expanded="true"
                aria-controls="header__linksContainer"
                title="Cerrar menu"
              >
                <img
                  src={buttonHidde}
                  aria-hidden="true"
                  alt="Icono de cerrar menu"
                />
              </button>
            ) : (
              <button
                className="header__menuButton--show"
                onClick={() => setOpenMenu(true)}
                type="button"
                role="button"
                aria-label="Abrir menu"
                aria-haspopup="dialog"
                aria-expanded="false"
                aria-controls="header__linksContainer"
                title="Abrir menu"
              >
                <img src={buttonShow} aria-hidden="true" alt="Icono de menu" />
              </button>
            )}
          </HeaderIcons>
          <HeaderLinksContainer
            id="header__linksContainer"
            className={`header__linksContainer ${openMenu ? "" : "hidde"}`}
            onKeyDown={openMenu ? handleKeyDown : undefined}
          >
            <li>
              <a
                className="header__link"
                href="index.html"
                rel="noopener"
                onClick={handleLinkClick}
                aria-label="Ir a inicio"
                title="Ir a inicio"
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                className="header__link"
                href="#guide__register"
                rel="noopener nofollow"
                onClick={handleLinkClick}
                aria-label="Ir a Registro de guías"
                title="Ir a Registro de guías"
              >
                Registro de Guías
              </a>
            </li>
            <li>
              <a
                className="header__link"
                href="#general__state"
                rel="noopener nofollow"
                onClick={handleLinkClick}
                aria-label="Ir a Estado General"
                title="Ir a Estado General"
              >
                Estado General
              </a>
            </li>
            <li>
              <a
                className="header__link"
                href="#guide__list"
                rel="noopener nofollow"
                onClick={handleLinkClick}
                aria-label="Ir a Lista de Guías"
                title="Ir a Lista de Guías"
              >
                Lista de Guías
              </a>
            </li>
            <li>
              <a
                className="header__link"
                href="#"
                rel="noopener"
                onClick={handleLinkClick}
                aria-label="Ir a Buscar Guías"
                title="Ir a Buscar Guías"
              >
                🔍 Buscar Guías
              </a>
            </li>
            <li>
              <a
                className="header__link"
                href="#"
                rel="noopener"
                onClick={handleLinkClick}
                aria-label="Ir a Historial de Guías"
                title="Ir a Historial de Guías"
              >
                Historial de Guías
              </a>
            </li>

            <div className="header__lineDecorative" aria-hidden="true"></div>
          </HeaderLinksContainer>
        </HeaderNav>
      </HeaderBottom>
    </HeaderContainer>
  );
});

export default Header;
