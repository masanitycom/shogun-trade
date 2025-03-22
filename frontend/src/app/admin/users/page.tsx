// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type User = {
    id: number;
    username: string;
    email: string;
    name: string;
    phone: string;
    referrer_id: number | null;
    usdt_address: string | null;
    wallet_type: string;
    created_at: string;
    referrals_count: number;
    total_investment: number;
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof User>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.getAdminUsers();
                setUsers(data);
            } catch (error) {
                console.error('ユーザー取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // ソート関数
    const handleSort = (field: keyof User) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // フィルタリングとソートを適用したユーザーリスト
    const filteredAndSortedUsers = users
        .filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === null) return sortDirection === 'asc' ? -1 : 1;
            if (bValue === null) return sortDirection === 'asc' ? 1 : -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortDirection === 'asc'
                ? (aValue as number) - (bValue as number)
                : (bValue as number) - (aValue as number);
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl">読み込み中...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">ユーザー管理</h2>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="ユーザー名、メール、名前で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('id')}
                                >
                                    ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('username')}
                                >
                                    ユーザー名 {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('name')}
                                >
                                    名前 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('email')}
                                >
                                    メール {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('referrals_count')}
                                >
                                    紹介数 {sortField === 'referrals_count' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('total_investment')}
                                >
                                    投資額 {sortField === 'total_investment' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('created_at')}
                                >
                                    登録日 {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    アクション
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.referrals_count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.total_investment ? `${user.total_investment.toLocaleString()} USDT` : '0 USDT'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            詳細
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-right">
                <p className="text-gray-600">
                    全{users.length}件中 {filteredAndSortedUsers.length}件表示
                </p>
            </div>
        </div>
    );
}
