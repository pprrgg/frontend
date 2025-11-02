const configURL = {
      API_URL:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : "https://doctec.duckdns.org/fast",
    };
    
    export default configURL;