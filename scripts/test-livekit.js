const { RoomServiceClient, AccessToken } = require('livekit-server-sdk');

const url = 'wss://fanx-8ah57jg5.livekit.cloud';
const apiKey = 'API5eHyxbgrAGNF';
const apiSecret = '3SQdtGQndnR3flXe60Oie1hE0xUG8b2jomKATzcW2uyA';

async function testLiveKit() {
  console.log('--- FANX LiveKit System Check ---');
  console.log('URL:', url);
  console.log('Key:', apiKey);

  try {
    // 1. Test Token Generation
    const at = new AccessToken(apiKey, apiSecret, { identity: 'SystemCheck' });
    at.addGrant({ roomJoin: true, room: 'system-test' });
    const token = await at.toJwt();
    console.log('[OK] Token Generation successful.');

    // 2. Test Room Service Connectivity
    // Note: RoomServiceClient uses HTTP/HTTPS for API calls, not WSS directly.
    // Converting wss:// to https://
    const apiUrl = url.replace('wss://', 'https://');
    const roomService = new RoomServiceClient(apiUrl, apiKey, apiSecret);
    const rooms = await roomService.listRooms();
    console.log(`[OK] Room Service reached. Active rooms: ${rooms.length}`);
    
    console.log('\n>>> SYSTEM GREEN: LiveKit is active.');
  } catch (err) {
    console.error('\n!!! SYSTEM RED: LiveKit check failed.');
    console.error(err.message);
    process.exit(1);
  }
}

testLiveKit();
