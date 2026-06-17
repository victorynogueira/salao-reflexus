const http = require('http');
const data = JSON.stringify({ email: 'admin@reflexus.com', password: 'admin123' });
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Response:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
});
req.write(data);
req.end();
