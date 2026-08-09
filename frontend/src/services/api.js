const API_URL = "https://planilla-l2y7.onrender.com";

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Sesión expirada. Redirigiendo a login...");
  }
  if (!response.ok) {
    let errorMessage = "Error en la petición";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Ignorar si no hay JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    return handleResponse(response);
  },

  registro: async (datos) => {
    const response = await fetch(`${API_URL}/api/v1/auth/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  loginWithGoogle: async (token) => {
    const response = await fetch(`${API_URL}/api/v1/auth/google/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  registroWithGoogle: async (datos) => {
    const response = await fetch(`${API_URL}/api/v1/auth/google/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  getEmpresa: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/empresa/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  updateEmpresa: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/empresa/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  crearNovedadEmpleado: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/novedades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  crearNovedadesMasivas: async (novedades) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/novedades/lote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ novedades }),
    });
    return handleResponse(response);
  },

  getPeriodoActivo: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/periodo-activo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  getProgramacionVacaciones: async (anio) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/vacaciones/programacion?anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  guardarProgramacionVacaciones: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/vacaciones/programacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  getEmpleados: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/recursos-humanos/empleados`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  crearEmpleado: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/recursos-humanos/empleados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  crearContrato: async (empleadoId, datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/recursos-humanos/empleados/${empleadoId}/contratos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  procesarPlanilla: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/procesar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  getPrestamosEmpleado: async (empleadoId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/prestamos/${empleadoId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  crearPrestamoEmpleado: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/prestamos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  getPlanillas: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  cerrarPlanilla: async (periodoId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/${periodoId}/cerrar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  eliminarPlanilla: async (periodoId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/${periodoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  cambiarEstadoEmpleado: async (empleadoId, estado) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/recursos-humanos/empleados/${empleadoId}/estado?estado=${estado}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  liquidarEmpleado: async (datos) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/liquidaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  downloadPDF: async (periodoId, type) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/planillas/${periodoId}/${type}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      let errorMessage = "Error al descargar el PDF";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    
    return await response.blob();
  }
};
