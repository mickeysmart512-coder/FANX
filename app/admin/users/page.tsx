'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  ArrowLeft,
  Activity
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const MOCK_USERS = [
  { id: 1, name: 'Tems Star', email: 'tems@fanx.com', role: 'star', status: 'active', followers: '1.2M' },
  { id: 2, name: 'Michael O.', email: 'onojamichael@gmail.com', role: 'admin', status: 'active', followers: '-' },
  { id: 3, name: 'Fan Number One', email: 'fan1@gmail.com', role: 'user', status: 'active', followers: '-' },
  { id: 4, name: 'Wizkid Official', email: 'wiz@star.com', role: 'star', status: 'pending', followers: '8.5M' },
  { id: 5, name: 'Comedy King', email: 'funny@gmail.com', role: 'star', status: 'banned', followers: '200k' },
];

export default function AdminUsersGrid() {
  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-foreground/10 p-6 flex flex-col gap-8 hidden md:flex h-screen sticky top-0">
        <div className="text-2xl font-black italic tracking-tighter">
          FAN<span className="text-fanx-primary">X</span> ADMIN
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-foreground/5 hover:text-foreground rounded-xl font-medium transition-all">
            <Activity size={20} /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-foreground/5 text-foreground rounded-xl font-medium transition-all">
            <Users size={20} /> Users
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
               <Link href="/admin" className="hover:text-foreground flex items-center gap-1 transition-all text-xs font-bold uppercase tracking-widest">
                <ArrowLeft size={14} /> Back to Command Center
               </Link>
            </div>
            <h1 className="text-4xl font-black tracking-tight">USER MANAGEMENT</h1>
            <p className="text-gray-500 font-medium">Monitor and manage all platform participants.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button className="px-6 py-3 bg-fanx-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all glow-primary">
              <UserPlus size={20} /> Invite Host
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-fanx-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-3 glass-pane border border-foreground/10 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <Filter size={16} /> Filter
            </button>
            <select className="px-6 py-3 bg-foreground/5 border border-foreground/10 rounded-xl font-bold text-xs uppercase tracking-widest outline-none">
              <option>All Roles</option>
              <option>Stars</option>
              <option>Admins</option>
              <option>Fans</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-pane border border-foreground/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-xs font-black uppercase tracking-widest text-gray-500 border-bottom border-foreground/10">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reach</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-foreground/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fanx-primary to-fanx-secondary flex items-center justify-center font-bold text-white shadow-lg">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'star' ? 'bg-fanx-secondary/20 text-fanx-secondary' : 
                      user.role === 'admin' ? 'bg-fanx-primary/20 text-fanx-primary' : 'bg-foreground/10 text-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 capitalize text-sm font-medium">
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'active' ? 'bg-green-500' : 
                        user.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">
                    {user.followers}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-foreground/10 rounded-lg transition-all text-gray-500">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-between items-center text-xs text-gray-500 font-medium">
          <div>Showing 5 of 1,242 users</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-foreground/10 rounded-lg opacity-50 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all">Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}
