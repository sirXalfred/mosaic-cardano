import { cn } from "@/lib/utils";


export default function AppPageContainer({ children, title, description, className, ...props }: { children: React.ReactNode, title?: string | React.ReactNode, description?: string | React.ReactNode, className?: string }) {
    return (
        <div className={cn("w-full max-w-7xl mx-auto flex flex-col px-4 md:px-8 py-4 md:py-8 gap-y-4 md:gap-y-8", className)} {...props}>
            <div className="space-y-3">
                <h1 className="font-sans uppercase tracking-widest text-theme-accent font-bold block">
                    {title}
                </h1>
                {description && (
                    <p className="text-theme-on-surface/60 font-sans leading-relaxed">{description}</p>
                )}
            </div>
            {children}
        </div>
    )
}