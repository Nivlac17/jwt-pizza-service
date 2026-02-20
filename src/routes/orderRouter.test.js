const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');
const config = require('../config.js');



function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function clearDatabase() {
  const connection = await DB.getConnection();
  try {
    await connection.execute('DELETE FROM auth');
    await connection.execute('DELETE FROM userRole');
    await connection.execute('DELETE FROM user');
    await connection.execute('DELETE FROM menu');
  } finally {
    connection.end();
  }
}

async function registerUser(service) {
  const testUser = {
    name: 'pizza diner',
    email: `${randomName()}@test.com`,
    password: 'a',
    roles: [{ role: Role.Diner }], // normal user
  };

  const res = await service.post('/api/auth').send(testUser);
  return [res.body.user, res.body.token];
}

async function loginAsAdmin(service) {
  const res = await service
    .put('/api/auth')
    .send({
      email: config.db.connection.adminemail,
      password: config.db.connection.adminpassword,
    });

  return [res.body.user, res.body.token];
}


// beforeEach(async () => {
//   await clearDatabase();
// });

async function createAdminUser() {
  const user = { password: 'awesomePassword', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = `${user.name}@admin.com`;

  const created = await DB.addUser(user);
  // Return a user object that includes the plain password for login in tests
  return { ...created, password: 'awesomePassword' };
}

beforeAll(async () => {
  adminUser = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send({
    email: adminUser.email,
    password: adminUser.password,
  });

  expect(loginRes.status).toBe(200);
  adminToken = loginRes.body.token;
});



test('get menu', async () => {
  const res = await request(app).get('/api/order/menu');

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('non-admin cannot add menu item', async () => {
  const [user, token] = await registerUser(request(app));

  const newMenuItem = {
    title: 'New Pizza',
    description: 'Test item',
    image: 'image.png',
    price: 12.99,
  };

  const res = await request(app)
    .put('/api/order/menu')
    .set('Authorization', `Bearer ${token}`)
    .send(newMenuItem);

  expect(res.status).toBe(403);
  expect(res.body.message).toMatch(/unable to add menu item/i);
});

test('admin can add menu item and it appears in menu', async () => {
  const newMenuItem = {
    title: 'Verified Pizza',
    description: 'Should exist in menu',
    image: 'verified.png',
    price: 18.5,
  };

  const addRes = await request(app)
    .put('/api/order/menu')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newMenuItem);

  expect(addRes.status).toBe(200);

  const menuRes = await request(app).get('/api/order/menu');

  expect(menuRes.body.some(item => item.title === 'Verified Pizza')).toBe(true);
});