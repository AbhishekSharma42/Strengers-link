const API_URL =
  import.meta.env.VITE_GOOGLE_SHEETS_API_URL;

async function request(action, options = {}) {
  if (!API_URL) {
    throw new Error(
      "Google Sheets API URL is not configured. Add VITE_GOOGLE_SHEETS_API_URL to .env."
    );
  }

  const method =
    options.method || "GET";

  let url = API_URL;
  let body;

  /* =====================================================
     GET REQUEST
  ===================================================== */

  if (method === "GET") {
    const params = new URLSearchParams();

    params.set("action", action);

    if (options.params) {
      Object.entries(options.params).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            params.set(
              key,
              String(value)
            );
          }
        }
      );
    }

    url =
      `${API_URL}?${params.toString()}`;
  }

  /* =====================================================
     POST REQUEST
  ===================================================== */

  if (method === "POST") {
    body = JSON.stringify({
      action,
      ...(options.body || {}),
    });
  }

  let response;

  try {
    response = await fetch(url, {
      method,

      headers: {
        "Content-Type":
          "text/plain;charset=utf-8",
      },

      body,
    });
  } catch (error) {
    console.error(
      "FETCH ERROR:",
      error
    );

    throw new Error(
      "Network error. Check internet connection and Apps Script deployment."
    );
  }

  const text =
    await response.text();

  console.log(
    "SERVER RAW RESPONSE:",
    text
  );

  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error(
      "INVALID SERVER RESPONSE:",
      text
    );

    throw new Error(
      "Server returned an invalid response."
    );
  }

  console.log(
    "SERVER RESPONSE:",
    data
  );

  if (
    !response.ok ||
    data.ok === false
  ) {
    throw new Error(
      data.message ||
        "Google Sheets operation failed."
    );
  }

  return data.data ?? data;
}


/* =========================================================
   API
========================================================= */

export const api = {

  /* =======================================================
     PRODUCTS
  ======================================================= */

  getProducts: () =>
    request("getProducts"),

  addProduct: (product) =>
    request("addProduct", {
      method: "POST",

      body: {
        product,
      },
    }),

  updateProduct: (product) =>
    request("updateProduct", {
      method: "POST",

      body: {
        product,
      },
    }),

  deleteProduct: (productId) =>
    request("deleteProduct", {
      method: "POST",

      body: {
        productId,
      },
    }),


  /* =======================================================
     CATEGORIES
  ======================================================= */

  getCategories: () =>
    request("getCategories"),

  addCategory: (category) =>
    request("addCategory", {
      method: "POST",

      body: {
        category,
      },
    }),

  updateCategory: (category) =>
    request("updateCategory", {
      method: "POST",

      body: {
        category,
      },
    }),

  deleteCategory: (categoryId) =>
    request("deleteCategory", {
      method: "POST",

      body: {
        categoryId,
      },
    }),


  /* =======================================================
     SALES
  ======================================================= */

  getSales: () =>
    request("getSales"),

  getSaleItems: (invoiceNo) =>
    request("getSaleItems", {
      method: "GET",

      params: {
        invoiceNo,
      },
    }),

  createOutsideSale: (sale) => request("createOutsideSale", { method: "POST", body: { sale } }),

  createSale: (sale) => {

    console.log(
      "API CREATE SALE INPUT:",
      sale
    );

    console.log(
      "API CREATE SALE PRODUCTS:",
      sale?.products
    );

    return request(
      "createSale",
      {
        method: "POST",

        body: {
          sale,
        },
      }
    );
  },


  /* =======================================================
     STOCK
  ======================================================= */

  getStockHistory: () =>
    request("getStockHistory"),

  addStock: (data) =>
    request("addStock", {
      method: "POST",

      body: {
        data,
      },
    }),


  /* =======================================================
     AUTHENTICATION / OTP
  ======================================================= */

  requestOtp: (data) =>
    request("sendOTP", {
      method: "POST",

      body: {
        email: data.email,
      },
    }),


  verifyOtp: (data) =>
    request("verifyOTP", {
      method: "POST",

      body: {
        email: data.email,

        otp: data.otp,
      },
    }),


  /* =======================================================
     SETTINGS
  ======================================================= */

  getSettings: () =>
    request("getSettings"),

  updateSettings: (settings) =>
    request("updateSettings", {
      method: "POST",

      body: {
        settings,
      },
    }),
};