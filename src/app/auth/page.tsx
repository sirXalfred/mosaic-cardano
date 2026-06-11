import { Metadata } from 'next';
import AuthView from '../../components/AuthView';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Join Mosaic and find your community.',
};

export default function AuthPage() {
  return <AuthView />;
}
