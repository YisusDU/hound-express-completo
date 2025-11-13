import { useCleanErrorOnFocus } from "../useCleanErrorOnFocus";

describe("useCleanErrorOnFocus", () => {
  it("should clean the error for the focused field", () => {
    const errors = { guide__date: "Campo requerido", guide__hour: "" };
    const setErrors = jest.fn();
    const handler = useCleanErrorOnFocus(errors, setErrors);

    //Simulate the focus event
    const event = {
      target: { name: "guide__date" },
    } as React.FocusEvent<HTMLInputElement>;

    //apply the event to the hook
    handler(event);
    expect(setErrors).toHaveBeenCalled();

    // Simulate the call back to see the error has cleared
    const prev = { ...errors };
    const result = (setErrors.mock.calls[0][0] as Function)(prev);
    expect(result).toEqual({ guide__date: "", guide__hour: "" });
  });

  it("should not to call setErros if there is no error for the field", () => {
    const errors = { guide__date: "", guide__hour: "" };
    const setErrors = jest.fn();
    const handler = useCleanErrorOnFocus(errors, setErrors);

    //Simulate the focus event
    const event = {
      target: { name: "guide__date" },
    } as React.FocusEvent<HTMLInputElement>;

    handler(event);
    expect(setErrors).not.toHaveBeenCalled();
  });
});
