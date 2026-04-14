'use client';
import React, { useState, useEffect } from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CoHostRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  status: string;
}

export default function CoHostNotification({ sessionId }: { sessionId: string }) {
  const [requests, setRequests] = useState<CoHostRequest[]>([]);

  useEffect(() => {
    // Load existing pending requests
    const loadRequests = async () => {
      const { data } = await supabase
        .from('cohost_requests')
        .select('*, profiles(username, display_name)')
        .eq('session_id', sessionId)
        .eq('status', 'pending');
      
      if (data) {
        setRequests(data.map(r => ({
          id: r.id,
          requester_id: r.requester_id,
          requester_name: r.profiles?.display_name || r.profiles?.username || 'A Fan',
          status: r.status,
        })));
      }
    };
    loadRequests();

    // Real-time: new requests
    const channel = supabase.channel(`cohost-requests-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'cohost_requests',
        filter: `session_id=eq.${sessionId}`
      }, async (payload) => {
        const req = payload.new;
        // Fetch name
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', req.requester_id)
          .single();

        setRequests(prev => [...prev, {
          id: req.id,
          requester_id: req.requester_id,
          requester_name: profile?.display_name || profile?.username || 'A Fan',
          status: 'pending',
        }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleAccept = async (req: CoHostRequest) => {
    await supabase
      .from('cohost_requests')
      .update({ status: 'accepted' })
      .eq('id', req.id);

    // Broadcast to the specific fan's channel that they've been accepted
    await supabase.channel(`cohost-decision-${req.requester_id}-${sessionId}`).send({
      type: 'broadcast',
      event: 'cohost_decision',
      payload: { decision: 'accepted', sessionId }
    });

    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleReject = async (req: CoHostRequest) => {
    await supabase
      .from('cohost_requests')
      .update({ status: 'rejected' })
      .eq('id', req.id);

    await supabase.channel(`cohost-decision-${req.requester_id}-${sessionId}`).send({
      type: 'broadcast',
      event: 'cohost_decision',
      payload: { decision: 'rejected', sessionId }
    });

    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  if (requests.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[150] flex flex-col gap-3 max-w-xs w-full">
      {requests.map(req => (
        <div
          key={req.id}
          className="glass-pane border border-fanx-primary/30 rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-in slide-in-from-right"
        >
          <div className="w-10 h-10 rounded-full bg-fanx-primary/20 border border-fanx-primary/40 flex items-center justify-center flex-shrink-0">
            <UserPlus size={16} className="text-fanx-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{req.requester_name}</p>
            <p className="text-[10px] text-gray-400">wants to Co-Host</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(req)}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-all"
            >
              <Check size={14} className="text-white" />
            </button>
            <button
              onClick={() => handleReject(req)}
              className="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center hover:scale-110 transition-all text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
