'use client'
import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';

import { AuthProvider } from "./context/authContext";
import { store, persistor } from "./app_state/store";

// Custom loading component
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default function ClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure we're in the browser
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}