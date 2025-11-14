import { Guide } from "../types/guides";

export interface GuidesState {
  guides: Guide[];
  menuDisplay: boolean;
  modalData: InfoModalData;
  status: string;
  error: ApiError | null,
}

export interface InfoModalData {
  guideNumber: string | "";
  typeModal: "History" | "Update" | "";
}

// Lo que la API devuelve al crear una guía
export interface ApiCreateGuide {
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
