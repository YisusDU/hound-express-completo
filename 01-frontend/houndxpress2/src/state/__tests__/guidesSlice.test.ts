import guidesReducer, {
  addGuide,
  toggleMenu,
  changeModalData,
  updateGuide,
} from "../guides.slice";
import { GuidesState, InfoModalData } from "../types";
// import guidesReducer from "../../App/store";

describe("Guides Slice", () => {
  const initialState: GuidesState = {
    guides: [],
    menuDisplay: false,
    modalData: { guideNumber: "", typeModal: "" },
  };

  it("should handle addGuide", () => {
    const newGuide = {
      guide__number: "12345",
      guide__origin: "Ciudad A",
      guide__destination: "Ciudad B",
      guide__recipient: "Persona X",
      guide__stage: [
        {
          guide__date: "2023-10-01",
          guide__status: "Pendiente",
          guide__hour: "10:00",
        },
      ],
    };
    const state = guidesReducer(initialState, addGuide(newGuide));
    expect(state.guides).toContainEqual(newGuide);
  });

  it("should handle updateGuide", () => {
    const stateWithGuide: GuidesState = {
      ...initialState,
      guides: [
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
      ],
      modalData: { guideNumber: "123", typeModal: "Update" },
    };
    const updatedStage = {
      guide__date: "2023-10-02",
      guide__status: "En tránsito",
      guide__hour: "12:00",
    };

    const state = guidesReducer(stateWithGuide, updateGuide(updatedStage));
    expect(state.guides[0].guide__stage).toContainEqual(updatedStage);
  });

  it("should not update guide if modalData is empty", () => {
    const stateWithGuide: GuidesState = {
      ...initialState,
      guides: [
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
      ],
      modalData: { guideNumber: "", typeModal: "Update" },
    };
    const updatedStage = {
      guide__date: "2023-10-02",
      guide__status: "En tránsito",
      guide__hour: "12:00",
    };
    const state = guidesReducer(stateWithGuide, updateGuide(updatedStage));
    expect(state.guides[0].guide__stage).not.toContainEqual(updatedStage);
  });

  it("should handle toggleMenu", () => {
    //Menu should be fixed
    const state = guidesReducer(initialState, toggleMenu(true));
    expect(state.menuDisplay).toBe(true);

    //Menu should be unfixed
    const state2 = guidesReducer(initialState, toggleMenu(false));
    expect(state2.menuDisplay).toBe(false);
  });

  it("should handle changeModalData", () => {
    const typeOfModals: InfoModalData[] = [
      {
        guideNumber: "12345",
        typeModal: "Update",
      },
      {
        guideNumber: "67890",
        typeModal: "History",
      },
      {
        guideNumber: "",
        typeModal: "",
      },
    ];
    typeOfModals.forEach((type) => {
      const newModalData = type;
      const state = guidesReducer(initialState, changeModalData(newModalData));
      expect(state.modalData).toEqual(newModalData);
    });
  });
  
});
