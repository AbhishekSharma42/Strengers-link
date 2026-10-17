import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../services/api";
import { dashboardStats } from "../utils/calculations";

const C = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);

  const [settings, setSettings] = useState({
    storeName: "My Store",
    storeAddress: "",
    phone: "",
    email: "",
    ownerName: "",
    gstNumber: "",
    currency: "INR",
    lowStockLimit: 10,
  });

  // Sirf initial data loading ke liye
  const [loading, setLoading] = useState(true);

  // Save / update / delete ke liye
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
   * =====================================================
   * REFRESH DATA
   * =====================================================
   *
   * Refresh ke waqt full-page loading nahi dikhegi.
   */

  const refreshData = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const [p, c, s, h, st] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getSales(),
          api.getStockHistory(),
          api.getSettings(),
        ]);

        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
        setSales(Array.isArray(s) ? s : []);
        setStockHistory(Array.isArray(h) ? h : []);

        if (st && typeof st === "object") {
          setSettings((old) => ({
            ...old,
            ...st,
          }));
        }
      } catch (e) {
        setError(
          e?.message || "Unable to load data."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

  /*
   * =====================================================
   * RUN ACTION
   * =====================================================
   *
   * Add / Update / Delete ke baad data silently refresh hoga.
   */

  const run = useCallback(
    async (fn) => {
      setSaving(true);
      setError("");

      try {
        await fn();

        // Full page loading nahi hogi
        await refreshData(false);
      } catch (e) {
        setError(
          e?.message ||
            "Something went wrong."
        );

        throw e;
      } finally {
        setSaving(false);
      }
    },
    [refreshData]
  );

  /*
   * =====================================================
   * ACTIONS
   * =====================================================
   */

  const actions = useMemo(
    () => ({
      // PRODUCT
      addProduct: (p) =>
        run(() => api.addProduct(p)),

      updateProduct: (p) =>
        run(() => api.updateProduct(p)),

      deleteProduct: (id) =>
        run(() => api.deleteProduct(id)),

      // CATEGORY
      addCategory: (c) =>
        run(() => api.addCategory(c)),

      updateCategory: (c) =>
        run(() => api.updateCategory(c)),

      deleteCategory: (id) =>
        run(() => api.deleteCategory(id)),

      // SALES
      createSale: (s) =>
        run(() => api.createSale(s)),

      createOutsideSale: (s) =>
        run(() => api.createOutsideSale(s)),

      // STOCK
      addStock: (p) =>
        run(() => api.addStock(p)),

      // SETTINGS
      updateSettings: (s) =>
        run(async () => {
          await api.updateSettings(s);

          setSettings((old) => ({
            ...old,
            ...s,
          }));
        }),
    }),
    [run]
  );

  /*
   * =====================================================
   * DASHBOARD STATS
   * =====================================================
   */

  const stats = useMemo(
    () => dashboardStats(products, sales),
    [products, sales]
  );

  /*
   * =====================================================
   * PROVIDER
   * =====================================================
   */

  return (
    <C.Provider
      value={{
        products,
        categories,
        sales,
        stockHistory,
        settings,

        stats,

        loading,
        saving,
        error,

        clearError: () =>
          setError(""),

        refreshData: () =>
          refreshData(false),

        ...actions,
      }}
    >
      {children}
    </C.Provider>
  );
}

/*
 * =====================================================
 * USE STORE
 * =====================================================
 */

export function useStore() {
  const v = useContext(C);

  if (!v) {
    throw new Error(
      "useStore must be used inside StoreProvider"
    );
  }

  return v;
}