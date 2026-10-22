const https = require('https');

const text = 'Electricity';
const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ur`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log('Status:', res.statusCode);
    console.log('Translated:', parsed?.responseData?.translatedText);
  });
}).on('error', (e) => {
  console.log('ERROR:', e.message);
});
