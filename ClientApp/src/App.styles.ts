import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body { 
    background-color: white;
    font-size: 18px;
    padding: 0.5em;
  }

  @media screen and (max-width: 640px) {
    body {
      font-size: 16px;
    }
  }

  @media screen and (max-width: 480px) {
    body {
      font-size: 14px;
    }
  }
`;
