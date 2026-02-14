import React from 'react';
import { AppRoutes, AuthGate } from 'components';
import * as Styled from "App.styles";
import { AuthProvider } from "contexts/AuthContext";

export const App = () => {
  return (
    <div>
      <Styled.GlobalStyles />
      <AuthProvider>
        <AuthGate>
          <AppRoutes />
        </AuthGate>
      </AuthProvider>
    </div>
  );
};
