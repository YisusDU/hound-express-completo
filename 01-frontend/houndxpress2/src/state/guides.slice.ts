import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApiError,
  ApiGuidePayload,
  ApiStagesPayload,
  GuideFormPayload,
  GuidesState,
  InfoModalData,
  StagePayload,
  UpdatePayload,
} from "./types";
import { Guide } from "../types/guides";
import { GuideStage } from "../components/GuideReguister/types";
import {
  CREATE_GUIDE,
  FETCH_GUIDES,
  FETCH_STAGES,
  UPDATE_STATUS,
} from "../constants/actionTypes";
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

// Listar estados de una guía
export const fetchStages = createAsyncThunk<
  ApiStagesPayload[],
  StagePayload,
  { rejectValue: ApiError | string }
>(FETCH_STAGES, async (guideNumber, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiStagesPayload[]>(
      `/api/v1/estatus/by-tracking/${guideNumber}/`
    );
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

// Actualizar guías
export const updateStatus = createAsyncThunk<
  ApiStagesPayload,
  UpdatePayload,
  { rejectValue: ApiError | string }
>(UPDATE_STATUS, async (newGuideStage, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiStagesPayload>(
      "/api/v1/estatus/",
      newGuideStage
    );
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
  stages: [],
  menuDisplay: false,
  modalData: { guideNumber: "", typeModal: "" },

  listStatus: ASYNC_STATUS.IDLE,
  listError: null,

  createStatus: ASYNC_STATUS.IDLE,
  createError: null,

  updateStatus: ASYNC_STATUS.IDLE,
  updateError: null,

  stagesStatus: ASYNC_STATUS.IDLE,
  stagesError: null,
};

const guidesSlice = createSlice({
  name: "guidesState",
  initialState,
  reducers: {
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      state.menuDisplay = action.payload;
    },
    changeModalData: (state, action: PayloadAction<InfoModalData>) => {
      state.modalData = action.payload;
    },
    // Acción para resetear el estado del formulario de CREACIÓN
    resetCreateStatus: (state) => {
      state.createStatus = ASYNC_STATUS.IDLE;
      state.createError = null;
    },
    // Acción para resetear el estado del formulario de ACTUALIZACIÓN
    resetUpdateStatus: (state) => {
      state.updateStatus = ASYNC_STATUS.IDLE;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Crear guías
      .addCase(createGuide.pending, (state) => {
        state.createStatus = ASYNC_STATUS.PENDING;
        state.createError = null;
      })
      .addCase(createGuide.fulfilled, (state, action) => {
        state.createStatus = ASYNC_STATUS.FULFILLED;
        // Actualizamos el estado de 'guides'
        state.guides.unshift(action.payload);
      })
      .addCase(createGuide.rejected, (state, action) => {
        state.createStatus = ASYNC_STATUS.REJECTED;
        state.createError =
          (action.payload as ApiError | string) || "Error al crear la guía";
      })
      // Listar guías
      .addCase(fetchGuides.pending, (state) => {
        state.listStatus = ASYNC_STATUS.PENDING;
        state.listError = null;
      })
      .addCase(fetchGuides.fulfilled, (state, action) => {
        state.listStatus = ASYNC_STATUS.FULFILLED;
        state.guides = action.payload;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.listStatus = ASYNC_STATUS.REJECTED;
        state.listError =
          (action.payload as ApiError | string) || "Error al listar guías";
      })
      // Listar estados
      .addCase(fetchStages.pending, (state) => {
        state.stagesStatus = ASYNC_STATUS.PENDING;
        state.stagesError = null;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.stagesStatus = ASYNC_STATUS.FULFILLED;
        state.stages = action.payload;
      })
      .addCase(fetchStages.rejected, (state, action) => {
        state.stagesStatus = ASYNC_STATUS.REJECTED;
        state.stagesError =
          (action.payload as ApiError | string) || "Error al cargar historial";
      })
      // Actualizar estado
      .addCase(updateStatus.pending, (state) => {
        state.updateStatus = ASYNC_STATUS.PENDING;
        state.updateError = null;
      })
      .addCase(updateStatus.fulfilled, (state) => {
        state.updateStatus = ASYNC_STATUS.FULFILLED;
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.updateStatus = ASYNC_STATUS.REJECTED;
        state.updateError =
          (action.payload as ApiError | string) || "Error al actualizar";
      });
  },
});

export const {
  toggleMenu,
  changeModalData,
  resetCreateStatus, 
  resetUpdateStatus, 
} = guidesSlice.actions;

//Reducer for the store
export default guidesSlice.reducer;
