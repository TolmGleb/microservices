const express = require('express');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

// GET /orders - получить список всех заказов
app.get('/orders', (req, res) => {
  const data = fs.readFileSync('orders.json');
  const orders = JSON.parse(data);
  res.json(orders);
});

// GET /orders/:id - получить заказ с информацией о пользователе
app.get('/orders/:id', async (req, res) => {
  const orderId = Number(req.params.id);
  const data = fs.readFileSync('orders.json');
  const orders = JSON.parse(data);
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Демонстрация взаимодействия между сервисами
  try {
    const userResponse = await axios.get(`http://user-service:3001/users/${order.userId}`);
    order.user = userResponse.data;
    console.log(`Получен заказ ${orderId} для пользователя ${userResponse.data.name}`);
  } catch (err) {
    console.error(`Не удалось получить пользователя id=${order.userId}`);
    order.user = null;
  }
  
  res.json(order);
});

// POST /orders - создать новый заказ
app.post('/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder.item || !newOrder.userId) {
    return res.status(400).json({ error: 'Order item and userId are required' });
  }
  
  const data = fs.readFileSync('orders.json');
  let orders = JSON.parse(data);
  const maxId = orders.reduce((max, o) => o.id > max ? o.id : max, 0);
  newOrder.id = maxId + 1;
  orders.push(newOrder);
  
  fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));
  console.log(`Создан новый заказ: ${newOrder.item} (id=${newOrder.id}) для пользователя ${newOrder.userId}`);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Order Service запущен на порту ${PORT}`);
});