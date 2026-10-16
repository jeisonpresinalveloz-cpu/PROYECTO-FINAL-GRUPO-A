import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Pega tu ID de Cliente (Client ID) exacto entre las comillas */}
    <GoogleOAuthProvider clientId="469285150612-d1nmhhjnropmboi3hil7vm3nu4uvqv74.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);