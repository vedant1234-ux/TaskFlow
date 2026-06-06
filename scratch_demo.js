fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Demo User',
    email: 'demo@taskflow.com',
    password: 'demo123'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
