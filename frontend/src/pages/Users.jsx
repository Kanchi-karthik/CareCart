import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, Mail } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/users/profile'); // Using existing profile as mock endpoint if list doesn't exist
            setUsers([
                { user_id: 1, username: 'admin', role: 'ADMIN', status: 'ACTIVE', created_at: '2024-01-01' },
                { user_id: 2, username: 'apollo', role: 'RETAILER', status: 'ACTIVE', created_at: '2024-01-15' },
                { user_id: 3, username: 'maxhosp', role: 'CLIENT', status: 'ACTIVE', created_at: '2024-02-01' },
                { user_id: 4, username: 'amit', role: 'CUSTOMER', status: 'ACTIVE', created_at: '2024-02-10' },
                { user_id: 5, username: 'drsmith', role: 'CONSULTANT', status: 'ACTIVE', created_at: '2024-02-12' }
            ]);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="dashboard-header">
                <div>
                    <h1>User Management</h1>
                    <p className="dashboard-subtitle">Manage all platform users and permissions</p>
                </div>
                <div className="header-time">
                    <Users size={20} />
                    <span>System Admin</span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow mt-6">
                <div className="p-6 border-b flex justify-between items-center">
                    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                        <Search size={18} className="text-gray-500" />
                        <input type="text" placeholder="Search users..." className="bg-transparent border-none outline-none ml-2 text-sm" />
                    </div>
                    <button className="btn btn-primary flex items-center gap-2">
                        <UserPlus size={18} />
                        Add User
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 font-semibold text-gray-700">User ID</th>
                                <th className="p-4 font-semibold text-gray-700">Username</th>
                                <th className="p-4 font-semibold text-gray-700">Role</th>
                                <th className="p-4 font-semibold text-gray-700">Status</th>
                                <th className="p-4 font-semibold text-gray-700">Joined Date</th>
                                <th className="p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.user_id} className="border-t hover:bg-gray-50 transition">
                                        <td className="p-4">#{u.user_id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Users size={14} className="text-gray-600" />
                                                </div>
                                                <span className="font-medium text-gray-800">{u.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-1 text-sm text-gray-600">
                                                <Shield size={14} className="text-red-600" />
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`status ${u.status.toLowerCase()}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="flex gap-3">
                                                <button className="text-red-700 hover:text-red-900"><Edit2 size={18} /></button>
                                                <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
