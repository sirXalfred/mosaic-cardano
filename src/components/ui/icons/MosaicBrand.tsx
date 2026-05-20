import MosaicSymbol from "./MosaicSymbol"

const sizeVariants = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-18 h-18',
}

const textVariants = {
    small: 'text-lg',
    default: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
}

export default function MosaicBrand({ size = 'default' }: { size?: keyof typeof sizeVariants }) {
    return (
        <div className="flex items-center gap-2">
            <MosaicSymbol size={sizeVariants[size]} />
            <span className={`font-serif ${textVariants[size]} tracking-tighter`}>mosaic</span>
        </div>
    )
}
