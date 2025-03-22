// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Stats = {
    totalUsers: number;
    totalNFTs: number;
    totalInvestment: number;
    pendingRequests: number;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalNFTs: 0,
        totalInvestment: 0,
        pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 並行してデータを取得
                const [users, nfts, requests] = await Promise.all([
                    api.getAdminUsers(),
                    api.getAdminNFTs(),
                    api.getAdminRewardRequests()
                ]);

                // 統計情報を計算
                const totalUsers = users.length;
                const totalNFTs = nfts.filter(nft => !nft.is_special).length;
                const totalInvestment = users.reduce((sum, user) => sum + (user.total_investment || 0), 0);
                const pendingRequests = requests.filter(req => req.status === 'pending').length;

                setStats({
                    totalUsers,
                    totalNFTs,
                    totalInvestment,
                    pendingRequests
                });
            } catch (error) {
                console.error('データ取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl">読み込み中...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">システム概要</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-500">総ユーザー数</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-500">通常NFT種類</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalNFTs}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-500">総投資額</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalInvestment.toLocaleString()} USDT</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-500">保留中の報酬申請</h3>
                    <p className="text-3xl font-bold mt-2">{stats.pendingRequests}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">管理者機能</h2>
                <p className="mb-4">
                    SHOGUN TRADE管理者ダッシュボードへようこそ。左側のメニューから各管理機能にアクセスできます。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-bold mb-2">ユーザー管理</h3>
                        <p className="text-sm text-gray-600">ユーザー情報の閲覧、編集、特別NFTの付与を行います。</p>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-bold mb-2">NFT管理</h3>
                        <p className="text-sm text-gray-600">NFTの情報編集、日利設定、ステータス管理を行います。</p>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-bold mb-2">報酬申請管理</h3>
                        <p className="text-sm text-gray-600">ユーザーからの報酬申請の承認または拒否を行います。</p>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-bold mb-2">システム設定</h3>
                        <p className="text-sm text-gray-600">メンテナンスモードの切替や会社利益の設定を行います。</p>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-bold mb-2">データインポート</h3>
                        <p className="text-sm text-gray-600">CSVファイルからのユーザーインポートを行います。</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
