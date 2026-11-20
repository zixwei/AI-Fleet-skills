import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DatePicker } from './components/DatePicker';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DatePicker />
  </StrictMode>,
);
