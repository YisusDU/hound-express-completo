import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiError,
  ApiGuidePayload,
  GuideFormPayload,
  GuidesState,
  InfoModalData,
} from "./types";
import { Guide } from "../types/guides";
import { GuideStage } from "../components/GuideReguister/types";
import { CREATE_GUIDE, FETCH_GUIDES } from "../constants/actionTypes";
import axios from "axios";
import api from "../api";
import { ASYNC_STATUS } from "../constants/asyncStatus";

// Peticiones asíncronas

// Crear guías
export const createGuide = createAsyncThunk<
  ApiGuidePayload,
  GuideFormPayload,
  { rejectValue: ApiError | string }
>(CREATE_GUIDE, async (guidePayload, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiGuidePayload>(
      "/api/v1/guides/",
      guidePayload
    );
    return response.data;
  } catch (error) {
    // 1. Verificamos si es un error de Axios
    if (axios.isAxiosError(error)) {
      // 2. Si NO hay 'error.response', es un error de red
      if (!error.response) {
        return rejectWithValue(error.message); // error.message es un string
      }

      // 3. Si SÍ hay 'error.response', es un error del backend (4xx, 5xx)
      // Sabemos que 'error.response.data' será de tipo 'ApiError'
      return rejectWithValue(error.response.data as ApiError);
    } else {
      // No es un error de Axios (ej. un error de sintaxis en el 'try')
      return rejectWithValue("Ocurrió un error inesperado");
    }
  }
});

// Listar guías
export const fetchGuides = createAsyncThunk<
  ApiGuidePayload[],
  void,
  { rejectValue: ApiError | string }
>(FETCH_GUIDES, async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiGuidePayload[]>("/api/v1/guides/");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error.response.data as ApiError);
    } else {
      return rejectWithValue("Ocurrió un error inesperado");
    }
  }
});

//Global Initial State
const initialState: GuidesState = {
  guides: [],
  menuDisplay: false,
  modalData: { guideNumber: "", typeModal: "" },
  status: ASYNC_STATUS.IDLE,
  error: null,
};

const guidesSlice = createSlice({
  name: "guidesState",
  initialState,
  reducers: {
    // addGuide: (state, action: PayloadAction<Guide>) => {
    //   state.guides.unshift(action.payload);
    // },
    // updateGuide: (state, action: PayloadAction<GuideStage>) => {
    //   const guide = state.guides.find(
    //     (g) => g.guide_number === state.modalData.guideNumber
    //   );
    //   if (guide) {
    //     guide.guide_stage.push(action.payload);
    //   }
    // },
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      state.menuDisplay = action.payload;
    },
    changeModalData: (state, action: PayloadAction<InfoModalData>) => {
      state.modalData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Crear guías
      .addCase(createGuide.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(createGuide.fulfilled, (state) => {
        state.status = ASYNC_STATUS.FULFILLED;
      })
      .addCase(createGuide.rejected, (state, action) => {
        state.status = ASYNC_STATUS.REJECTED;
        // Si usas rejectWithValue, el error viene en .payload
        if (action.payload) {
          state.error = action.payload;
        } else {
          // Si es un error no manejado, usa .error.message
          state.error = action.error.message || "Ocurrió un error desconocido";
        }
      })
      // Listar guías
      .addCase(fetchGuides.pending, (state) => {
        state.status = ASYNC_STATUS.PENDING;
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        state.status = ASYNC_STATUS.FULFILLED;
        state.guides = action.payload;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.status = ASYNC_STATUS.REJECTED;
        if (action.payload) {
          state.error = action.payload;
        } else {
          state.error = action.error.message || "Ocurrió un error desconocido";
        }
      });
  },
});

//Actions by name
export const { /* addGuide, */ toggleMenu, changeModalData /* updateGuide */ } =
  guidesSlice.actions;

//Reducer for the store
export default guidesSlice.reducer;
