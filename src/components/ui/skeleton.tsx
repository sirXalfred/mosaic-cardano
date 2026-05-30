import { cn } from "@/lib/utils";

export function Skeleton({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <span
            className={cn("animate-pulse bg-black/5 dark:bg-white/5 rounded-lg inline-block", className)}
            {...props}
        />
    )
}


        