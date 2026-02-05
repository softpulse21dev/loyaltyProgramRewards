const LOCAL_SHOP = "kg-store-demo.myshopify.com";
const SHOP_STORAGE_KEY = "current_shopify_shop"; // Key to store the shop in localStorage

export const getCurrentShop = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlShop = urlParams.get("shop");

    // 1. If 'shop' is in the URL (on initial load):
    //    Save it to localStorage and return it.
    if (urlShop) {
        localStorage.setItem(SHOP_STORAGE_KEY, urlShop);
        return urlShop;
    }

    // 2. If 'shop' is NOT in the URL (e.g., after navigating):
    //    Try to get it from localStorage.
    const storedShop = localStorage.getItem(SHOP_STORAGE_KEY);
    if (storedShop) {
        return storedShop;
    }

    // 3. Fallback for local development (if nothing in URL or storage):
    const isLocalDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    if (isLocalDevelopment) {
        // Optional: Also save the local shop to storage for consistency
        localStorage.setItem(SHOP_STORAGE_KEY, LOCAL_SHOP);
        return LOCAL_SHOP;
    }

    // 4. If live and still no shop, we have a problem.
    console.error("Could not determine shop origin.");
    return null;
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
