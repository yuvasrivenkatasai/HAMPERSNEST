const https = require('https');

async function testEndpoint(method, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.hampersnest.in',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(`[${method} ${path}] -> ${res.statusCode}\nBody: ${data}\n`);
      });
    });

    req.on('error', error => {
      resolve(`[${method} ${path}] -> Error: ${error.message}\n`);
    });

    req.end();
  });
}

async function run() {
  console.log(await testEndpoint('GET', '/api/hero-banner'));
  console.log(await testEndpoint('POST', '/api/hero-banner'));
  console.log(await testEndpoint('PUT', '/api/hero-banner'));
  console.log(await testEndpoint('DELETE', '/api/hero-banner'));
  console.log(await testEndpoint('POST', '/api/hero-banner/reset'));
}

run();
