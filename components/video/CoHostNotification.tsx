'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Check, X, UserPlus, ChevronRight, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CoHostRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_avatar?: string;
  created_at: string;
}

const AUTO_COLLAPSE_MS = 2 * 60 * 1000; // 2 minutes

export default function CoHostNotification({ sessionId }: { sessionId: string }) {
  const [requests, setRequests] = useState<CoHostRequest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // collapsed to icon
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whenever there are new requests, slide open the panel
  const openPanel = () => {
    setIsCollapsed(false);
    setIsOpen(true);
    // Start the auto-collapse timer — if host ignores for 2 min, shrink to icon
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => {
      setIsCollapsed(true);
      setIsOpen(false);
    }, AUTO_COLLAPSE_MS);
  };

  useEffect(() => {
    const loadRequests = async () => {
      const { data, error } = await supabase
        .from('cohost_requests')
        .select('id, requester_id, created_at')
        .eq('session_id', sessionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) console.error('Co-host fetch error:', error);

      if (data && data.length > 0) {
        const userIds = data.map(d => d.requester_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds);
          
        const pMap = new Map(profiles?.map(p => [p.id, p]));

        const mapped = data.map((r: any) => {
          const p = pMap.get(r.requester_id);
          return {
            id: r.id,
            requester_id: r.requester_id,
            requester_name: p?.display_name || p?.username || 'Fan',
            requester_avatar: p?.avatar_url,
            created_at: r.created_at,
          };
        });
        setRequests(mapped);
        openPanel();
      }
    };
    loadRequests();

    // Real-time: new request coming in
    const channel = supabase.channel(`cohost-sidebar-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'cohost_requests',
        filter: `session_id=eq.${sessionId}`,
      }, async (payload) => {
        const req = payload.new as any;
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', req.requester_id)
          .single();

        const newReq: CoHostRequest = {
          id: req.id,
          requester_id: req.requester_id,
          requester_name: profile?.display_name || profile?.username || 'Fan',
          requester_avatar: profile?.avatar_url,
          created_at: req.created_at,
        };
        setRequests(prev => [...prev, newReq]);
        openPanel();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleAccept = async (req: CoHostRequest) => {
    await supabase.from('cohost_requests').update({ status: 'accepted' }).eq('id', req.id);
    // Broadcast the decision to the fan who requested
    await supabase.channel(`cohost-decision-${req.requester_id}-${sessionId}`).send({
      type: 'broadcast',
      event: 'cohost_decision',
      payload: { decision: 'accepted', sessionId },
    });
    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleReject = async (req: CoHostRequest) => {
    await supabase.from('cohost_requests').update({ status: 'rejected' }).eq('id', req.id);
    await supabase.channel(`cohost-decision-${req.requester_id}-${sessionId}`).send({
      type: 'broadcast',
      event: 'cohost_decision',
      payload: { decision: 'rejected', sessionId },
    });
    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  // Nothing pending at all — render nothing
  if (requests.length === 0) return null;

  // Collapsed to floating icon
  if (isCollapsed || !isOpen) {
    return (
      <button
        onClick={() => {
          setIsCollapsed(false);
          setIsOpen(true);
          // Reset timer
          if (collapseTimer.current) clearTimeout(collapseTimer.current);
          collapseTimer.current = setTimeout(() => {
            setIsCollapsed(true);
            setIsOpen(false);
          }, AUTO_COLLAPSE_MS);
        }}
        className="fixed right-4 top-24 z-[160] flex items-center gap-2 px-4 py-3 glass-pane border border-fanx-primary/50 rounded-full shadow-lg shadow-fanx-primary/20 hover:scale-105 transition-all group"
      >
        <div className="relative">
          <Users size={18} className="text-fanx-primary" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-fanx-primary rounded-full text-[10px] font-black flex items-center justify-center text-white">
            {requests.length}
          </div>
        </div>
        <span className="text-xs font-black text-white hidden group-hover:inline">CO-HOST REQUESTS</span>
        <ChevronRight size={14} className="text-gray-400" />
      </button>
    );
  }

  // Full sidebar panel
  return (
    <div className="fixed right-4 top-24 z-[160]">
      <div className="w-80 max-h-[70vh] flex flex-col rounded-2xl shadow-2xl shadow-black overflow-hidden border border-white/10" style={{ background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(20px)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0 bg-white/5">
          <div>
            <h3 className="font-black text-sm text-white tracking-wide">CO-HOST REQUESTS</h3>
            <p className="text-[10px] text-gray-400">{requests.length} pending request{requests.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { setIsCollapsed(true); setIsOpen(false); }}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white flex-shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Request list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {requests.map(req => (
            <div
              key={req.id}
              className="rounded-2xl p-4 space-y-3 bg-white/5 border border-white/5 hover:border-fanx-primary/40 transition-colors"
            >
              {/* Requester info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-fanx-primary/20 border border-fanx-primary/40 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {req.requester_avatar ? (
                    <img src={req.requester_avatar} alt={req.requester_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-sm text-fanx-primary">{req.requester_name[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm text-white truncate">{req.requester_name}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <UserPlus size={10} /> wants to co-host
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAccept(req)}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all"
                >
                  <Check size={14} /> ACCEPT
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="flex-1 py-2 text-red-400 hover:bg-red-500/20 font-black text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all bg-red-500/10 border border-red-500/30"
                >
                  <X size={14} /> DECLINE
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="p-3 bg-black/40 border-t border-white/5 flex-shrink-0">
          <p className="text-[10px] text-gray-500 text-center font-medium">Panel auto-collapses in 2m</p>
        </div>
      </div>
    </div>
  );
}
