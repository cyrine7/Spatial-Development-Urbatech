import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css';
import "./index.css";
import './App.css'; // أو اسم الملف اللي حطيت فيه الكود
import 'mapbox-gl/dist/mapbox-gl.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
