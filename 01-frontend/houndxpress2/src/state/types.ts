import { Guide } from "../types/guides";

export interface GuidesState {
  guides: ApiGuidePayload[];
  menuDisplay: boolean;
  modalData: InfoModalData;
  stages: ApiStagesPayload[];
  
  // --- Estados Sectorizados ---

  // Sector para LISTAR (fetchGuides)
  listStatus: string;
  listError: ApiError | string | null;

  // Sector para CREAR (createGuide)
  createStatus: string;
  createError: ApiError | string | null;

  // Sector para ACTUALIZAR (updateStatus)
  updateStatus: string;
  updateError: ApiError | string | null;
  
  // Sector para HISTORIAL (fetchStages)
  stagesStatus: string;
  stagesError: ApiError | string | null;
}

export interface InfoModalData {
  guideNumber: string | "";
  typeModal: "History" | "Update" | "";
}

// Lo que la API devuelve al crear una guía
export interface ApiGuidePayload {
  id: number;
  guide_number: string;
  guide_origin: string;
  guide_destination: string;
  guide_recipient: string;
  current_status: string;
  created_at: string;
  updated_at: string;
}

// Lo que el formulario envía (el payload)
// Nota: no enviamos 'id' ni 'current_status'
export type GuideFormPayload = {
  guide_number: string;
  guide_origin: string;
  guide_destination: string;
  guide_recipient: string;
};

export interface ApiError {
  [key: string]: string[] | string;
}

// Lo que devuelve la API al listar estados
export interface ApiStagesPayload {
  id: number;
  guide_detail: ApiGuidePayload;
  guide_status: string;
  timestamp: string;
}

// Lo que le pasamos a a la api para listar estados
export type StagePayload = string;

// Lo que envíamos para actualizar estados
export type UpdatePayload = {
  guide_id: number;
  guide_status: string;
};
