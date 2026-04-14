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

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminUsersGrid() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'All Roles' || 
      user.role === roleFilter.toLowerCase().replace('s', ''); // Stars -> star

    return matchesSearch && matchesRole;
  });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  return (
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username..." 
              className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-fanx-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-3 glass-pane border border-foreground/10 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <Filter size={16} /> Filter
            </button>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-6 py-3 bg-foreground/5 border border-foreground/10 rounded-xl font-bold text-xs uppercase tracking-widest outline-none"
            >
              <option>All Roles</option>
              <option>Stars</option>
              <option>Admins</option>
              <option>Fans</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-pane border border-foreground/10 rounded-2xl overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-gray-500 font-black animate-pulse">LOADING USERS...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground/5 text-xs font-black uppercase tracking-widest text-gray-500 border-bottom border-foreground/10">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Earnings</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No users found matching your search.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-foreground/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fanx-primary to-fanx-secondary flex items-center justify-center font-bold text-white shadow-lg">
                            {user.display_name?.[0] || user.username?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold">{user.display_name || user.username}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role || 'fan'}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter outline-none cursor-pointer ${
                            user.role === 'star' ? 'bg-fanx-secondary/20 text-fanx-secondary' : 
                            user.role === 'admin' ? 'bg-fanx-primary/20 text-fanx-primary' : 'bg-foreground/10 text-gray-500'
                          }`}
                        >
                          <option value="fan" className="bg-background text-foreground">FAN</option>
                          <option value="star" className="bg-background text-foreground">STAR</option>
                          <option value="admin" className="bg-background text-foreground">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 capitalize text-sm font-medium">
                          <div className={`w-2 h-2 rounded-full bg-green-500`} />
                          Active
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-400">
                        ₦{user.earnings?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-foreground/10 rounded-lg transition-all text-gray-500">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center text-xs text-gray-500 font-medium">
          <div>Showing {filteredUsers.length} of {users.length} users</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-foreground/10 rounded-lg opacity-50 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all">Next</button>
          </div>
        </div>
      </main>
  );
}
