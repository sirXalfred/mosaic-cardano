import { AuthGuard } from '@/contexts/auth-guard';
import AuthView from '../../components/AuthView';

export default function AuthPage() {
  return <AuthGuard>
    <AuthView />
  </AuthGuard>
}
