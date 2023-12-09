import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import {ProvideAuth} from "./utils/useAuth";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvideAuth>
        <App/>
      </ProvideAuth>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
