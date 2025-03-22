// src/app/dashboard/mlm/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type MLMRank = {
    id: number;
    name: string;
    min_investment: number;
    max_line_requirement: number;
    other_lines_requirement: number;
    distribution_rate: number;
    bonus_rate: number;
};

type OrganizationMember = {
    id: number;
    username: string;
    name: string;
    total_investment: number;
    line_total: number;
};

type OrganizationStats = {
    max_line: number;
    other_lines_total: number;
    direct_referrals: number;
};

export default function MLMPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ranks, setRanks] = useState<MLMRank[]>([]);
    const [currentRank, setCurrentRank] = useState<MLMRank | null>(null);
    const [organization, setOrganization] = useState<OrganizationMember[]>([]);
    const [stats, setStats] = useState<OrganizationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [nextRank, setNextRank] = useState<MLMRank | null>(null);

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
                    const [ranksResponse, myRankResponse, organizationResponse] = await Promise.all([
                        api.getMlmRanks(),
                        api.getMyRank(),
                        api.getOrganization()
                    ]);

                    setRanks(ranksResponse);

                    if (myRankResponse.id) {
                        setCurrentRank(myRankResponse);

                        // 次のランクを計算
                        const currentRankIndex = ranksResponse.findIndex(rank => rank.id === myRankResponse.id);
                        if (currentRankIndex >= 0 && currentRankIndex < ranksResponse.length - 1) {
                            setNextRank(ranksResponse[currentRankIndex + 1]);
                        }
                    } else {
                        // ランクがない場合は最初のランクを次のランクとして設定
                        if (ranksResponse.length > 0) {
                            setNextRank(ranksResponse[0]);
                        }
                    }

                    setOrganization(organizationResponse.organization);
                    setStats(organizationResponse.stats);
                } catch (error) {
                    console.error('データ取得エラー:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [isAuthenticated, authLoading, router]);

    // 次のランクまでの達成率を計算
    const calculateProgress = () => {
        if (!nextRank || !stats) return { maxLineProgress: 0, otherLinesProgress: 0 };

        const maxLineProgress = Math.min(100, (stats.max_line / nextRank.max_line_requirement) * 100);
        const otherLinesProgress = Math.min(100, (stats.other_lines_total / nextRank.other_lines_requirement) * 100);

        return { maxLineProgress, otherLinesProgress };
    };

    const { maxLineProgress, otherLinesProgress } = calculateProgress();

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
                <h1 className="text-3xl font-bold mb-8">天下統一への道</h1>

                {/* 現在のランク */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">現在のランク</h2>

                    {currentRank ? (
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-4 rounded-lg mr-4">
                                <span className="text-2xl font-bold text-blue-800">{currentRank.name}</span>
                            </div>
                            <div>
                                <p className="text-gray-600">分配率: {currentRank.distribution_rate}%</p>
                                {currentRank.bonus_rate > 0 && (
                                    <p className="text-gray-600">ボーナス率: {currentRank.bonus_rate}%</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">ランクはまだ設定されていません</p>
                    )}
                </div>

                {/* 次のランク */}
                {nextRank && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">次のランク: {nextRank.name}</h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>最大系列: {stats?.max_line || 0} / {nextRank.max_line_requirement} USDT</span>
                                    <span>{maxLineProgress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${maxLineProgress}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>他系列全体: {stats?.other_lines_total || 0} / {nextRank.other_lines_requirement} USDT</span>
                                    <span>{otherLinesProgress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${otherLinesProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 組織構造 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">あなたの組織</h2>

                    {organization.length === 0 ? (
                        <p className="text-gray-500">まだ紹介者がいません</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー名</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">個人投資額 (USDT)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">系列総額 (USDT)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {organization.map((member) => (
                                        <tr key={member.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{member.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{member.total_investment || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{member.line_total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ランク一覧 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">ランク一覧</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ランク</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">必要投資額</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最大系列要件</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">他系列要件</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分配率</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ボーナス率</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ranks.map((rank) => (
                                    <tr key={rank.id} className={currentRank?.id === rank.id ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {rank.name}
                                            {currentRank?.id === rank.id && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    現在
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{rank.min_investment} USDT</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{rank.max_line_requirement} USDT</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{rank.other_lines_requirement} USDT</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{rank.distribution_rate}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{rank.bonus_rate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
