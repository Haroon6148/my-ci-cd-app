const http = require('http');

const hostname = '0.0.0.0'; // Listen on all interfaces
const port = 3000; // You can choose any port

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from CI/CD Pipeline!');;
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 
