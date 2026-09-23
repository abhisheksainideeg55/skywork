const API_BASE = "http://localhost:5000/api/attendance/smart";

const getHeaders = () => {
  const token = localStorage.getItem("skywork_jwt_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchSmartConfig = async () => {
  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: "GET",
      headers: getHeaders(),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch smart attendance config from backend:", err);
    return null;
  }
};

export const saveSmartConfig = async (configData) => {
  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(configData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to update smart config in backend:", err);
    return null;
  }
};

export const createOfficeApi = async (officeData) => {
  try {
    const res = await fetch(`${API_BASE}/offices`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(officeData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to create office in backend:", err);
    return null;
  }
};

export const updateOfficeApi = async (id, officeData) => {
  try {
    const res = await fetch(`${API_BASE}/offices/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(officeData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to update office in backend:", err);
    return null;
  }
};

export const deleteOfficeApi = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/offices/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to delete office in backend:", err);
    return null;
  }
};

export const createWifiApi = async (wifiData) => {
  try {
    const res = await fetch(`${API_BASE}/wifi-configs`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(wifiData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to create wifi in backend:", err);
    return null;
  }
};

export const updateWifiApi = async (id, wifiData) => {
  try {
    const res = await fetch(`${API_BASE}/wifi-configs/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(wifiData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to update wifi in backend:", err);
    return null;
  }
};

export const deleteWifiApi = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/wifi-configs/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error("Failed to delete wifi in backend:", err);
    return null;
  }
};
