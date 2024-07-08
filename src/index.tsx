import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {fontResize} from "./utils/fontResize";
import {BrowserRouter} from "react-router-dom";
import {ProvideAuth} from "./utils/useAuth";
import {Provider} from "react-redux";
import store from "./redux/store";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
fontResize()
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvideAuth>
        <Provider store={store}>
          <App />
        </Provider>
      </ProvideAuth>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
