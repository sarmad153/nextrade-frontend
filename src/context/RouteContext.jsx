import React, { createContext, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";

const RouteContext = createContext({});

export const RouteProvider = ({ children }) => {
  const location = useLocation();

  const shouldShowCustomerSupport = useCallback(() => {
    const excludedPaths = [
      "/login",
      "/register",
      "/reset-password",
      "/unauthorized",
      "/admin",
    ];

    // Convert both current path and excluded paths to lowercase for comparison
    const currentPathLower = location.pathname.toLowerCase();

    const isExcluded = excludedPaths.some((path) =>
      currentPathLower.startsWith(path.toLowerCase())
    );

    return !isExcluded;
  }, [location.pathname]);

  const getUserType = useCallback(() => {
    const currentPath = location.pathname.toLowerCase();

    if (currentPath.startsWith("/seller")) return "seller";
    if (currentPath.startsWith("/admin")) return "admin";
    return "buyer";
  }, [location.pathname]);

  const value = {
    currentPath: location.pathname,
    shouldShowCustomerSupport,
    getUserType,
  };

  return (
    <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
  );
};

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("useRoute must be used within a RouteProvider");
  }
  return context;
};
