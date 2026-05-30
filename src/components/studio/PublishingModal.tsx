import React from 'react';
import { X, CheckCircle, FileText, Share2, Users, PlayCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProjectDetail } from '@/services/projects';
import { ROUTES } from '@/lib/routes';

export type PublishStep = 'draft' | 'review' | 'attribution' | 'revenue' | 'signing' | 'success';

export default function PublishingModal({
  publishStep,
  setPublishStep,
  project,
  communityId,
  projectId,
  artifactId,
  nextPublishStep
}: {
  publishStep: PublishStep;
  setPublishStep: (val: PublishStep | null) => void;
  project: ProjectDetail | null;
  communityId: string;
  projectId: string;
  artifactId: string | null;
  nextPublishStep: (current: PublishStep) => void;
}) {
  const router = useRouter();

  if (!publishStep) return null;

  return (
    <div className="fixed inset-0 bg-theme-forest/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-theme-parchment w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-theme-outline/20 flex justify-between items-center bg-theme-surface-low">
          <h2 className="font-serif text-xl font-medium text-theme-forest">Publish Artifact</h2>
          <button onClick={() => setPublishStep(null)} className="text-theme-on-surface/50 hover:text-theme-forest cursor-pointer"><X size={20} /></button>
        </div>
        
        {/* Body */}
        <div className="p-8">
          
          {publishStep === 'draft' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-4 text-theme-forest">
                <div className="w-12 h-12 rounded-full bg-theme-clay/20 flex items-center justify-center text-theme-accent"><FileText size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg">Initiate Publishing</h3>
                  <p className="text-sm text-theme-on-surface/70">Prepare this draft to be sealed in the Library of Memory.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-theme-outline/20 space-y-3">
                <div className="flex items-center gap-3 text-sm"><CheckCircle size={16} className="text-green-600" /> Title & Metadata complete</div>
                <div className="flex items-center gap-3 text-sm"><CheckCircle size={16} className="text-green-600" /> 0 Unresolved comments</div>
                <div className="flex items-center gap-3 text-sm"><CheckCircle size={16} className="text-green-600" /> Connected to Project: <strong>{project?.title}</strong></div>
              </div>
            </div>
          )}

          {publishStep === 'review' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <div>
                <h3 className="font-bold text-lg mb-1">Select Reviewers</h3>
                <p className="text-sm text-theme-on-surface/70 mb-4">Choose project stewards to cryptographically sign off on this publication.</p>
              </div>
              <div className="space-y-3">
                {project?.contributors.filter(c => c.id !== 'user_123').map(c => (
                  <label key={c.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-theme-outline/20 cursor-pointer hover:border-theme-clay">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-theme-accent rounded border-theme-outline/30" defaultChecked />
                      <div>
                        <p className="font-bold text-sm text-theme-forest">{c.name}</p>
                        <p className="text-xs text-theme-on-surface/60">{c.role}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-theme-clay text-white flex items-center justify-center text-xs font-bold">{c.initials}</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {publishStep === 'attribution' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <div>
                <h3 className="font-bold text-lg mb-1">Attribution Check</h3>
                <p className="text-sm text-theme-on-surface/70 mb-4">Review the percentage of contribution based on edit history.</p>
              </div>
              
              <div className="flex items-center gap-8">
                {/* Simulated Pie Chart */}
                <div className="w-32 h-32 rounded-full border-[16px] border-green-400 relative shrink-0">
                  <div className="absolute inset-[-16px] border-[16px] border-blue-400 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)' }}></div>
                  <div className="absolute inset-[-16px] border-[16px] border-orange-400 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0 100%, 0 50%)' }}></div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded"></div> <span className="font-bold">Amina Diallo</span></div>
                    <span className="font-mono text-theme-on-surface/70">45%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-400 rounded"></div> <span className="font-bold">David Adeleke (You)</span></div>
                    <span className="font-mono text-theme-on-surface/70">30%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded"></div> <span className="font-bold">Kofi Mensah</span></div>
                    <span className="font-mono text-theme-on-surface/70">25%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {publishStep === 'revenue' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <div>
                <h3 className="font-bold text-lg mb-1">Treasury Split</h3>
                <p className="text-sm text-theme-on-surface/70 mb-4">Allocate how future rewards or donations for this artifact are distributed.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-theme-outline/20 space-y-4">
                <div className="flex items-center justify-between p-3 bg-theme-surface-low rounded border border-theme-outline/10">
                  <div className="flex items-center gap-3">
                    <Share2 size={16} className="text-theme-accent" />
                    <span className="text-sm font-bold text-theme-forest">Community Treasury (Scribes)</span>
                  </div>
                  <input type="text" value="20%" className="w-16 bg-white border border-theme-outline/20 rounded p-1 text-center text-sm font-mono" readOnly />
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-surface-low rounded border border-theme-outline/10">
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-theme-forest" />
                    <span className="text-sm font-bold text-theme-forest">Authors (Pro-rata by attribution)</span>
                  </div>
                  <input type="text" value="80%" className="w-16 bg-white border border-theme-outline/20 rounded p-1 text-center text-sm font-mono" readOnly />
                </div>
              </div>
            </div>
          )}

          {publishStep === 'signing' && (
            <div className="space-y-6 py-12 flex flex-col items-center text-center animate-in fade-in">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 border-4 border-theme-outline/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-theme-accent rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-theme-accent"><PlayCircle size={32} className="animate-pulse" /></div>
              </div>
              <h3 className="font-serif text-2xl text-theme-forest">Writing to Ledger...</h3>
              <p className="text-sm text-theme-on-surface/60 font-mono">Awaiting cryptographic signatures and compiling payload.</p>
            </div>
          )}

          {publishStep === 'success' && (
            <div className="space-y-6 py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="font-serif text-3xl text-theme-forest">Artifact Sealed</h3>
              <p className="text-sm text-theme-on-surface/70 max-w-sm">
                &quot; Songhai Lineage Translation Draft &quot; has been successfully published to the Library of Memory.
              </p>
              <div className="bg-theme-surface-low p-3 rounded border border-theme-outline/20 w-full font-mono text-xs text-theme-on-surface/50 truncate select-all">
                TxID: 0x8a92f...4c9e81b2a7d4e5f6
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        {publishStep !== 'signing' && publishStep !== 'success' && (
          <div className="px-8 py-5 border-t border-theme-outline/20 bg-theme-surface-low flex justify-between items-center">
            <button 
              onClick={() => setPublishStep(null)}
              className="text-xs uppercase tracking-widest font-bold text-theme-on-surface/50 hover:text-theme-forest cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={() => nextPublishStep(publishStep!)}
              className="bg-theme-forest text-theme-parchment px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90 flex items-center gap-2"
            >
              {publishStep === 'revenue' ? 'Sign & Publish' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {publishStep === 'success' && (
          <div className="px-8 py-5 border-t border-theme-outline/20 bg-theme-surface-low flex justify-center gap-4">
            <button 
              onClick={() => {
                setPublishStep(null);
                if (artifactId) {
                  router.push(ROUTES.ARTIFACT(artifactId));
                } else {
                  router.push(ROUTES.VILLAGE.PROJECT(communityId, projectId));
                }
              }}
              className="bg-theme-forest text-theme-parchment px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90"
            >
              View Publication
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
