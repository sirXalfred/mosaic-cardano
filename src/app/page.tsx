import { Metadata } from 'next';
import LandingView from '../components/LandingView';

export const metadata: Metadata = {
  title: 'Landing',
  description: 'Mosaic is a village platform for communities of any shared interest, passion, or hobby.',
};

export default function Page() {
  return <LandingView />;
}
