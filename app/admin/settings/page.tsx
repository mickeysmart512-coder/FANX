'use client';
import React, { useState, useEffect } from 'react';
import { PackageOpen, Plus, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, coinsToUsd } from '@/lib/currency';

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  color: string;
}

export default function AdminSettingsPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');
  const [newColor, setNewColor] = useState('#FFFFFF');

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('catalog_items')
      .select('*')
      .order('price', { ascending: true });
    
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Missing required fields");

    const priceNum = parseInt(newPrice);
    
    const { error } = await supabase.from('catalog_items').insert({
      name: newName,
      price: priceNum,
      icon: newIcon,
      color: newColor
    });

    if (error) {
      alert("Error creating item: " + error.message);
    } else {
      setNewName('');
      setNewPrice('');
      setNewIcon('🎁');
      fetchItems();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the ${name} gift?`)) return;
    
    await supabase.from('catalog_items').delete().eq('id', id);
    fetchItems();
  };

  return (
    <main className="p-8 pb-32">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic tracking-tight">GLOBAL CATALOG SETTINGS</h1>
        <p className="text-gray-500 font-medium">Manage virtual gifts and global platform economy values.</p>
      </header>
      
      <div className="grid lg:grid-cols-[1fr_350px] gap-8 align-top items-start">
        {/* Current Catalog Viewer */}
        <div className="glass-pane border border-foreground/10 rounded-3xl overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
              <PackageOpen className="text-fanx-primary" /> Active Merchandise
            </h3>
            <button onClick={fetchItems} className="p-2 hover:bg-foreground/10 rounded-full transition-all text-gray-500">
               <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <table className="w-full text-left">
            <thead className="text-[10px] text-gray-500 uppercase font-black border-b border-foreground/10">
              <tr>
                <th className="pb-4">Preview</th>
                <th className="pb-4">Item Name</th>
                <th className="pb-4">Coin Cost</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-mono text-sm">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500 animate-pulse">Loading catalog...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <p className="text-gray-500 italic">No gifts created yet. Use the configurator to add some!</p>
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item.id} className="group hover:bg-foreground/5 transition-all">
                  <td className="py-2">
                    <div 
                      className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-xl border border-transparent"
                      style={{ 
                        textShadow: `0 0 10px ${item.color}`, 
                        boxShadow: `inset 0 0 15px ${item.color}30` 
                      }}
                    >
                      {item.icon}
                    </div>
                  </td>
                  <td className="py-2 font-bold font-sans">{item.name}</td>
                  <td className="py-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-fanx-secondary">{item.price.toLocaleString()} 🪙</span>
                      <span className="text-[10px] text-gray-500 uppercase">≈ {formatCurrency(coinsToUsd(item.price), 'USD')}</span>
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <button 
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create New Item Form */}
        <div className="glass-pane border border-foreground/10 rounded-3xl p-6 sticky top-8">
          <h3 className="text-xl font-black uppercase italic mb-6">Create New Gift</h3>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-gray-500">Emoji Icon (1 char)</label>
              <input 
                type="text" 
                maxLength={2}
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                required
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-fanx-primary text-2xl text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-gray-500">Gift Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="e.g. Supercar"
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-fanx-primary text-sm font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-gray-500">Price in Coins</label>
              <input 
                type="number" 
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
                min={1}
                placeholder="5000"
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-fanx-secondary text-sm font-mono"
              />
              {newPrice && (
                <p className="text-[10px] text-gray-500 text-right mt-1">
                  ≈ {formatCurrency(coinsToUsd(parseInt(newPrice) || 0), 'USD')}
                </p>
              )}
            </div>

            <div className="space-y-1 pb-4">
              <label className="text-[10px] uppercase font-black text-gray-500">Glow Color</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="font-mono text-xs">{newColor}</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-fanx-primary text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 hover:scale-[1.02] transition-all"
            >
               <Plus size={16} /> Enlist to Store
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
