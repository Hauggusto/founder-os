import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

const savedTheme = localStorage.getItem('founder-os-theme') || 'dark';
document.documentElement.classList.toggle('dark', savedTheme !== 'light');
document.documentElement.classList.toggle('light', savedTheme === 'light');
document.documentElement.classList.toggle('opaque', savedTheme === 'opaque');

createRoot(document.getElementById('root')!).render(<App />);
