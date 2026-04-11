'use client';

import React from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import VideoTile from './VideoTile';

/**
 * Responsive Video Grid for up to 50 participants.
 * Automatically switches between compact and focused views.
 */
export default function VideoGrid() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  return (
    <div className="w-full h-full bg-black p-2 overflow-y-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <VideoTile 
              key={track.publication.trackSid} 
              participant={track.participant} 
              track={track.publication} 
            />
          ))
        ) : (
          <div className="col-span-full h-96 flex items-center justify-center text-gray-500 font-bold animate-pulse">
            WAITING FOR CELEBRITIES TO GO LIVE...
          </div>
        )}
      </div>
      
      {/* Stats Overlay */}
      <div className="fixed bottom-24 right-6 glass-pane px-4 py-2 text-xs font-mono z-40">
        LIVE HOSTS: {tracks.length} / 50
      </div>
    </div>
  );
}
