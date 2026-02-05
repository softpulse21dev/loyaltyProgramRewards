import { createApp } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

// 1. Setup Configuration (Replace with your actual API Key)
const API_KEY = "5e7b9cfe3ba105053aa33a32e41c9580"; // e.g., "612440b7949a9e0cdc2f58bc6652d291"
const LOCAL_SHOP = "kg-store-demo.myshopify.com";
const BASE_URL = "https://demo.shopiapps.in/loyalty/api";

// 2. Helper to get the 'host' (required for App Bridge)
const getHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let host = urlParams.get("host");

  // If host is missing, check localStorage (common fallback)
  if (!host) {
    host = localStorage.getItem("shopify_app_host");
  } else {
    localStorage.setItem("shopify_app_host", host);
  }

  // Base64 encode the host if it's not already (sometimes required for local dev)
  return host;
};

// 3. Initialize App Bridge (Vanilla JS version)
// This runs once when the file is imported+
let app = null;
try {
  const host = getHost();
  if (host) {
    app = createApp({
      apiKey: API_KEY,
      host: host,
      forceRedirect: true, // Optional: ensures app is inside Shopify admin
    });
  }
} catch (e) {
  console.log("App Bridge init failed (likely running outside Shopify):", e);
}

// 4. Helper to get Shop URL
export const getCurrentShop = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get("shop") || localStorage.getItem("current_shopify_shop");

  if (shop) localStorage.setItem("current_shopify_shop", shop);

  // Fallback for local development
  if (!shop && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return LOCAL_SHOP;
  }
  return shop;
};

export const getApiURL = (path) => `${BASE_URL}${path}`;

// 5. The Fetch Function (No 'app' argument needed anymore!)
export const fetchData = async (path, data = {}, dataType = "json") => {
  return new Promise(async (resolve) => {
    const currentShop = getCurrentShop();

    // --- A. GET SESSION TOKEN ---
    let token = "";
    if (app) {
      try {
        token = await getSessionToken(app);
        // console.log("✅ Generated Token:", token);
      } catch (error) {
        console.error("Error generating session token:", error);
      }
    } else {
      console.warn("App Bridge not initialized. Token will be empty.");
    }

    // --- B. PREPARE DATA ---
    if (data instanceof FormData) {
      if (!data.has("shop")) data.append("shop", currentShop);
    } else {
      data = { ...data, shop: currentShop };
    }

    // --- C. PREPARE HEADERS ---
    let headers = {
      "Authorization": `Bearer ${token}` // Send token automatically
    };

    let body = data;
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    // --- D. EXECUTE FETCH ---
    fetch(getApiURL(path), {
      method: "POST",
      headers: headers,
      body: body,
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