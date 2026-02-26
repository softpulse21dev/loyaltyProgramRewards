import { createApp } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

const API_KEY = "5e7b9cfe3ba105053aa33a32e41c9580";
const LOCAL_SHOP = "kg-store-demo.myshopify.com";
const BASE_URL = "https://demo.shopiapps.in/loyalty/api";

// ✅ Local-only query key
const LOCAL_QUERY_KEY = "Y6vg3RZzOZz7a9W";

const isLocalhost = () => {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
};

// ✅ Append ?key=... only in local
const withLocalKey = (url) => {
  if (!isLocalhost()) return url;

  const u = new URL(url);
  if (!u.searchParams.has("key")) {
    u.searchParams.set("key", LOCAL_QUERY_KEY);
  }
  return u.toString();
};

const getHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let host = urlParams.get("host");

  if (!host) {
    host = localStorage.getItem("shopify_app_host");
  } else {
    localStorage.setItem("shopify_app_host", host);
  }

  return host;
};

let app = null;
try {
  const host = getHost();
  if (host) {
    app = createApp({
      apiKey: API_KEY,
      host,
      forceRedirect: true,
    });
  }
} catch (e) {
  console.log("App Bridge init failed (likely running outside Shopify):", e);
};

export const getCurrentShop = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get("shop") || localStorage.getItem("current_shopify_shop");

  if (shop) localStorage.setItem("current_shopify_shop", shop);

  if (!shop && isLocalhost()) return LOCAL_SHOP;
  return shop;
};

// ✅ Make api url (local adds key query param)
export const getApiURL = (path) => {
  const base = `${BASE_URL}${path}`;

  if (!isLocalhost()) return base;

  // If already has query params, append using &
  if (base.includes("?")) {
    return `${base}&${LOCAL_QUERY_KEY}`;
  }

  return `${base}?${LOCAL_QUERY_KEY}`;
};

export const fetchData = async (path, data = {}, dataType = "json") => {
  return new Promise(async (resolve) => {
    const currentShop = getCurrentShop();

    let token = "";
    if (app) {
      try {
        token = await getSessionToken(app);
      } catch (error) {
        console.error("Error generating session token:", error);
      }
    } else {
      console.warn("App Bridge not initialized. Token will be empty.");
    }

    if (data instanceof FormData) {
      if (!data.has("shop")) data.append("shop", currentShop);
    } else {
      data = { ...data, shop: currentShop };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let body = data;
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    fetch(getApiURL(path), {
      method: "POST",
      headers,
      body,
    })
      .then((res) => res.text())
      .then((resText) => {
        if (dataType === "json") {
          try {
            return resolve(JSON.parse(resText));
          } catch (e) {
            return resolve({ status: false, message: "Invalid JSON response" });
          }
        }
        return resolve(resText);
      })
      .catch((err) => {
        console.error("API error:", err);
        return resolve({ status: false, message: "Network error" });
      });
  });
};