const API_URL = "/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async get(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
