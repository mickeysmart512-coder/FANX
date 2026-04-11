'use client';

import React from 'react';
import { Participant, RemoteTrackPublication } from 'livekit-client';
import { VideoTrack } from '@livekit/components-react';

interface VideoTileProps {
  participant: Participant;
  track: RemoteTrackPublication;
}

export default function VideoTile({ participant, track }: VideoTileProps) {
  return (
    <div className="relative aspect-[9/16] rounded-xl overflow-hidden glass-pane border border-white/5 hover:border-fanx-secondary/50 transition-all group">
      {/* Video Stream */}
      <div className="w-full h-full bg-gray-900">
        {track.kind === 'video' && track.isSubscribed && (
          <VideoTrack
            trackRef={{ 
              participant, 
              publication: track, 
              source: track.source 
            }}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Identity Overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-fanx-primary flex items-center justify-center text-[10px] font-bold border border-white/20">
          {participant.identity.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
          {participant.identity}
        </span>
      </div>

      {/* Live Badge */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded text-[9px] font-black italic">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Activity Status */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[9px] text-gray-400">
           SFU: {track.dimensions?.width}x{track.dimensions?.height}
        </div>
        <button className="text-[10px] bg-fanx-secondary text-black px-3 py-1 rounded-full font-bold">
          ZOOM IN
        </button>
      </div>
    </div>
  );
}
