import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const identity = searchParams.get('identity') || 'anonymous-' + Math.floor(Math.random() * 10000);

  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'LiveKit server misconfigured' }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: identity,
  });

  at.addGrant({ 
    roomJoin: true, 
    room: roomId,
    canPublish: true,
    canSubscribe: true 
  });

  return NextResponse.json({ 
    token: await at.toJwt(),
    serverUrl: wsUrl.replace('wss://', 'https://'), // LiveKit SDK often wants the HTTP/S URL for some tasks, but the component wants WSS.
    wsUrl: wsUrl 
  });
}
