// Get shop param from URL (e.g. ?shop=kg-store-demo.myshopify.com)
const LOCAL_SHOP = "kg-store-demo.myshopify.com";

export const getCurrentShop = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let shop = urlParams.get("shop");

  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!shop && isLocalDevelopment) {
    shop = LOCAL_SHOP; // fallback local ke liye
  }

  return shop || null;
};

// Base URL for APIs
export const getApiURL = (path) => {
  const key = "Y6vg3RZzOZz7a9W";
  const base_url = "https://demo.shopiapps.in/loyalty/api";
  if (key === '') {
    return `${base_url}${path}`;
  } else {
    return `${base_url}${path}?${key}`;
  }
};

// Common fetch function
export const fetchData = async (path, data = {}, dataType = "json") => {
  return new Promise((resolve) => {
    const method = "POST";
    // Shop dynamic from URL
    let currentShop = getCurrentShop();

    // Local dev check
    const isLocalDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalDevelopment) {
      if (!currentShop || !currentShop.includes("myshopify.com")) {
        console.error("Invalid shop parameter:", currentShop);
        return resolve({
          status: false,
          message: "Invalid shop configuration. Please refresh the page.",
        });
      }
    }

    // Add shop param
    if (data instanceof FormData) {
      if (!data.has("shop")) {
        data.append("shop", currentShop);
      }
      if (!data.has("appLanguage")) {
        const appLanguage = localStorage.getItem("interfaceLanguage") || "en";
        data.append("appLanguage", appLanguage);
      }
    } else {
      data = { ...data, shop: currentShop };
    }

    let headerContentType = "application/json";
    let body = data;

    if (data instanceof FormData) {
      body = data;
      headerContentType = undefined; // let browser set it
    } else {
      body = JSON.stringify(data);
    }

    const fetchOptions = {
      method,
      body,
    };

    if (headerContentType) {
      fetchOptions.headers = {
        "Content-Type": headerContentType,
      };
    }

    fetch(getApiURL(path), fetchOptions)
      .then((res) => res.text())
      .then((resText) => {
        if (dataType === "json") {
          try {
            const json = JSON.parse(resText);
            return resolve(json);
          } catch (e) {
            return resolve({
              status: false,
              message: "Invalid server response",
            });
          }
        }
        return resolve(resText);
      })
      .catch((err) => {
        console.error("API error:", err);
        return resolve({
          status: false,
          message: "Please try again later",
        });
      });
  });
};
