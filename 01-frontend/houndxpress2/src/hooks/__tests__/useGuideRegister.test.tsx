import React from "react";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import guidesReducer, { addGuide } from "../../state/guides.slice";
import * as slice from "../../state/guides.slice";
import * as storeHooks from "../useStoreTypes";
import { useGuideRegister } from "../useGuideRegister";
import { GuidesState } from "../../state/types";
import { ReactNode } from "react";
import * as ValidateFields from "../useValidateFields";

// store of test
const renderWithStore = (overrides = {}) => {
  const defaultState: GuidesState = {
    guides: [],
    menuDisplay: false,
    modalData: { guideNumber: "", typeModal: "" },
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
  const { result } = renderHook(() => useGuideRegister(), { wrapper });
  return { store, result };
};
afterEach(() => {
  jest.restoreAllMocks();
});
describe("useGuideRegister hook", () => {
  it("should display an error into a existing guide number", () => {
    const { result } = renderWithStore({
      guides: [
        {
          guide__number: "12345678",
          guide__origin: "A",
          guide__destination: "B",
          guide__recipient: "C",
          guide__stage: [],
        },
      ],
    });
    // Simulate the form value with guide__number = "12345678"
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "guide__number";
    input.value = "12345678";
    form.appendChild(input);

    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleValidate(event);
    });

    expect(result.current.errors.guide__number).toBe(
      "El número de guía ya existe"
    );
  });

  it("should handle validate fields", () => {
    const { result, store } = renderWithStore();

    //validate all the fields aren´t empty
    const fieldValues = {
      guide__number: "99999999",
      guide__origin: "CDMX",
      guide__destination: "MTY",
      guide__recipient: "Juan Pérez",
      guide__date: "2024-07-01",
      guide__hour: "10:30",
      guide__status: "En tránsito",
    };

    const form = document.createElement("form");
    Object.entries(fieldValues).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Mock alert
    window.alert = jest.fn();

    //create the event
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    //Listen the event
    act(() => {
      result.current.handleValidate(event);
    });
    //Shouldn't have errors
    expect(result.current.errors).toEqual({});
    //should change the state
    expect(store.getState().guides.guides[0].guide__number).toBe("99999999");
    expect(window.alert).toHaveBeenCalledWith("Guía registrada con éxito");
  });

  it("should fail the validation", () => {
    const { result } = renderWithStore();

    // Simulate just one field to made it fail the anothers
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "guide__number";
    input.value = "12345678";
    form.appendChild(input);

    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleValidate(event);
    });
    //Add an expect for each
    const requiredFields = [
      "guide__origin",
      "guide__destination",
      "guide__recipient",
      "guide__date",
      "guide__hour",
      "guide__status",
    ];

    requiredFields.forEach((name) => {
      expect(result.current.errors).toHaveProperty(name);
    });
  });

  it("should dispatch addGuide with correct guideData", () => {
    //mock dispatch
    const dispatch = jest.fn();
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);
    //mock the addGuide reducer
    jest.spyOn(slice, "addGuide").mockImplementation((payload) => ({
      type: "guidesState/addGuide",
      payload,
    }));
    const { result } = renderWithStore();

    //validate all the fields aren´t empty
    const fieldValues = {
      guide__number: "99999999",
      guide__origin: "CDMX",
      guide__destination: "MTY",
      guide__recipient: "Juan Pérez",
      guide__date: "2024-07-01",
      guide__hour: "10:30",
      guide__status: "En tránsito",
    };

    const form = document.createElement("form");
    Object.entries(fieldValues).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Mock alert
    window.alert = jest.fn();

    //simulate the event
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleValidate(event);
    });

    // expected response
    const expectedGuideData = {
      guide__number: "99999999",
      guide__origin: "CDMX",
      guide__destination: "MTY",
      guide__recipient: "Juan Pérez",
      guide__stage: [
        {
          guide__date: "2024-07-01",
          guide__status: "En tránsito",
          guide__hour: "10:30",
        },
      ],
    };

    expect(dispatch).toHaveBeenCalledWith(slice.addGuide(expectedGuideData));
  });

  it("should dispatch addGuide with an empty values of guideData", () => {
    //mock dispatch
    const dispatch = jest.fn();
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);
    //mock the addGuide reducer
    jest.spyOn(slice, "addGuide").mockImplementation((payload) => ({
      type: "guidesState/addGuide",
      payload,
    }));
    const { result } = renderWithStore();

    //validate all the fields aren´t empty
    const fieldValues = {
      guide__number: "",
      guide__origin: "",
      guide__destination: "",
      guide__recipient: "",
      guide__date: "",
      guide__hour: "",
      guide__status: "",
    };

    const form = document.createElement("form");
    Object.entries(fieldValues).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Mock alert
    window.alert = jest.fn();

    //simulate the event
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    // simulate that the forms pass the validation
    jest.spyOn(ValidateFields, "default").mockReturnValue({ isValid: true });
    act(() => {
      result.current.handleValidate(event);
    });

    // expected response
    const expectedGuideData = {
      guide__number: "",
      guide__origin: "",
      guide__destination: "",
      guide__recipient: "",
      guide__stage: [
        {
          guide__date: "",
          guide__status: "",
          guide__hour: "",
        },
      ],
    };

    expect(dispatch).toHaveBeenCalledWith(slice.addGuide(expectedGuideData));
  });
});
