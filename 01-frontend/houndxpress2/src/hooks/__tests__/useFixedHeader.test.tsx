import React, { act, useRef } from "react";
import { render } from "@testing-library/react";
import useFixedHeader from "../useFixedHeader";
import * as storeHooks from "../useStoreTypes"; //import all to mock them
import { GuidesState } from "../../state/types";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { Provider } from "react-redux";

describe("useFixedHeader", () => {
  const defaultState: GuidesState = {
    guides: [],
    menuDisplay: false,
    modalData: { guideNumber: "", typeModal: "" },
  };

  const renderWithStore = (overrides = {}) => {
    //store
    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: {
        guides: { ...defaultState, ...overrides },
      },
    });
    //render
    const headerRef = { current: document.createElement("header") };
    const mainRef = { current: document.createElement("main") };

    const TestComponent = () => {
      useFixedHeader({ headerRef, mainRef });
      return null;
    };
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );
    return store;
  };

  it("should dispatch true on toggleMenu on scroll", () => {
    const store = renderWithStore();
    act(() => {
      window.scrollY = 200;
      window.dispatchEvent(new Event("scroll"));
    });
    const storeTest = store.getState();
    expect(storeTest.guides.menuDisplay).toBe(true);
  });

  it("should dispatch false on toggleMenu on scroll", () => {
    const store = renderWithStore({ menuDisplay: true });
    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event("scroll"));
    });
    const storeTest = store.getState();
    expect(storeTest.guides.menuDisplay).toBe(false);
  });

  it("shouldn't to break into a error if mainRef.current is null", () => {
    const defaultState: GuidesState = {
      guides: [],
      menuDisplay: false,
      modalData: { guideNumber: "", typeModal: "" },
    };
    //store
    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: {
        guides: { ...defaultState },
      },
    });
    //render
    const headerRef = { current: document.createElement("header") };
    const mainRef = { current: null };

    const TestComponent = () => {
      useFixedHeader({ headerRef, mainRef });
      return null;
    };
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    //Tests
    expect(() =>
      render(
        <Provider store={store}>
          <TestComponent />
        </Provider>
      )
    ).not.toThrow();
  });

  it("should to add an margin-top of 50 on scroll", () => {
    const defaultState: GuidesState = {
      guides: [],
      menuDisplay: true, //we need this on true to activate the 2º useEffect
      modalData: { guideNumber: "", typeModal: "" },
    };
    //store
    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: {
        guides: { ...defaultState },
      },
    });
    //render
    const headerRef = { current: document.createElement("header") };
    const mainRef = { current: document.createElement("main") };

    // Simulate header height
    Object.defineProperty(headerRef.current, "offsetHeight", {
      configurable: true,
      get: () => 50,
    });

    const TestComponent = () => {
      useFixedHeader({ headerRef, mainRef });
      return null;
    };

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    //simulate scroll to activate the change
    window.scrollY = 200;
    window.dispatchEvent(new Event("scroll"));

    //Test
    const main = mainRef.current.style.marginTop;
    expect(main).toBe("50px");
  });
});
