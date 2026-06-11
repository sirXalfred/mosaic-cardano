import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { Compass, ArrowRight, BookOpen, Users, Leaf, Music, Code, Camera, Globe, Palette, Mic, MessageCircle, Heart, Star, Shield, Cpu } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

// Base arrays of icons (relevant to the app)
const BASE_ICONS_1 = [BookOpen, Users, Leaf, Music, Code, Camera, Globe, Palette, Mic, Compass];
const BASE_ICONS_2 = [MessageCircle, Heart, Star, Shield, Cpu, BookOpen, Users, Globe, Palette, Music];

// We can place any ReactNode here. For now, they are icons.
// Duplicating them many times reduces the spacing between each item on the large track.
const generateTrackNodes = (icons: React.ElementType[], count: number, size: number, className: string): ReactNode[] => {
  const result: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const Icon = icons[i % icons.length];
    result.push(<Icon size={size} className={className} />);
  }
  return result;
};

// 40 items on the 1800px track
const TRACK_1_NODES = generateTrackNodes(BASE_ICONS_1, 40, 48, "text-theme-forest");
// 30 items on the 1400px track
const TRACK_2_NODES = generateTrackNodes(BASE_ICONS_2, 30, 40, "text-theme-clay");

export const CTASection = ({ itemVariants, containerVariants }: { itemVariants: Variants, containerVariants: Variants }) => {
  return (
    <motion.section
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-40 px-6 text-center relative overflow-hidden"
    >
      {/* <DomeArchEffect /> */}

      <motion.div variants={itemVariants} className="max-w-3xl mx-auto relative z-20">
        <Compass size={48} className="mx-auto text-theme-clay mb-8 opacity-50" />
        <h2 className="font-serif text-5xl md:text-7xl text-theme-forest mb-8">Start building your community.</h2>
        <p className="font-sans text-xl text-theme-on-surface/70 mb-12 max-w-xl mx-auto">
          Create a dedicated space for your members, manage resources transparently, and archive your most valuable work.
        </p>
        <Button asChild size="xl" className="group mx-auto shadow-xl bg-theme-forest text-theme-parchment hover:bg-theme-clay transition-all duration-500 rounded-xl px-12 py-8">
          <Link href="/auth">
            <div className='flex items-center gap-3'>
              <span className='text-lg uppercase tracking-widest font-sans font-bold'>Join the Beta</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </div>
          </Link>
        </Button>
      </motion.div>
    </motion.section>
  );
};


export const DomeArchEffect = () => (

  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Fade masks for edges */}
    <div className="absolute inset-0 bg-gradient-to-r from-theme-parchment via-transparent to-theme-parchment z-10"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-theme-parchment via-transparent to-transparent z-10"></div>

    {/* Outer Rotating Track */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: "linear", duration: 180 }}
      className="absolute left-1/2 top-[90%] w-[1800px] h-[1800px] -ml-[900px] -mt-[900px] rounded-full opacity-10"
    >
      {TRACK_1_NODES.map((node, idx) => {
        const angle = (idx / TRACK_1_NODES.length) * 360;
        return (
          <div
            key={`t1-${idx}`}
            className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center"
            style={{ transform: `rotate(${angle}deg) translateY(-900px)` }}
          >
            {node}
          </div>
        );
      })}
    </motion.div>

    {/* Inner Rotating Track */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ repeat: Infinity, ease: "linear", duration: 120 }}
      className="absolute left-1/2 top-[90%] w-[1400px] h-[1400px] -ml-[700px] -mt-[700px] rounded-full opacity-20"
    >
      {TRACK_2_NODES.map((node, idx) => {
        const angle = (idx / TRACK_2_NODES.length) * 360;
        return (
          <div
            key={`t2-${idx}`}
            className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center"
            style={{ transform: `rotate(${angle}deg) translateY(-700px)` }}
          >
            {node}
          </div>
        );
      })}
    </motion.div>
  </div>
)