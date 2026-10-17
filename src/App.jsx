import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import { useStore } from "./context/StoreContext";
import { useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import Login from "./pages/Login";

export default function App() {
  const { loading: storeLoading } =
    useStore();

  const {
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  // --------------------------------------------------
  // Wait for authentication
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        Loading...
      </div>
    );
  }

  // --------------------------------------------------
  // User is NOT logged in
  // --------------------------------------------------

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  // --------------------------------------------------
  // User is logged in
  // --------------------------------------------------

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/inventory"
          element={<Inventory />}
        />

        <Route
          path="/sales"
          element={<Sales />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
}