import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './shared/context/AuthContext';
import { NotificationProvider } from './shared/context/NotificationContext';

export function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
