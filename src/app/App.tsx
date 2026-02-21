import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { KPIDataProvider } from './context/KPIDataContext';

export default function App() {
  return (
    <KPIDataProvider>
      <RouterProvider router={router} />
    </KPIDataProvider>
  );
}
