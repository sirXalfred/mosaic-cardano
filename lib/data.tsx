import React from 'react';
import { PenTool, Map, Music, Camera, Globe } from 'lucide-react';

export const MOSAIC_EASE = [0.22, 1, 0.36, 1];

export const VILLAGES = [
  { id: 1, name: 'Lagos Poetry Circle', niche: 'Literary', type: 'Collective', icon: <PenTool size={18} />, members: 124, mva: 8.4, signals: { financial: 10, social: 40, cultural: 40, knowledge: 10 }, preview: 'The dust settles on the windowsill like unwritten letters...' },
  { id: 2, name: 'Nairobi Hiking Club', niche: 'Exploration', type: 'Village', icon: <Map size={18} />, members: 89, mva: 7.2, signals: { financial: 5, social: 25, cultural: 30, knowledge: 40 }, preview: 'Documentation of the southern trails. We recorded three rare bird sightings...' },
  { id: 3, name: 'Abuja Sound Lab', niche: 'Music', type: 'Collective', icon: <Music size={18} />, members: 56, mva: 9.1, signals: { financial: 30, social: 30, cultural: 30, knowledge: 10 }, preview: 'A collaborative soundscape recording the textures of Wuse Market...' },
  { id: 4, name: 'Accra Visualists', niche: 'Visual Arts', type: 'Guild', icon: <Camera size={18} />, members: 210, mva: 8.9, signals: { financial: 20, social: 30, cultural: 40, knowledge: 10 }, preview: 'Capturing the high-contrast shadows of the Jamestown alleys...' },
  { id: 5, name: 'Ibadan Archivists', niche: 'Knowledge', type: 'Circle', icon: <Globe size={18} />, members: 45, mva: 6.8, signals: { financial: 10, social: 20, cultural: 20, knowledge: 50 }, preview: 'Preserving oral histories from the older quarters of the city...' }
];

export const NICHES = [
  { id: 'lit', label: 'Literary Arts', icon: <PenTool size={20} /> },
  { id: 'vis', label: 'Visual Arts', icon: <Camera size={20} /> },
  { id: 'mus', label: 'Music & Audio', icon: <Music size={20} /> },
  { id: 'exp', label: 'Exploration', icon: <Map size={20} /> },
  { id: 'knw', label: 'Knowledge', icon: <Globe size={20} /> }
];

export const PERKS = [
  { title: 'Village Economy', desc: 'Every contribution earns a share of the community treasury automatically.', accent: '#F59E0B' },
  { title: 'On-Chain Provenance', desc: 'Your creative journey is timestamped and anchored on the Cardano blockchain.', accent: '#4338CA' },
  { title: 'Multi-Capital Value', desc: 'We track cultural impact, making human creativity legible to the world.', accent: '#0D9488' }
];
