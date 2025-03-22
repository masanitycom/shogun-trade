// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
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

export const api = {
    // 認証関連
    login: (data: { username: string; password: string }) =>
        fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    register: (data: any) =>
        fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    // ユーザー関連
    getUserProfile: () =>
        fetchAPI('/users/profile'),

    // NFT関連
    getNFTs: () =>
        fetchAPI('/nfts'),

    purchaseNFT: (nftId: number) =>
        fetchAPI(`/nfts/${nftId}/purchase`, { method: 'POST' }),

    // 報酬関連の関数を追加
    getRewards: () =>
        fetchAPI('/rewards'),

    getRewardRequests: () =>
        fetchAPI('/rewards/requests'),

    requestReward: (data: { option: string; week: string }) =>
        fetchAPI('/rewards/request', { method: 'POST', body: JSON.stringify(data) }),

    submitSurvey: (requestId: number, answers: any) =>
        fetchAPI(`/rewards/survey/${requestId}`, { method: 'POST', body: JSON.stringify({ answers }) }),

    // MLM関連の関数を追加
    getMlmRanks: () =>
        fetchAPI('/mlm/ranks'),

    getMyRank: () =>
        fetchAPI('/mlm/my-rank'),

    getOrganization: () =>
        fetchAPI('/mlm/organization'),
    // 管理者関連の関数を追加
    getAdminUsers: () =>
        fetchAPI('/admin/users'),

    getAdminUserDetail: (userId: number) =>
        fetchAPI(`/admin/users/${userId}`),

    assignSpecialNFT: (data: { userId: number; nftId: number }) =>
        fetchAPI('/admin/assign-special-nft', { method: 'POST', body: JSON.stringify(data) }),

    getAdminNFTs: () =>
        fetchAPI('/admin/nfts'),

    updateNFT: (nftId: number, data: any) =>
        fetchAPI(`/admin/nfts/${nftId}`, { method: 'PUT', body: JSON.stringify(data) }),

    getAdminRewardRequests: () =>
        fetchAPI('/admin/reward-requests'),

    updateRewardRequest: (requestId: number, data: { status: string }) =>
        fetchAPI(`/admin/reward-requests/${requestId}`, { method: 'PUT', body: JSON.stringify(data) }),

    getSystemSettings: () =>
        fetchAPI('/admin/settings'),

    updateSystemSettings: (data: any) =>
        fetchAPI('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

    importUsers: (data: { users: any[] }) =>
        fetchAPI('/admin/import-users', { method: 'POST', body: JSON.stringify(data) }),

};
