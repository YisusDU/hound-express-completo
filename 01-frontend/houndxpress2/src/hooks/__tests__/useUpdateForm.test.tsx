import React, { act, ReactNode } from "react";
import { GuidesState } from "../../state/types";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer from "../../state/guides.slice";
import { Provider } from "react-redux";
import { renderHook } from "@testing-library/react";
import { useUpdateForm } from "../useUpdateForm";
import * as storeHooks from "../useStoreTypes";
import * as slice from "../../state/guides.slice";
import * as validateFieldsModule from "../useValidateFields";

// store of test
const renderWithStore = (overrides = {}) => {
  const defaultState: GuidesState = {
    guides: [
      {
        guide__number: "12345678",
        guide__origin: "Detroit",
        guide__destination: "Atlanta",
        guide__recipient: "Rick",
        guide__stage: [
          {
            guide__date: "2025-05-25",
            guide__status: "Pendiente",
            guide__hour: "12:34",
          },
        ],
      },
    ],
    menuDisplay: false,
    modalData: { guideNumber: "12345678", typeModal: "Update" },
  };
  const store = configureStore({
    reducer: { guides: guidesReducer },
    preloadedState: {
      guides: { ...defaultState, ...overrides },
    },
  });

  // Wrapper for renderHook
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useUpdateForm(), { wrapper });
  return { store, result };
};
afterEach(() => {
  jest.restoreAllMocks();
});

describe("useUpdateForm hook", () => {
  it("should validate the empty fields and add errors", () => {
    const { result } = renderWithStore();
    //Mock some empty fields
    const mockFields = {
      guide__date: "",
      guide__hour: "",
      guide__status: "",
    };

    //Create a form and inputs
    const form = document.createElement("form");
    Object.entries(mockFields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    //create the event
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    //Listen the event
    act(() => {
      result.current.handleValidate(event);
    });
    expect(result.current.errors).toEqual({
      guide__date: "Este campo es obligatorio",
      guide__hour: "Este campo es obligatorio",
      guide__status: "Este campo es obligatorio",
    });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("should not dispatch and should show errors if fields are empty", () => {
    const dispatch = jest.fn();
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);

    const { result } = renderWithStore();

    const form = document.createElement("form");
    ["guide__date", "guide__hour", "guide__status"].forEach((name) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = "";
      form.appendChild(input);
    });

    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleValidate(event);
    });

    expect(result.current.errors).toEqual({
      guide__date: "Este campo es obligatorio",
      guide__hour: "Este campo es obligatorio",
      guide__status: "Este campo es obligatorio",
    });
    expect(event.preventDefault).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should validate the fields with correct data", () => {
    const { result, store } = renderWithStore();

    //Mock some fiels
    const mockFields = {
      guide__date: "2024-07-01",
      guide__hour: "10:30",
      guide__status: "En tránsito",
    };

    //Create a form and inputs
    const form = document.createElement("form");
    Object.entries(mockFields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    //mock the alert
    window.alert = jest.fn();

    //simulate the event
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;
    act(() => {
      result.current.handleValidate(event);
    });
    const updatedGuide = store.getState().guides.guides[0].guide__stage;
    expect(result.current.errors).toEqual({});
    expect(updatedGuide).toContainEqual({
      guide__date: "2024-07-01",
      guide__hour: "10:30",
      guide__status: "En tránsito",
    });
  });

  it("should dispatch updateGuide with the correct data", () => {
    //mock dispatch
    const dispatch = jest.fn();
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);
    //mock the addGuide reducer
    jest.spyOn(slice, "updateGuide").mockImplementation((payload) => ({
      type: "guidesState/updateGuide",
      payload,
    }));
    const { result } = renderWithStore();

    //Mock some fiels
    const mockFields = {
      guide__date: "2024-07-01",
      guide__hour: "10:30",
      guide__status: "En tránsito",
    };

    //Create a form and inputs
    const form = document.createElement("form");
    //mock form.reset
    form.reset = jest.fn();

    Object.entries(mockFields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    //mock the alert
    window.alert = jest.fn();

    //simulate the event
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    //mock handlevalidate on true
    jest
      .spyOn(validateFieldsModule, "default")
      .mockReturnValue({ isValid: true });
    act(() => {
      result.current.handleValidate(event);
    });

    //expected newStage
    const newStage = {
      guide__date: "2024-07-01",
      guide__hour: "10:30",
      guide__status: "En tránsito",
    };

    expect(dispatch).toHaveBeenLastCalledWith(slice.updateGuide(newStage));
    expect(window.alert).toHaveBeenCalledWith("Guía registrada con éxito");
    expect(form.reset).toHaveBeenCalled();
  });
});
