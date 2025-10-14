'use client'
import { ReactNode } from "react";
import { Provider } from "react-redux";

import { AuthProvider } from "./context/authContext";
import { store } from "./app_state/store";

export default function Clientprovider ({children} : {children: React.ReactNode} ) {
    return (
        <Provider store={store}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </Provider>
    )
}