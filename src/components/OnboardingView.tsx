"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NICHES } from '../lib/data';
import { Button } from './ui/button';
import { getAIOnboardingInsights, useSetOnboardingInfo } from '@/services/onboarding';
import { useGetCommunitiesForTopics, useGetPopularCommunities } from '@/services/communities';
import type { CommunityNode } from '@/types/schemas';

export default function OnboardingView() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [aiStory, setAiStory] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const popularCommunitiesQuery = useGetPopularCommunities(5);
  const recommendedCommunitiesQuery = useGetCommunitiesForTopics(selectedNiches, step >= 2 && selectedNiches.length > 0, 10);

  const handleAiDiscovery = async () => {
    if (!aiStory) return;
    setIsAiLoading(true);

    try {
      const insights = await getAIOnboardingInsights(aiStory);
      if (insights?.suggested_niche_ids) setSelectedNiches(insights.suggested_niche_ids);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const onboardMut = useSetOnboardingInfo();

  const mergeCommunities = (lists: CommunityNode[][]): CommunityNode[] => {
    const out: CommunityNode[] = [];
    const seen = new Set<string>();
    for (const list of lists) {
      for (const c of list) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          out.push(c);
        }
      }
    }
    return out;
  };

  const villages = mergeCommunities([
    popularCommunitiesQuery.data ?? [],
    recommendedCommunitiesQuery.data ?? [],
  ]);

  const handleComplete = async () => {
    if (onboardMut.status === 'pending') return;

    try {
      await onboardMut.mutateAsync({
        skills: selectedNiches,
        topics: selectedNiches,
        communities: joined,
      });

      router.push('/explore');
    } catch (err) {
      console.error('Onboarding failed', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="min-h-screen flex flex-col items-center py-20 px-6 w-full relative z-30">
      <div className="max-w-4xl w-full">
        <div className="mb-16 text-center">
          <div className="flex justify-center gap-2 mb-8">
            <div className={`h-1 rounded-full transition-all duration-700 ${step >= 1 ? 'w-12 bg-[#4338CA]' : 'w-4 bg-black/5'}`} />
            <div className={`h-1 rounded-full transition-all duration-700 ${step >= 2 ? 'w-12 bg-[#4338CA]' : 'w-4 bg-black/5'}`} />
          </div>
          <h2 className="font-serif text-5xl mb-4 italic text-[#111827]">{step === 1 ? 'What draws you in?' : 'Public Villages near you.'}</h2>
          <p className="text-xl opacity-50 text-[#111827]">{step === 1 ? 'Tell us your story or select niches manually.' : 'Join at least one to enter the square.'}</p>
        </div>

        {step === 1 && (
          <div className="mb-12">
            <div className="relative mb-8 group">
              <textarea value={aiStory} onChange={(e) => setAiStory(e.target.value)} placeholder="I am a storyteller who finds inspiration in late-night walks through the city..." className="w-full min-h-[120px] bg-white border border-black/5 rounded-[2rem] p-8 outline-none focus:border-[#4338CA] transition-all text-lg italic font-serif resize-none shadow-sm" />
              <Button onClick={handleAiDiscovery} disabled={isAiLoading || !aiStory} variant="accent" size="sm" className="absolute bottom-6 right-6">
                <div className="flex items-center gap-2 disabled:scale-100">
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Find my Niches ✨
                </div>
              </Button>
            </div>
          </div>
        )}

          {step === 1 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {NICHES.map(n => (
              <Button key={n.id} onClick={() => setSelectedNiches(prev => prev.includes(n.id) ? prev.filter(x => x !== n.id) : [...prev, n.id])} variant={selectedNiches.includes(n.id) ? "cardActive" : "outline"} size="card" className="duration-500 flex flex-col items-center gap-4">
                <div className="opacity-60">{n.icon}</div>
                <span className="font-serif italic text-lg">{n.label}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {villages.map(v => (
              <div key={v.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all duration-500 ${joined.includes(v.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-black/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${joined.includes(v.id) ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{v.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-[#111827]">{v.name}</h4>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest text-[#111827]">{v.slug.replace(/-/g, ' ')} • public community</p>
                  </div>
                </div>
                <Button onClick={() => setJoined(prev => prev.includes(v.id) ? prev.filter(x => x !== v.id) : [...prev, v.id])} variant={joined.includes(v.id) ? "default" : "secondary"} size="sm">{joined.includes(v.id) ? 'Joined' : 'Join'}</Button>
              </div>
            ))}

            {recommendedCommunitiesQuery.isPending && (
              <div className="p-6 rounded-[2.5rem] border border-black/5 bg-white animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50" />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-black/10 mb-2" />
                    <div className="h-3 w-44 rounded bg-black/10" />
                  </div>
                </div>
              </div>
            )}

            {step >= 2 && villages.length === 0 && !popularCommunitiesQuery.isPending && !recommendedCommunitiesQuery.isPending && (
              <div className="p-6 rounded-[2.5rem] border border-black/5 bg-white text-[#111827] opacity-70">
                No communities found yet. Try selecting different niches.
              </div>
            )}
          </div>
        )}

        <div className="mt-16 flex justify-center">
          {step === 1 ? (
            <Button disabled={selectedNiches.length === 0} onClick={() => setStep(2)} variant="default" size="lg">Continue</Button>
          ) : (
            <Button disabled={joined.length === 0 || ['pending', 'success'].includes(onboardMut.status)} onClick={handleComplete} variant="accent" size="lg">{['pending', 'success'].includes(onboardMut.status)? 'Saving...' : 'Enter the Square'}</Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
