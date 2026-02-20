import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: white;
    font-size: 18px;
    margin: 0;
    padding: 0;
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
