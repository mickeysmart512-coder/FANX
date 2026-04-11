import { AccessToken } from 'livekit-server-sdk';

export async function generateToken(roomName: string, participantName: string, role: 'fan' | 'celebrity') {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '2h',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: role === 'celebrity',
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
}
