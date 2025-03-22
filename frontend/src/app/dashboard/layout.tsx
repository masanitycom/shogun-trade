// src/app/dashboard/layout.tsx
import DashboardNav from '@/components/layout/DashboardNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <DashboardNav />
            {children}
        </div>
    );
}
