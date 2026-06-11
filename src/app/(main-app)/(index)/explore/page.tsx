import { Metadata } from 'next';
import ExploreView from '@/components/explore/ExploreView';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Discover communities, villages, and shared passions on Mosaic.',
};

export default function ExplorePage() {
  return <ExploreView />;
}

