import axios from "axios";

// 1. Obtenemos la variable de entorno (versión CRA)
const API_URL = process.env.REACT_APP_API_BASE_URL;

// 2. Validamos que exista
if (!API_URL) {
  console.error(
    "¡Error! REACT_APP_API_BASE_URL no está definida en el archivo .env"
  );
  // Lanzar un error detiene la ejecución de la app si la API es crítica
  throw new Error(
    "Configuración de entorno faltante: REACT_APP_API_BASE_URL"
  );
}

// 3. Si existe, la usamos con confianza
const api = axios.create({
  baseURL: API_URL,
});

export default api;