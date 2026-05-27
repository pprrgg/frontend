export const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8888"
    : "https://doctec.duckdns.org/fast";

const configURL = { API_URL };

export default configURL;