import { CloseButton } from '../ui/close-button';
import { PricingSection } from '../landing/PricingSection';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  };

  return (
    <div className="fixed inset-0 bg-theme-forest/40 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-theme-parchment w-full h-full overflow-y-auto relative animate-in zoom-in-95 duration-300">
        <CloseButton className='z-50' onClick={onClose} />

        <PricingSection containerVariants={modalVariants} isModal={true} />
      </div>
    </div>
  );
}
