import { useState, useCallback } from 'react';
import { RemoteTrackPublication, VideoQuality } from 'livekit-client';

/**
 * Hook for manual bandwidth management.
 * Allows switching between Low, Medium, and High quality layers.
 */
export function useAdaptiveQuality() {
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>(VideoQuality.HIGH);

  const setManualQuality = useCallback((publication: RemoteTrackPublication, quality: VideoQuality) => {
    try {
      publication.setVideoQuality(quality);
      setCurrentQuality(quality);
    } catch (error) {
      console.error('Failed to set manual quality:', error);
    }
  }, []);

  const setAudioOnly = useCallback((publications: RemoteTrackPublication[]) => {
    publications.forEach(pub => {
      if (pub.kind === 'video') {
        pub.setEnabled(false);
      }
    });
  }, []);

  return {
    currentQuality,
    setManualQuality,
    setAudioOnly,
  };
}
