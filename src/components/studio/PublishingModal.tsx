import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, FileText, PlayCircle, ChevronRight, Users, Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { CloseButton } from '../ui/close-button';
import { usePublishDocument, useProposeSplits, useFreezeContent, useUpdateDocument } from '@/services/documents';
import { useGetAuthState } from '@/services/auth';
import { DocumentDetails, PublishStep } from '@/types/mosaic';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PublishingModal({
  publishStep,
  setPublishStep,
  document,
  communities,
  nextPublishStep
}: {
  publishStep: PublishStep;
  setPublishStep: (val: PublishStep | null) => void;
  document: DocumentDetails | null;
  communities: { id: string, name: string }[];
  nextPublishStep: (current: PublishStep) => void;
}) {
  const [selectedCommunity, setSelectedCommunity] = useState<string>(document?.communityId || '');
  const [pieceId, setPieceId] = useState<string>(publishStep === 'success' ? document?.id || '' : '');
  
  const { mutateAsync: publishDocument } = usePublishDocument();
  const { mutateAsync: proposeSplits, isPending: isProposing } = useProposeSplits();
  const { mutateAsync: freezeContent, isPending: isFreezing } = useFreezeContent();
  const { mutateAsync: updateDocument, isPending: isCanceling } = useUpdateDocument();
  const { data: authState } = useGetAuthState();
  const isCreator = document?.creator?.id === authState?.user?.id;

  // Local state for split proposals
  const [splits, setSplits] = useState<{ userId: string, name: string, role: string, weight: number }[]>([]);

  useEffect(() => {
    if (publishStep === 'draft' && document?.publishStage && document.publishStage !== 'draft') {
      setPublishStep(document.publishStage);
    }
  }, [publishStep, document?.publishStage, setPublishStep]);

  useEffect(() => {
    if (document?.contributions) {
      if (publishStep === 'propose') {
        const count = document.contributions.length;
        const equalShare = count > 0 ? Number((100 / count).toFixed(2)) : 0;
        // Fix rounding error for last element
        setSplits(document.contributions.map((c, i) => ({
          userId: c.userId,
          name: c.name,
          role: c.role || 'Contributor',
          weight: i === count - 1 ? Number((100 - (equalShare * (count - 1))).toFixed(2)) : equalShare
        })));
      } else {
        setSplits(document.contributions.map(c => ({
          userId: c.userId,
          name: c.name,
          role: c.role || 'Contributor',
          weight: publishStep === 'draft' ? 0 : (c.weight || 0)
        })));
      }
    }
  }, [document, publishStep]);

  const hasMintedRef = useRef(false);

  // Handle the automatic transition when reaching the mint step
  useEffect(() => {
    let isMounted = true;

    async function executeMint() {
      if (publishStep === 'mint' && document && !hasMintedRef.current) {
        hasMintedRef.current = true;
        try {
          // Upload to IPFS logic is handled by backend or mesh SDK before calling this,
          // or inside the publishDocument endpoint.
          const res = await publishDocument({
            documentId: document.id,
            communityId: selectedCommunity
          });
          
          if (isMounted && res.success) {
            setPieceId(res.pieceId);
            setPublishStep('success');
          }
        } catch (e) {
          console.error(e);
          if (isMounted) {
            setPublishStep('draft');
            hasMintedRef.current = false;
          }
        }
      }
    }

    executeMint();

    return () => {
      isMounted = false;
    };
  }, [publishStep, document, publishDocument, selectedCommunity, setPublishStep]);

  if (!publishStep || !document) return null;

  const allSigned = document.contributions?.every(c => c.status === 'Signed') || false;
  
  // Calculate total weight to validate splits
  const totalWeight = splits.reduce((sum, s) => sum + s.weight, 0);
  const isValidSplits = Math.abs(totalWeight - 100) < 0.01;

  const handleWeightChange = (uId: string, w: string) => {
    setSplits(prev => prev.map(s => s.userId === uId ? { ...s, weight: parseFloat(w) || 0 } : s));
  };

  const handleRoleChange = (uId: string, r: string) => {
    setSplits(prev => prev.map(s => s.userId === uId ? { ...s, role: r } : s));
  };

  const handleContinue = async () => {
    if (publishStep === 'community') {
      if (!selectedCommunity) return alert('Select a community');
      
      setPublishStep('freezing');
      try {
        const res = await freezeContent({ documentId: document.id, communityId: selectedCommunity });
        if (res.success) {
          if (document.contributions && document.contributions.length > 1) {
            setPublishStep('propose');
          } else {
            setPublishStep('mint');
          }
        }
      } catch (e) {
        console.error(e);
        setPublishStep('community');
      }
      return;
    }

    if (publishStep === 'propose') {
      if (!isValidSplits) return alert('Splits must equal 100%');
      await proposeSplits({
        documentId: document.id,
        splits: splits.map(s => ({ userId: s.userId, role: s.role, weight: s.weight }))
      });
      setPublishStep('waiting');
      return;
    }

    if (publishStep === 'waiting') {
      if (!allSigned) return alert('Waiting for all contributors to sign');
      setPublishStep('mint');
      return;
    }

    if (publishStep === 'mint') {
      // The useEffect handles the actual API call
      return;
    }

    nextPublishStep(publishStep);
  };

  const handleCancelPublishing = async () => {
    if (!document) return;
    try {
      await updateDocument({
        documentId: document.id,
        updates: { publishStage: 'draft' }
      });
      setPublishStep(null);
    } catch (e) {
      console.error(e);
      alert('Failed to cancel publishing');
    }
  };

  return (
    <div className="fixed inset-0 bg-theme-forest/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-theme-parchment w-full max-w-2xl relative rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-theme-outline/20 flex justify-between items-center bg-theme-surface-low">
          <h2 className="font-serif text-xl font-medium text-theme-forest">Publish Piece</h2>
          <CloseButton onClick={() => setPublishStep(null)} />
        </div>
        
        {/* Body */}
        <div className="p-8">
          
          {publishStep === 'draft' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-4 text-theme-forest">
                <div className="w-12 h-12 rounded-full bg-theme-clay/20 flex items-center justify-center text-theme-accent"><FileText size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg">Initiate Publishing</h3>
                  <p className="text-sm text-theme-on-surface/70">Prepare to finalize and publish this piece.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-theme-outline/20 space-y-3">
                <div className="flex items-center gap-3 text-sm"><CheckCircle size={16} className="text-green-600" /> Title & Metadata complete</div>
                <div className="flex items-center gap-3 text-sm"><CheckCircle size={16} className="text-green-600" /> Connected to Personal Workspace</div>
                <div className="flex items-center gap-3 text-sm"><CheckCircle size={16} className="text-green-600" /> {document.contributions?.length || 1} Contributors involved</div>
              </div>
            </div>
          )}

          {publishStep === 'community' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <div>
                <h3 className="font-bold text-lg mb-1">Select Target Community</h3>
                <p className="text-sm text-theme-on-surface/70 mb-4">Choose which community you want to publish this piece to.</p>
              </div>
              <div className="space-y-3">
                {communities.length === 0 ? (
                  <p className="text-sm text-theme-on-surface/50">You are not a member of any communities.</p>
                ) : (
                  communities.map(c => (
                    <label key={c.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-theme-outline/20 cursor-pointer hover:border-theme-clay">
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="community"
                          value={c.id}
                          checked={selectedCommunity === c.id}
                          onChange={(e) => setSelectedCommunity(e.target.value)}
                          className="w-4 h-4 text-theme-accent rounded border-theme-outline/30" 
                        />
                        <div>
                          <p className="font-bold text-sm text-theme-forest">{c.name}</p>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {publishStep === 'freezing' && (
            <div className="space-y-6 py-12 flex flex-col items-center text-center animate-in fade-in">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 border-4 border-theme-outline/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-theme-accent rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-theme-accent"><FileText size={32} className="animate-pulse" /></div>
              </div>
              <h3 className="font-serif text-2xl text-theme-forest">Securing Content...</h3>
              <p className="text-sm text-theme-on-surface/60 font-mono">Securely storing your content permanently.</p>
            </div>
          )}

          {publishStep === 'propose' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <div>
                <h3 className="font-bold text-lg mb-1">Propose Contribution Splits</h3>
                <p className="text-sm text-theme-on-surface/70 mb-4">Define the ownership structure for this piece. Total must equal 100%.</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  {splits.map(s => (
                    <div key={s.userId} className="flex items-center justify-between p-3 bg-white border border-theme-outline/20 rounded-lg">
                      <span className="text-sm font-bold w-1/3">{s.name}</span>
                      <input 
                        type="text" 
                        placeholder="Role (e.g. Writer)" 
                        value={s.role} 
                        onChange={(e) => handleRoleChange(s.userId, e.target.value)}
                        className="border border-theme-outline/20 rounded px-2 py-1 text-sm w-1/3 outline-none focus:border-theme-accent/50"
                      />
                      <div className="flex items-center gap-1 w-1/4 justify-end">
                        <input 
                          type="number" 
                          value={s.weight} 
                          onChange={(e) => handleWeightChange(s.userId, e.target.value)}
                          className="border border-theme-outline/20 rounded px-2 py-1 text-sm w-16 text-right outline-none focus:border-theme-accent/50"
                        />
                        <span className="text-sm text-theme-on-surface/50">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pie Chart Distribution */}
                <div className="w-full md:w-1/3 h-48 flex flex-col items-center justify-center bg-theme-surface-low rounded-xl border border-theme-outline/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={splits}
                        dataKey="weight"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                      >
                        {splits.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`text-sm font-bold text-right ${isValidSplits ? 'text-green-600' : 'text-red-500'}`}>
                Total Allocation: {totalWeight}% {isValidSplits ? '(Valid)' : '(Must be 100%)'}
              </div>
            </div>
          )}

          {publishStep === 'waiting' && (
            <div className="space-y-6 py-8 flex flex-col items-center text-center animate-in fade-in">
              <div className="w-16 h-16 bg-theme-clay/10 rounded-full flex items-center justify-center text-theme-accent mb-2">
                <Users size={32} />
              </div>
              <h3 className="font-serif text-2xl text-theme-forest">Waiting for Signatures</h3>
              <p className="text-sm text-theme-on-surface/70 max-w-sm">
                The contribution splits have been proposed. We are now waiting for all contributors to cryptographically sign to confirm their share.
              </p>
              
              <div className="w-full text-left bg-white p-4 rounded-xl border border-theme-outline/20 space-y-2 mt-4">
                {document.contributions?.map(c => (
                  <div key={c.userId} className="flex justify-between text-sm">
                    <span>{c.name} ({c.weight}%)</span>
                    <span className={`font-bold ${c.status === 'Signed' ? 'text-green-600' : 'text-theme-accent'}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {publishStep === 'mint' && (
            <div className="space-y-6 py-12 flex flex-col items-center text-center animate-in fade-in">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 border-4 border-theme-outline/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-theme-accent rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-theme-accent"><PlayCircle size={32} className="animate-pulse" /></div>
              </div>
              <h3 className="font-serif text-2xl text-theme-forest">Finalizing Publication...</h3>
              <p className="text-sm text-theme-on-surface/60 font-mono">Securing the publication on the blockchain.</p>
            </div>
          )}

          {publishStep === 'success' && (
            <div className="space-y-6 py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="font-serif text-3xl text-theme-forest">Piece Published</h3>
              <p className="text-sm text-theme-on-surface/70 max-w-sm">
                &quot; {document.title || 'Untitled Draft'} &quot; has been successfully secured on the blockchain and added to the Community Library.
              </p>
              <div className="bg-theme-surface-low p-3 rounded border border-theme-outline/20 w-full font-mono text-xs text-theme-on-surface/50 truncate select-all">
                Piece ID: {pieceId || 'Unknown'}
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        {publishStep !== 'mint' && publishStep !== 'success' && publishStep !== 'freezing' && (
          <div className="px-8 py-5 border-t border-theme-outline/20 bg-theme-surface-low flex justify-between items-center">
            <div className="flex gap-4">
              <button 
                onClick={() => setPublishStep(null)}
                className="text-xs uppercase tracking-widest font-bold text-theme-on-surface/50 hover:text-theme-forest cursor-pointer"
              >
                Close
              </button>
              {isCreator && publishStep !== 'community' && (
                <button 
                  onClick={handleCancelPublishing}
                  disabled={isCanceling}
                  className="text-xs uppercase tracking-widest font-bold text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isCanceling && <Loader2 size={12} className="animate-spin" />}
                  Cancel Publishing
                </button>
              )}
            </div>
            <button 
              onClick={handleContinue}
              disabled={isProposing || isFreezing || (publishStep === 'propose' && !isValidSplits) || (publishStep === 'waiting' && !allSigned)}
              className="bg-theme-forest text-theme-parchment px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isProposing || isFreezing) ? <Loader2 size={16} className="animate-spin" /> : null}
              {publishStep === 'waiting' && allSigned ? 'Publish & Mint' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {publishStep === 'success' && (
          <div className="px-8 py-5 border-t border-theme-outline/20 bg-theme-surface-low flex justify-center gap-4">
            <Link
              href={pieceId ? ROUTES.ARTIFACT(pieceId) : ROUTES.WORKSPACE}
              className="bg-theme-forest text-theme-parchment px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90"
            >
              View Piece
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
}
