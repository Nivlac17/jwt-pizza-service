const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');



function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
  let user = { password: 'awesomePassword', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = `${user.name}@admin.com`;

  user = await DB.addUser(user);
  return { ...user, password: 'awesomePassword' };
}

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

test('admin can create a franchise', async () => {
  const adminUser = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send({
    email: adminUser.email,
    password: adminUser.password,
  });

  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);

  const token = loginRes.body.token;
  const diner = {
    name: randomName(),
    email: `${randomName()}@jwt.com`,
    password: 'a',
  };

  const registerRes = await request(app).post('/api/auth').send(diner);
  expect(registerRes.status).toBe(200);

  const franchiseBody = {
    name: `franchise ${randomName()}`,
    admins: [{ email: diner.email }],
  };

  const createRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${token}`)
    .send(franchiseBody);

  expect(createRes.status).toBe(200);
  expect(createRes.body.id).toBeTruthy();
  expect(createRes.body.admins.map((a) => a.email)).toContain(diner.email);
});

test('non-admin cant create franchise', async () => {
  const user = { name: randomName(), email: `${randomName()}@jwt.com`, password: 'a' };

  const registerRes = await request(app).post('/api/auth').send(user);
  expect(registerRes.status).toBe(200);
  const token = registerRes.body.token;
  expectValidJwt(token);

  const createRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `fr-${randomName()}`, admins: [{ email: user.email }] });

  expect(createRes.status).toBe(403);
});




test('franchise create store', async () => {
  const user = { name: randomName(), email: `${randomName()}@jwt.com`, password: 'a' };

  const registerRes = await request(app).post('/api/auth').send(user);
  expect(registerRes.status).toBe(200);
  const token = registerRes.body.token;
  expectValidJwt(token);

  const createRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `fr-${randomName()}`, admins: [{ email: user.email }] });

  expect(createRes.status).toBe(403);
});
