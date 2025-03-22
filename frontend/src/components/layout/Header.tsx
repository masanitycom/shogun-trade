// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <header className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    SHOGUN TRADE
                </Link>

                <nav>
                    <ul className="flex space-x-4">
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link href="/dashboard" className="hover:text-gray-300">
                                        ダッシュボード
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="hover:text-gray-300"
                                    >
                                        ログアウト
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link href="/login" className="hover:text-gray-300">
                                        ログイン
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/register" className="hover:text-gray-300">
                                        新規登録
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
