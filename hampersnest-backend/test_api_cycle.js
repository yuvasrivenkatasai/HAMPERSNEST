import http from 'http';

async function run() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/settings',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const settings = JSON.parse(data);
      console.log('GET Settings:', settings);
      
      settings.instagramUrl = 'https://www.instagram.com/hampersnest123';
      
      const putOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/settings',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const putReq = http.request(putOptions, (putRes) => {
        let putData = '';
        putRes.on('data', (chunk) => { putData += chunk; });
        putRes.on('end', () => {
          console.log('PUT Response:', putRes.statusCode, putData);
        });
      });
      putReq.write(JSON.stringify(settings));
      putReq.end();
    });
  });
  req.on('error', (e) => console.error(e));
  req.end();
}
run();
