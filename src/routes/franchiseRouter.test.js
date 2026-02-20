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

  // Delete store (assumes this is the correct delete route)
  const deleteRes = await request(app)
    .delete(`/api/franchise/${franchiseId}/store/${storeId}`)
    .set('Authorization', `Bearer ${franchiseAdminToken}`);

  expect([200, 204]).toContain(deleteRes.status);
  const getRes = await request(app)
    .get(`/api/franchise/${franchiseId}/store/${storeId}`)
    .set('Authorization', `Bearer ${franchiseAdminToken}`);

  expect(getRes.status).toBe(404);
});
















test('list users unauthorized', async () => {
  const listUsersRes = await request(app).get('/api/user');
  expect(listUsersRes.status).toBe(401);
});

test('list users', async () => {
  const [user, userToken] = await registerUser(request(app));
  const listUsersRes = await request(app)
    .get('/api/user')
    .set('Authorization', 'Bearer ' + userToken);
  expect(listUsersRes.status).toBe(200);
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

