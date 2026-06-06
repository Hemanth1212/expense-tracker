import { createContext, useContext } from "react";
import { useStore } from "../hooks/useStore";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const store = useStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
