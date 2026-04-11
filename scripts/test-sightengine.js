const axios = require('axios');
const FormData = require('form-data');

const apiUser = '547240438';
const apiSecret = 'yhRKtxcAU2BxQkRHsH7YDPfZAeSE3CFk';

async function testSightengine() {
  console.log('--- FANX Sightengine System Check ---');
  
  const testText = 'This is a clean message for the system check.';
  const data = new FormData();
  data.append('text', testText);
  data.append('lang', 'en');
  data.append('mode', 'rules');
  data.append('api_user', apiUser);
  data.append('api_secret', apiSecret);

  try {
    const response = await axios.post('https://api.sightengine.com/1.0/text/check.json', data, {
      headers: data.getHeaders(),
    });

    if (response.data.status === 'success') {
      console.log('[OK] Sightengine API reached.');
      console.log('Respose:', JSON.stringify(response.data.summary, null, 2));
      console.log('\n>>> SYSTEM GREEN: Moderation engine is active.');
    } else {
      throw new Error(response.data.error?.message || 'Unknown error');
    }
  } catch (err) {
    console.error('\n!!! SYSTEM RED: Sightengine check failed.');
    console.error(err.message);
    process.exit(1);
  }
}

testSightengine();
