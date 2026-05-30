import ExploreView from '@/components/explore/ExploreView';
import { AuthGuard } from '@/contexts/auth-guard';

export default function ExplorePage() {
  return <AuthGuard>
   <ExploreView />;
   </AuthGuard>
}

