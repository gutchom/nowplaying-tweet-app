import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return (
    <div>
      <h1>Hello.</h1>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

