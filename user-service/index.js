const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// GET /users - вернуть список всех пользователей
app.get('/users', (req, res) => {
  let rawData = fs.readFileSync('users.json');
  let users = JSON.parse(rawData);
  res.json(users);
});

// GET /users/:id - вернуть пользователя по ID
app.get('/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  let rawData = fs.readFileSync('users.json');
  let users = JSON.parse(rawData);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// POST /users - добавить нового пользователя
app.post('/users', (req, res) => {
  const newUser = req.body;
  if (!newUser.name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  let rawData = fs.readFileSync('users.json');
  let users = JSON.parse(rawData);
  const maxId = users.reduce((max, u) => u.id > max ? u.id : max, 0);
  newUser.id = maxId + 1;
  users.push(newUser);
  
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log(`Добавлен новый пользователь: ${newUser.name} (id=${newUser.id})`);
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
  console.log(`User Service запущен на порту ${PORT}`);
});