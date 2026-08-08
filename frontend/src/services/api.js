const API_URL = "https://planilla-l2y7.onrender.com";

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

    if (!response.ok) {
      throw new Error("Credenciales inválidas o error de servidor");
    }

    return response.json();
  },

  registro: async (datos) => {
    const response = await fetch(`${API_URL}/api/v1/auth/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al registrar la empresa");
    }

    return response.json();
  },

  getEmpleados: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/v1/recursos-humanos/empleados`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener la lista de empleados");
    }

    return response.json();
  }
};
