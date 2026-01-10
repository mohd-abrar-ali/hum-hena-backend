
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
let rootInstance: any = null;

const renderApp = () => {
  if (!container || rootInstance) return;
  
  try {
    rootInstance = createRoot(container);
    rootInstance.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Hum Hena: Initialization Failed", err);
    container.innerHTML = `
      <div style="display: flex; height: 100vh; align-items: center; justify-content: center; text-align: center; font-family: sans-serif; background: #f8fafc;">
        <div>
          <h2 style="color: #0f172a; font-weight: 800; font-size: 1.5rem;">System Load Error</h2>
          <p style="color: #64748b; margin-top: 0.5rem;">The application could not initialize its core engine.</p>
          <button onclick="window.location.reload()" style="margin-top: 1.5rem; background: #2563eb; color: #fff; border: none; padding: 0.75rem 2rem; border-radius: 0.75rem; cursor: pointer; font-weight: 700;">Reload System</button>
        </div>
      </div>
    `;
  }
};

// Handle both direct execution and event-based loading
if (document.readyState === 'complete') {
  renderApp();
} else {
  window.addEventListener('load', renderApp);
}
