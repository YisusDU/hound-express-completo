// ServerError.tsx
import React from "react";
import { ApiError } from "../../state/types";

// 1. Es un componente, recibe 'error' como prop
type ServerErrorProps = {
  error: ApiError | string | null;
};

// 2. No es un hook, es un componente normal
const ServerError = ({ error }: ServerErrorProps) => {
  // 3. ¡Ya no necesita 'useAppSelector'!

  // Si no hay error, no renderiza nada
  if (!error) return null;

  // --- CASO 1: El error es un string simple ---
  if (typeof error === "string") {
    return (
      <div className="server-error" role="alert">
        {error}
      </div>
    );
  }

  // --- CASO 2: El error es un objeto ApiError ---
  return (
    <div className="server-error" role="alert">
      <strong>Por favor, corrige los siguientes errores:</strong>
      <ul>
        {Object.entries(error).map(([field, messages]) => (
          <li key={field}>
            {Array.isArray(messages) ? (
              messages.map((msg, idx) => <span key={idx}>{msg}</span>)
            ) : (
              <span>{messages}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServerError; // Export como default es común para componentes
