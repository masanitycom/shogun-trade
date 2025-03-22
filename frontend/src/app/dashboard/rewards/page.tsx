// src/app/dashboard/rewards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type Reward = {
    id: number;
    date: string;
    amount: number;
    daily_rate: number;
    status: string;
    nft_name: string;
};

type RewardRequest = {
    id: number;
    week_start: string;
    week_end: string;
    total_amount: number;
    option: string;
    survey_completed: boolean;
    status: string;
    created_at: string;
};

type WeeklyReward = {
    week: string;
    start: string;
    end: string;
    total: number;
    rewards: Reward[];
};

export default function RewardsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [requests, setRequests] = useState<RewardRequest[]>([]);
    const [weeklyRewards, setWeeklyRewards] = useState<WeeklyReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<'airdrop' | 'compound'>('airdrop');
    const [selectedWeek, setSelectedWeek] = useState<string>('');
    const [surveyAnswers, setSurveyAnswers] = useState({
        satisfaction: '',
        feedback: '',
        improvement: ''
    });
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [error, setError] = useState('');

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
                    const [rewardsResponse, requestsResponse] = await Promise.all([
                        api.getRewards(),
                        api.getRewardRequests()
                    ]);

                    setRewards(rewardsResponse);
                    setRequests(requestsResponse);

                    // 週ごとに報酬をグループ化
                    const groupedRewards = groupRewardsByWeek(rewardsResponse);
                    setWeeklyRewards(groupedRewards);
                } catch (error) {
                    console.error('データ取得エラー:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [isAuthenticated, authLoading, router]);

    // 週ごとに報酬をグループ化する関数
    const groupRewardsByWeek = (rewards: Reward[]): WeeklyReward[] => {
        const weekMap = new Map<string, Reward[]>();

        rewards.forEach(reward => {
            const date = new Date(reward.date);
            // 月曜日を週の開始日とする
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date.setDate(diff));
            monday.setHours(0, 0, 0, 0);

            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);
            friday.setHours(23, 59, 59, 999);

            const weekKey = `${monday.toISOString().split('T')[0]}_${friday.toISOString().split('T')[0]}`;

            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, []);
            }

            weekMap.get(weekKey)?.push(reward);
        });

        // 週ごとの合計を計算
        const result: WeeklyReward[] = [];

        weekMap.forEach((weekRewards, week) => {
            const [start, end] = week.split('_');
            const total = weekRewards.reduce((sum, reward) => sum + reward.amount, 0);

            result.push({
                week,
                start,
                end,
                total,
                rewards: weekRewards
            });
        });

        // 日付の降順でソート
        return result.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    };

    // 報酬申請処理
    const handleRequestReward = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setRequestSuccess(false);

        if (!selectedWeek) {
            setError('週を選択してください');
            return;
        }

        try {
            await api.requestReward({
                option: selectedOption,
                week: selectedWeek
            });

            setRequestSuccess(true);

            // データを再取得
            const [rewardsResponse, requestsResponse] = await Promise.all([
                api.getRewards(),
                api.getRewardRequests()
            ]);

            setRewards(rewardsResponse);
            setRequests(requestsResponse);

            // 週ごとに報酬をグループ化
            const groupedRewards = groupRewardsByWeek(rewardsResponse);
            setWeeklyRewards(groupedRewards);

            // フォームをリセット
            setSelectedWeek('');
        } catch (err: any) {
            setError(err.message || '報酬申請に失敗しました');
        }
    };

    // アンケート送信処理
    const handleSubmitSurvey = async (requestId: number) => {
        try {
            await api.submitSurvey(requestId, surveyAnswers);

            // データを再取得
            const requestsResponse = await api.getRewardRequests();
            setRequests(requestsResponse);

            // フォームをリセット
            setSurveyAnswers({
                satisfaction: '',
                feedback: '',
                improvement: ''
            });
        } catch (err: any) {
            setError(err.message || 'アンケート送信に失敗しました');
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
                <h1 className="text-3xl font-bold mb-8">報酬管理</h1>

                {/* 報酬申請フォーム */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">エアドロタスク（報酬申請）</h2>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {requestSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                            <p className="text-green-700">報酬申請が完了しました</p>
                        </div>
                    )}

                    <form onSubmit={handleRequestReward} className="space-y-4">
                        <div>
                            <label htmlFor="week" className="block text-sm font-medium text-gray-700">
                                週を選択
                            </label>
                            <select
                                id="week"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">選択してください</option>
                                {weeklyRewards.map((week) => (
                                    <option key={week.week} value={week.week}>
                                        {new Date(week.start).toLocaleDateString('ja-JP')} 〜 {new Date(week.end).toLocaleDateString('ja-JP')} ({week.total.toFixed(2)} USDT)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                報酬オプション
                            </label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input
                                        id="airdrop"
                                        name="option"
                                        type="radio"
                                        checked={selectedOption === 'airdrop'}
                                        onChange={() => setSelectedOption('airdrop')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="airdrop" className="ml-3 block text-sm font-medium text-gray-700">
                                        報酬受取（エアドロップ）- アンケート回答必須、手数料8%
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="compound"
                                        name="option"
                                        type="radio"
                                        checked={selectedOption === 'compound'}
                                        onChange={() => setSelectedOption('compound')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="compound" className="ml-3 block text-sm font-medium text-gray-700">
                                        複利運用 - アンケートスキップ、報酬を投資額に加算
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                報酬申請
                            </button>
                        </div>
                    </form>
                </div>

                {/* 報酬申請履歴 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">報酬申請履歴</h2>

                    {requests.length === 0 ? (
                        <p className="text-gray-500">報酬申請履歴はありません</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申請日</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期間</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額 (USDT)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">オプション</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(request.created_at).toLocaleDateString('ja-JP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(request.week_start).toLocaleDateString('ja-JP')} 〜 {new Date(request.week_end).toLocaleDateString('ja-JP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {request.total_amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {request.option === 'airdrop' ? '報酬受取' : '複利運用'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {request.status === 'pending' ? '申請中' :
                                                    request.status === 'approved' ? '承認済' :
                                                        request.status === 'rejected' ? '拒否' : request.status}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {request.option === 'airdrop' && !request.survey_completed && (
                                                    <button
                                                        onClick={() => {
                                                            // アンケートモーダルを表示する処理
                                                            // 簡略化のため、直接アンケート送信
                                                            handleSubmitSurvey(request.id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        アンケート回答
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 報酬履歴 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">報酬履歴</h2>

                    {rewards.length === 0 ? (
                        <p className="text-gray-500">報酬履歴はありません</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NFT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額 (USDT)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日利 (%)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rewards.map((reward) => (
                                        <tr key={reward.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(reward.date).toLocaleDateString('ja-JP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {reward.nft_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {reward.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {reward.daily_rate}%
                                            </td>
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
            </div>
        </div>
    );
}
