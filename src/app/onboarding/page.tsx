import { OnboardedGuard } from '@/contexts/onboard-guard';
import OnboardingView from '../../components/OnboardingView';

export default function OnboardingPage() {
  return <OnboardedGuard>
    <OnboardingView />;
  </OnboardedGuard>;
}
