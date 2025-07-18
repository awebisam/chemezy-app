import { AuthProvider, AuthGuard } from '@/components/auth';
import { AuthPage } from '@/pages/AuthPage';

function App() {
  return (
    <AuthProvider>
      <AuthGuard requireAuth={false}>
        <AuthPage />
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
