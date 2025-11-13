import React, { act } from "react";
import { useModalGuides } from "../useModalGuides";
import { changeModalData } from "../../state/guides.slice";
import { GuidesState } from "../../state/types";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { renderHook } from "@testing-library/react";
import * as storeHooks from "../useStoreTypes";
import * as slice from "../../state/guides.slice";

//store of test
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
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useModalGuides(), { wrapper });
  return { store, result };
};
afterEach(() => {
  jest.restoreAllMocks();
});

describe("useModalGuides hook", () => {
  it("should clean the modalData on calling", () => {
    const { result, store } = renderWithStore({
      modalData: { guidesReducer: "12345678", typeModal: "History" },
    });

    //Activate the function
    act(() => {
      result.current.cleanGuideData();
    });

    const storeCleaned = store.getState().guides.modalData;
    expect(storeCleaned).toEqual({ guideNumber: "", typeModal: "" });
  });

  it("should dispatch changeModalData with empty values", () => {
    //mock dispatch
    const dispatch = jest.fn();
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);

    const { result } = renderWithStore();

    result.current.cleanGuideData();
    expect(dispatch).toHaveBeenCalledWith(
      changeModalData({ guideNumber: "", typeModal: "" })
    );
  });
});
