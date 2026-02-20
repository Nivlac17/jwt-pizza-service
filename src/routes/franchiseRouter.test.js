const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

let adminUser;
let adminToken;

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

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}


beforeAll(async () => {
  adminUser = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send({
    email: adminUser.email,
    password: adminUser.password,
  });

  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);
  adminToken = loginRes.body.token;
});




test('admin can create franchise', async () => {
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
    .set('Authorization', `Bearer ${adminToken}`)
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






test('franchise create and delete store', async () => {
  const franchiseAdmin = {
    name: randomName(),
    email: `${randomName()}@test.com`,
    password: 'a',
  };

  const regRes = await request(app).post('/api/auth').send(franchiseAdmin);
  expect(regRes.status).toBe(200);
  const createFranchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `fr-${randomName()}`,
      admins: [{ email: franchiseAdmin.email }],
    });

  expect(createFranchiseRes.status).toBe(200);
  const franchiseId = createFranchiseRes.body.id;
  expect(franchiseId).toBeTruthy();
  const loginRes = await request(app).put('/api/auth').send(franchiseAdmin);
  expect(loginRes.status).toBe(200);
  const franchiseAdminToken = loginRes.body.token;
  expectValidJwt(franchiseAdminToken);
  const storeRes = await request(app)
    .post(`/api/franchise/${franchiseId}/store`)
    .set('Authorization', `Bearer ${franchiseAdminToken}`)
    .send({ name: `store-${randomName()}` });

  expect(storeRes.status).toBe(200);
  expect(storeRes.body.name).toBeDefined();
  const storeId = storeRes.body.id || storeRes.body._id;
  expect(storeId).toBeTruthy();

  const deleteRes = await request(app)
    .delete(`/api/franchise/${franchiseId}/store/${storeId}`)
    .set('Authorization', `Bearer ${franchiseAdminToken}`);

  expect([200, 204]).toContain(deleteRes.status);
  const getRes = await request(app)
    .get(`/api/franchise/${franchiseId}/store/${storeId}`)
    .set('Authorization', `Bearer ${franchiseAdminToken}`);

  expect(getRes.status).toBe(404);
});






test('admin can get franchises for any user', async () => {
  // Create a normal user who will be a franchise admin
  const user = {
    name: randomName(),
    email: `${randomName()}@user.com`,
    password: 'a',
  };

  const regRes = await request(app).post('/api/auth').send(user);
  expect(regRes.status).toBe(200);

  // Create a franchise and assign that user as admin (using adminToken)
  const franchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `fr-${randomName()}`,
      admins: [{ email: user.email }],
    });

  expect(franchiseRes.status).toBe(200);
  const franchiseId = franchiseRes.body.id;
  expect(franchiseId).toBeTruthy();

  // Admin fetches franchises for that user
  const getRes = await request(app)
    .get(`/api/franchise/${regRes.body.user.id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(getRes.status).toBe(200);
  expect(Array.isArray(getRes.body)).toBe(true);
  expect(getRes.body.map((f) => f.id)).toContain(franchiseId);
});

test('user can get their own franchises', async () => {
  const user = {
    name: randomName(),
    email: `${randomName()}@self.com`,
    password: 'a',
  };

  const regRes = await request(app).post('/api/auth').send(user);
  expect(regRes.status).toBe(200);
  const userToken = regRes.body.token;
  expectValidJwt(userToken);

  // Create franchise assigned to this user
  const franchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `fr-${randomName()}`,
      admins: [{ email: user.email }],
    });

  expect(franchiseRes.status).toBe(200);
  const franchiseId = franchiseRes.body.id;

  // User fetches their own franchises
  const getRes = await request(app)
    .get(`/api/franchise/${regRes.body.user.id}`)
    .set('Authorization', `Bearer ${userToken}`);

  expect(getRes.status).toBe(200);
  expect(Array.isArray(getRes.body)).toBe(true);
  expect(getRes.body.map((f) => f.id)).toContain(franchiseId);
});

test('user cannot get another user’s franchises', async () => {
  // First user
  const user1 = {
    name: randomName(),
    email: `${randomName()}@one.com`,
    password: 'a',
  };

  const reg1 = await request(app).post('/api/auth').send(user1);
  expect(reg1.status).toBe(200);
  const token1 = reg1.body.token;
  expectValidJwt(token1);

  // Second user
  const user2 = {
    name: randomName(),
    email: `${randomName()}@two.com`,
    password: 'a',
  };

  const reg2 = await request(app).post('/api/auth').send(user2);
  expect(reg2.status).toBe(200);

  // user1 tries to fetch user2's franchises
  const getRes = await request(app)
    .get(`/api/franchise/${reg2.body.user.id}`)
    .set('Authorization', `Bearer ${token1}`);

  expect(getRes.status).toBe(200);
  expect(getRes.body).toEqual([]); // router returns empty array if unauthorized
});



test('delete franchise removes it from user franchises', async () => {
  // Create a franchise admin user
  const franchiseAdmin = {
    name: randomName(),
    email: `${randomName()}@delete.com`,
    password: 'a',
  };

  const regRes = await request(app).post('/api/auth').send(franchiseAdmin);
  expect(regRes.status).toBe(200);

  // Create franchise assigned to this user
  const createRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `fr-${randomName()}`,
      admins: [{ email: franchiseAdmin.email }],
    });

  expect(createRes.status).toBe(200);
  const franchiseId = createRes.body.id;
  expect(franchiseId).toBeTruthy();

  // Verify franchise exists for the user (as admin)
  const getBeforeDelete = await request(app)
    .get(`/api/franchise/${regRes.body.user.id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(getBeforeDelete.status).toBe(200);
  expect(getBeforeDelete.body.map((f) => f.id)).toContain(franchiseId);

  // Delete franchise (route has no auth, so no token required)
  const deleteRes = await request(app).delete(`/api/franchise/${franchiseId}`);
  expect(deleteRes.status).toBe(200);
  expect(deleteRes.body.message).toBe('franchise deleted');

  // Verify franchise no longer appears
  const getAfterDelete = await request(app)
    .get(`/api/franchise/${regRes.body.user.id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(getAfterDelete.status).toBe(200);
  expect(getAfterDelete.body.map((f) => f.id)).not.toContain(franchiseId);
});