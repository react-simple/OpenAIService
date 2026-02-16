import React from 'react';
import { AppRoutes, AuthGate, FontSizeProvider } from 'components';
import * as Styled from "App.styles";
import { AuthProvider } from "contexts/AuthContext";

export const App = () => {
  return (
    <div>
      <Styled.GlobalStyles />
      <AuthProvider>
        <AuthGate>
          <FontSizeProvider>
            <AppRoutes />
          </FontSizeProvider>
        </AuthGate>
      </AuthProvider>
    </div>
  );
};
