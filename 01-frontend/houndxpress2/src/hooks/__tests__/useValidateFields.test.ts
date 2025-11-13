import validateFields from "../useValidateFields";

describe("validateFields", () => {
  it("should return isValid: false and set errors for empty fields", () => {
    const fields = ["campo1", "campo2"];
    const formData = new FormData();
    formData.set("campo1", "");
    formData.set("campo2", "");

    const setErrors = jest.fn();

    const result = validateFields(fields, formData, setErrors);

    expect(setErrors).toHaveBeenCalledWith({
      campo1: "Este campo es obligatorio",
      campo2: "Este campo es obligatorio",
    });

    expect(result).toEqual({ isValid: false });
  });

  it("should return isValid: true and not set any errors if fields are filled", () => {
    const fields = ["campo1", "campo2"];
    const formData = new FormData();
    formData.set("campo1", "valor1");
    formData.set("campo2", "valor2");

    const setErrors = jest.fn();

    const result = validateFields(fields, formData, setErrors);

    expect(setErrors).toHaveBeenCalledWith({});
    expect(result).toEqual({ isValid: true });
  });
});
