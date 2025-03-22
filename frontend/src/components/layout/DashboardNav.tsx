// src/components/layout/DashboardNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="bg-white shadow-md mb-8">
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto">
                    <Link
                        href="/dashboard"
                        className={`py-4 px-6 font-medium text-sm ${isActive('/dashboard')
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ダッシュボード
                    </Link>
                    <Link
                        href="/dashboard/rewards"
                        className={`py-4 px-6 font-medium text-sm ${isActive('/dashboard/rewards')
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        報酬管理
                    </Link>
                    <Link
                        href="/dashboard/mlm"
                        className={`py-4 px-6 font-medium text-sm ${isActive('/dashboard/mlm')
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        天下統一への道
                    </Link>
                </div>
            </div>
        </nav>
    );
}
