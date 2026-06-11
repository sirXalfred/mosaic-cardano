"use client";
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Check, HashIcon, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { TexturedCard } from '../ui/textured-card';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

const pricingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

interface PricingCardProps {
  title: string;
  description: string;
  price?: string | number;
  interval?: string;
  originalPrice?: string | number;
  features: string[];
  buttonText: string;
  isEmphasized?: boolean;
  popular?: boolean;
  patternId: 1 | 2 | 3 | 4 | 5;
  patternColor: string;
  onClick?: () => void;
}

const PricingCard = ({
  title,
  description,
  price,
  interval,
  originalPrice,
  features,
  buttonText,
  isEmphasized,
  popular,
  patternId,
  patternColor,
  onClick,
}: PricingCardProps) => {
  return (
    <motion.div variants={pricingVariants} className={`h-full relative ${isEmphasized ? 'z-10' : ''}`}>
      {isEmphasized && (
        <div className="absolute -inset-[2px] bg-gradient-to-b from-theme-accent/50 to-theme-clay/20 rounded-[26px] blur-sm -z-10"></div>
      )}

      <TexturedCard
        patternId={patternId}
        patternColor={patternColor}
        patternOpacity={isEmphasized ? "opacity-20" : "opacity-10"}
        className={`h-full flex flex-col transition-all duration-500 rounded-3xl p-8 relative overflow-hidden ${isEmphasized
            ? 'bg-theme-parchment shadow-2xl hover:border hover:border-theme-accent/30 hover:-translate-y-2'
            : 'bg-theme-surface-high/80 backdrop-blur-xl border-2 border-theme-outline/20 shadow-lg hover:shadow-xl hover:border-theme-accent/30 hover:-translate-y-2'
          }`}
      >
        {popular && (
          <div className={`absolute -top-[10px] -right-[70px] bg-theme-accent text-theme-parchment text-[10px] font-bold uppercase tracking-widest px-10 py-1.5 rotate-45 shadow-lg text-center text-nowrap w-40 z-20`}>
            Most Popular
          </div>
        )}

        <h3 className="font-serif text-2xl text-theme-forest mb-2">{title}</h3>
        <p className="text-sm text-theme-on-surface/60 mb-6">{description}</p>

        <div className="mb-8 flex flex-col gap-1">
          {price !== undefined ? (
            <>
              {originalPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl text-theme-on-surface/40 line-through decoration-red-500/50 decoration-2 font-serif">
                     <span className="sr-only">original price of {title} plan: </span>${originalPrice}
                  </span>
                  <span className="bg-theme-accent/10 text-theme-accent border border-theme-accent/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">
                    60% Off Beta
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-serif text-theme-forest">
                  ${price}
                </span>
                {interval && <span className="text-theme-on-surface/50">/{interval}</span>}
              </div>
            </>
          ) : (
            <div className="flex items-baseline gap-2 mt-7">
              <span className="text-4xl font-serif text-theme-forest">Let&apos;s Talk</span>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-10 flex-1 mt-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-theme-on-surface/80">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isEmphasized ? 'bg-theme-accent/20' : 'bg-theme-outline/20'}`}>
                <Check size={12} className={isEmphasized ? "text-theme-accent" : "text-theme-on-surface/60"} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={onClick}
          variant={isEmphasized ? "default" : "outline"}
          className="w-full uppercase tracking-widest font-bold text-xs py-6 shadow-xl hover:shadow-theme-accent/20"
        >
          {buttonText}
        </Button>
      </TexturedCard>
    </motion.div>
  );
};

export const PricingSection = ({ containerVariants }: { containerVariants: Variants }) => {
  const router = useRouter();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-32 px-6 relative z-10 w-full flex flex-col items-center"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-theme-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="text-center mb-20">
        <motion.div variants={pricingVariants} className="inline-flex items-center gap-2 bg-theme-accent/10 text-theme-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <HashIcon size={14} /> Now In Beta
        </motion.div>
        <motion.h2 variants={pricingVariants} className="font-serif text-5xl md:text-6xl text-theme-forest mb-6">Sustain Your Village</motion.h2>
        <motion.p variants={pricingVariants} className="font-sans text-lg text-theme-on-surface/70 max-w-2xl mx-auto">
          Start your community with our exclusive beta rates. Prices are displayed in USD but will be paid in their ADA equivalent.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        <PricingCard
          title="Basic"
          description="Perfect for testing the waters with your community."
          price={8}
          originalPrice={20}
          interval="mo"
          features={[
            'Create 1 Village',
            'Up to 50 Members',
            'Standard Piece Storage',
            'Basic Governance Tools'
          ]}
          buttonText="Get Started"
          patternId={1}
          patternColor="text-theme-clay"
          onClick={() => router.push(ROUTES.AUTH)}
        />

        <PricingCard
          title="Pro"
          description="Build a lasting foundation for your members."
          price={60}
          originalPrice={150}
          interval="mo"
          features={[
            'Create Unlimited Villages',
            'Up to 500 Members/Village',
            'Premium Piece Storage',
            'Advanced Governance Tools',
            'Custom Theming'
          ]}
          buttonText="Upgrade to Pro"
          isEmphasized
          popular
          patternId={2}
          patternColor="text-theme-accent"
          onClick={() => router.push(ROUTES.AUTH)}
        />

        <PricingCard
          title="Custom"
          description="For large institutions and distributed networks."
          features={[
            'Unlimited Villages & Members',
            'Dedicated Storage Nodes',
            'White-label Options',
            'SLA & Priority Support',
            'Custom Integrations'
          ]}
          buttonText="Contact Sales"
          patternId={3}
          patternColor="text-theme-forest"
          onClick={() => { window.location.href = 'mailto:sales@mosaic.so'; }}
        />
      </div>

      <motion.div variants={pricingVariants} className="mt-16 flex items-center gap-2 text-sm text-theme-on-surface/50 bg-theme-surface-high px-4 py-2 rounded-full border border-theme-outline/10">
        <Info size={16} />
        Future limits on invitations and memberships will be enforced post-beta.
      </motion.div>
    </motion.section>
  );
};
