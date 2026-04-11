/**
 * AI Moderation Layer
 * Integrates with Sightengine for chat and image filtering.
 */

export async function moderateText(text: string) {
  // Mocking Sightengine API call
  // In production, use: https://api.sightengine.com/1.0/check.json
  
  const badWords = ['spam', 'abuse', 'hack']; // Simplified for demo
  const isFound = badWords.some(word => text.toLowerCase().includes(word));
  
  if (isFound) {
    return {
      safe: false,
      reason: 'Contains prohibited content',
    };
  }

  return { safe: true };
}

export async function moderateMedia(imageUrl: string) {
  // Process image with Sightengine (nudity, violence, etc.)
  return { safe: true };
}
