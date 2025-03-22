// src/app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else {
                // 管理者かどうかを確認
                // 注: 実際のアプリでは、ユーザーオブジェクトに管理者フラグを含める必要があります
                setIsAdmin(user?.is_admin || false);

                if (!user?.is_admin) {
                    router.push('/dashboard');
                }
            }
        }
    }, [isAuthenticated, loading, router, user]);

    if (loading || !isAdmin) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* サイドバー */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4">
                    <h2 className="text-xl font-bold">SHOGUN TRADE</h2>
                    <p className="text-sm text-gray-400">管理者ダッシュボード</p>
                </div>
                <nav className="mt-4">
                    <ul>
                        <li>
                            <Link
                                href="/admin"
                                className="block py-2 px-4 hover:bg-gray-700"
                            >
                                ダッシュボード
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/users"
                                className="block py-2 px-4 hover:bg-gray-700"
                            >
                                ユーザー管理
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/nfts"
                                className="block py-2 px-4 hover:bg-gray-700"
                            >
                                NFT管理
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/rewards"
                                className="block py-2 px-4 hover:bg-gray-700"
                            >
                                報酬申請管理
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/settings"
                                className="block py-2 px-4 hover:bg-gray-700"
                            >
                                システム設定
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/import"
                                className="block py-2 px-4 hover:bg-gray-700"
                            >
                                データインポート
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* メインコンテンツ */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
                            <div>
                                <Link
                                    href="/dashboard"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    ユーザーダッシュボードへ
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
