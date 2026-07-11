import React from 'react';
import { useGetBadges, useClaimBadge } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useModals } from '@/contexts/modals-context';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, Sparkles, Hexagon } from 'lucide-react';
import { toast } from 'sonner';
import { getBadgeConfig } from '@/lib/badges';


export function BadgesModal() {
    const { isOpen: checkIsOpen, closeModal } = useModals();
    const isOpen = checkIsOpen('BADGES');
    
    const { data, isLoading } = useGetBadges();
    const claimMutation = useClaimBadge();

    const badges = data?.badges || [];

    const [claimingBadgeId, setClaimingBadgeId] = React.useState<string | null>(null);

    const handleClaim = async (badgeId: string) => {
        try {
            setClaimingBadgeId(badgeId);
            await claimMutation.mutateAsync(badgeId);
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            toast.success("Badge minted on-chain successfully!");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to mint badge");
        } finally {
            setClaimingBadgeId(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal('BADGES')}>
            <DialogContent className="sm:max-w-[600px] bg-theme-surface border-theme-outline/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-theme-forest font-bold">
                        <Award className="w-6 h-6" />
                        Your On-Chain Badges
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <span className="animate-spin text-theme-forest"><Hexagon className="w-8 h-8" /></span>
                        </div>
                    ) : badges.length === 0 ? (
                        <div className="text-center text-theme-on-surface/50 py-10">
                            <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>You haven&apos;t earned any badges yet.</p>
                            <p className="text-sm mt-1">Participate in communities to earn your first badge!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {badges.map((badge) => {
                                    const config = getBadgeConfig(badge.type);
                                    const isThisBadgeClaiming = claimingBadgeId === badge.id;
                                    return (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-3 transition-all ${
                                            badge.status === 'CLAIMED' 
                                                ? 'bg-theme-surface-high border-theme-forest/30 shadow-sm' 
                                                : 'bg-theme-forest/5 border-theme-forest shadow-[0_0_15px_rgba(var(--theme-forest-rgb),0.2)]'
                                        }`}
                                    >
                                        {badge.status === 'UNCLAIMED' && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-clay text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-md z-10">
                                                <Sparkles className="w-3 h-3" /> New
                                            </div>
                                        )}
                                        
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${
                                            badge.status === 'CLAIMED' ? 'from-theme-forest to-theme-clay' : 'from-theme-surface-high to-theme-outline/20'
                                        } shadow-inner`}>
                                            <span className={`text-3xl ${badge.status === 'CLAIMED' ? 'opacity-100' : 'opacity-40 grayscale'}`}>{config.icon}</span>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-sm text-theme-on-surface">{config.name}</h4>
                                            {badge.status === 'CLAIMED' && (
                                                <a 
                                                    href={`https://preprod.cardanoscan.io/transaction/${badge.txHash}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-[10px] text-theme-forest hover:underline"
                                                >
                                                    View on Explorer
                                                </a>
                                            )}
                                        </div>

                                        {badge.status === 'UNCLAIMED' && (
                                            <Button 
                                                size="sm" 
                                                className="w-full mt-2 font-bold shadow-md shadow-theme-clay/20 hover:scale-105 transition-transform"
                                                onClick={() => handleClaim(badge.id)}
                                                disabled={claimingBadgeId !== null}
                                            >
                                                {isThisBadgeClaiming ? 'Minting...' : 'Claim Badge'}
                                            </Button>
                                        )}
                                    </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
