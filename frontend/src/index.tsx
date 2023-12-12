import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import {ProvideAuth} from "./utils/useAuth";
import {Provider} from "react-redux";
import store from "./redux/store";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ProvideAuth>
          <App/>
        </ProvideAuth>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
