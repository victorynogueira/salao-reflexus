const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/appointments?date=2026-06-16',
  method: 'GET',
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Response:', res.statusCode);
    console.log('Body:', body.substring(0, 500));
  });
});
req.on('error', e => console.error('Error:', e.message));
req.end();
