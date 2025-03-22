// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        referrer_id: '',
        usdt_address: '',
        wallet_type: 'other'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // パスワード確認
        if (formData.password !== formData.confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        // パスワード長さチェック
        if (formData.password.length < 8) {
            setError('パスワードは8文字以上である必要があります');
            return;
        }

        // ユーザーID長さチェック
        if (formData.username.length < 6) {
            setError('ユーザーIDは6文字以上である必要があります');
            return;
        }

        setLoading(true);

        try {
            // confirmPasswordを除外したデータを送信
            const { confirmPassword, ...registerData } = formData;
            await api.register(registerData);
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || '登録に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        新規アカウント登録
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        SHOGUN TRADEへようこそ
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            お名前（カタカナ）<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="ヤマダ タロウ"
                        />
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            ユーザーID（半角英数字6文字以上）<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="username123"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            メールアドレス<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            パスワード（8文字以上）<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            パスワード（確認）<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            電話番号（ハイフンなし）<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="09012345678"
                        />
                    </div>

                    <div>
                        <label htmlFor="referrer_id" className="block text-sm font-medium text-gray-700">
                            紹介者ID<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="referrer_id"
                            name="referrer_id"
                            type="text"
                            required
                            value={formData.referrer_id}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="usdt_address" className="block text-sm font-medium text-gray-700">
                            USDTアドレス（BEP20）
                        </label>
                        <input
                            id="usdt_address"
                            name="usdt_address"
                            type="text"
                            value={formData.usdt_address}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="wallet_type" className="block text-sm font-medium text-gray-700">
                            ウォレットタイプ
                        </label>
                        <select
                            id="wallet_type"
                            name="wallet_type"
                            value={formData.wallet_type}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="evo">EVOカード</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? '登録中...' : 'アカウント登録'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        すでにアカウントをお持ちの方は
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            こちらからログイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
