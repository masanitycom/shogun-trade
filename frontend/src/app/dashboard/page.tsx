// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type NFT = {
    id: number;
    name: string;
    price: number;
    daily_rate: number;
    image_url: string;
};

type UserNFT = {
    id: number;
    nft: NFT;
    purchase_date: string;
    operation_start_date: string | null;
    total_earned: number;
    status: string;
};

type Reward = {
    id: number;
    date: string;
    amount: number;
    daily_rate: number;
    status: string;
};

export default function Dashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
    const [availableNFTs, setAvailableNFTs] = useState<NFT[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 認証チェック
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            // データ取得
            const fetchData = async () => {
                try {
                    // 並行してデータを取得
                    const [nftsResponse, userNFTsResponse, rewardsResponse] = await Promise.all([
                        api.getNFTs(),
                        fetchAPI('/users/nfts'),
                        api.getRewards()
                    ]);

                    setAvailableNFTs(nftsResponse.filter((nft: NFT) => !nft.is_special));
                    setUserNFTs(userNFTsResponse);
                    setRewards(rewardsResponse);
                } catch (error) {
                    console.error('データ取得エラー:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [isAuthenticated, authLoading, router]);

    // NFT購入処理
    const handlePurchaseNFT = async (nftId: number) => {
        try {
            await api.purchaseNFT(nftId);
            // 購入後にユーザーNFTリストを更新
            const userNFTsResponse = await fetchAPI('/users/nfts');
            setUserNFTs(userNFTsResponse);
        } catch (error) {
            console.error('NFT購入エラー:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

                {/* ユーザー情報 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">ユーザー情報</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">ユーザーID:</p>
                            <p className="font-medium">{user?.username}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">お名前:</p>
                            <p className="font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">メールアドレス:</p>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* 所有NFT */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">所有NFT</h2>

                    {userNFTs.length === 0 ? (
                        <p className="text-gray-500">所有しているNFTはありません</p>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userNFTs.map((userNFT) => (
                                <div key={userNFT.id} className="border rounded-lg p-4">
                                    <div className="aspect-square bg-gray-200 rounded-md mb-3 overflow-hidden">
                                        {userNFT.nft.image_url && (
                                            <img
                                                src={userNFT.nft.image_url}
                                                alt={userNFT.nft.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <h3 className="font-bold">{userNFT.nft.name}</h3>
                                    <p className="text-sm text-gray-600">価格: {userNFT.nft.price} USDT</p>
                                    <p className="text-sm text-gray-600">日利上限: {userNFT.nft.daily_rate}%</p>
                                    <p className="text-sm text-gray-600">
                                        ステータス: {
                                            userNFT.status === 'waiting' ? '待機中' :
                                                userNFT.status === 'active' ? '運用中' :
                                                    userNFT.status === 'completed' ? '終了' : userNFT.status
                                        }
                                    </p>
                                    <p className="text-sm text-gray-600">購入日: {new Date(userNFT.purchase_date).toLocaleDateString('ja-JP')}</p>
                                    {userNFT.operation_start_date && (
                                        <p className="text-sm text-gray-600">運用開始日: {new Date(userNFT.operation_start_date).toLocaleDateString('ja-JP')}</p>
                                    )}
                                    <p className="mt-2 font-medium">累計獲得報酬: {userNFT.total_earned} USDT</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 報酬履歴 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">報酬履歴</h2>

                    {rewards.length === 0 ? (
                        <p className="text-gray-500">報酬履歴はありません</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額 (USDT)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日利 (%)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rewards.map((reward) => (
                                        <tr key={reward.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(reward.date).toLocaleDateString('ja-JP')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{reward.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{reward.daily_rate}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {reward.status === 'calculated' ? '計算済' :
                                                    reward.status === 'pending' ? '申請中' :
                                                        reward.status === 'paid' ? '支払済' : reward.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 購入可能NFT */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">購入可能NFT</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableNFTs.map((nft) => (
                            <div key={nft.id} className="border rounded-lg p-4">
                                <div className="aspect-square bg-gray-200 rounded-md mb-3 overflow-hidden">
                                    {nft.image_url && (
                                        <img
                                            src={nft.image_url}
                                            alt={nft.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <h3 className="font-bold">{nft.name}</h3>
                                <p className="text-gray-600">価格: {nft.price} USDT</p>
                                <p className="text-gray-600">日利上限: {nft.daily_rate}%</p>
                                <button
                                    onClick={() => handlePurchaseNFT(nft.id)}
                                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                >
                                    購入する
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// APIリクエスト用のヘルパー関数
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'APIリクエストエラー');
    }

    return response.json();
}
