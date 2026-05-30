
import AppLayout from "@/components/layout/AppLayout";
import { OnboardedGuard } from "@/contexts/onboard-guard";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
    return <>
        <OnboardedGuard>
            <AppLayout>{children}</AppLayout>
        </OnboardedGuard>
    </>
}