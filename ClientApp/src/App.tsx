import React from 'react';
import { AppRoutes } from 'components';
import * as Styled from "App.styles";

export const App = () => {
  // AppWrapper renders:
  // - HelmetProvider
  // - QueryClientProvider
  // - Styled.GlobalStyles
  // See https://github.com/CommonwealthDevelopment/web-ui-component-library/blob/develop/src/stories/App/App.tsx

  return (
    <div>
      <Styled.GlobalStyles />
      <AppRoutes />
    </div>
  );
};
