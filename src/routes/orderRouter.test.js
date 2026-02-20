// const express = require('express');
// const config = require('../config.js');
// const { Role, DB } = require('../database/database.js');
// const { authRouter } = require('./authRouter.js');
// const { asyncHandler, StatusCodeError } = require('../endpointHelper.js');

const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');


test('get menu', async () => {
  const menuRes = await request(app)
    .get('/api/order/menu'); // adjust path if different

  expect(menuRes.status).toBe(200);
  expect(menuRes.body).toBeDefined();
});

test('non-admin cannot add menu item', async () => {
  // Create normal user (not admin)
  const [user, userToken] = await registerUser(request(app));

  const newMenuItem = {
    title: 'New Pizza',
    description: 'Test item',
    price: 12.99,
  };

  const res = await request(app)
    .put('/api/order/menu') // adjust path if needed
    .set('Authorization', 'Bearer ' + userToken)
    .send(newMenuItem);

  expect(res.status).toBe(403);
  expect(res.body.message).toMatch(/unable to add menu item/i);
});

async function registerUser(service) {
  const testUser = {
    name: 'pizza diner',
    email: `${randomName()}@test.com`,
    password: 'a',
  };
  const registerRes = await service.post('/api/auth').send(testUser);
  registerRes.body.user.password = testUser.password;

  return [registerRes.body.user, registerRes.body.token];
}

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
  const user = { password: 'awesomePassword', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = `${user.name}@admin.com`;

  const created = await DB.addUser(user);
  // Return a user object that includes the plain password for login in tests
  return { ...created, password: 'awesomePassword' };
}

