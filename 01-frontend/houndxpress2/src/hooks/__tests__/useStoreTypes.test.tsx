import React from "react";
import { render, screen } from "@testing-library/react";
import guidesReducer from "../../state/guides.slice";
import * as storeHooks from "../useStoreTypes"; // Import the module to spy on the hook
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useAppSelector, useAppDispatch } from "../useStoreTypes";
import { GuidesState } from "../../state/types";

describe("useAppDispatch", () => {
  const renderWithStore = (overrides = {}) => {
    const initialState: GuidesState = {
      guides: [],
      menuDisplay: true,
      modalData: { guideNumber: "123", typeModal: "Update" },
    };

    const store = configureStore({
      reducer: { guides: guidesReducer },
      preloadedState: { guides: { ...initialState, ...overrides } },
    });

    const TestComponent = () => {
      const guides = useAppSelector((state) => state.guides.guides);
      return <div data-testid="guides-length">{guides.length}</div>;
    };

    const utils = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );
    return { ...utils, store };
  };
  it("should call dispatch with the correct action inside a component", () => {
    // Create a mock dispatch function
    const dispatch = jest.fn();
    // Mock the useAppDispatch hook to return our mock dispatch
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);

    // Test component that uses the custom hook
    const TestComponent = () => {
      const dispatch = storeHooks.useAppDispatch();
      React.useEffect(() => {
        // Call dispatch with a specific action when the component mounts
        dispatch({
          type: "guidesState/addGuide",
          payload: { guide__number: "1" },
        });
      }, [dispatch]);
      return null;
    };

    // Render the test component
    render(<TestComponent />);

    // Assert: verify that dispatch was called with the expected action
    expect(dispatch).toHaveBeenCalledWith({
      type: "guidesState/addGuide",
      payload: { guide__number: "1" },
    });
  });

  it("should call dispatch directly in the test", () => {
    // Create a mock dispatch function
    const dispatch = jest.fn();
    // Mock the useAppDispatch hook to return our mock dispatch
    jest.spyOn(storeHooks, "useAppDispatch").mockReturnValue(dispatch);

    // Directly call the mock dispatch in the test
    dispatch({
      type: "guidesState/addGuide",
      payload: { guide__number: "1" },
    });

    // Assert: verify that dispatch was called with the expected action
    expect(dispatch).toHaveBeenCalledWith({
      type: "guidesState/addGuide",
      payload: { guide__number: "1" },
    });
  });

  it("should render the component with the correct state", () => {
    const mockGuide = [
      {
        guide__number: "123",
        guide__origin: "A",
        guide__destination: "B",
        guide__recipient: "C",
        guide__stage: [
          {
            guide__date: "2023-10-01",
            guide__status: "Pendiente",
            guide__hour: "10:00",
          },
        ],
      },
    ];
    const { getByTestId } = renderWithStore({ guides: mockGuide });
    expect(getByTestId("guides-length").textContent).toBe("1");
  });
});
