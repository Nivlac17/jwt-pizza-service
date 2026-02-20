const request = require('supertest');
const app = require('../service');


test('list users unauthorized', async () => {
  const listUsersRes = await request(app).get('/api/user');
  expect(listUsersRes.status).toBe(401);
});

test('list users', async () => {
  const [user, userToken] = await registerUser(request(app));
  console.log(user);
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


function randomName() {
  return Math.random().toString(36).substring(2, 12);
}


// -------------------------------------------------------------------


// test('admin can update other user', async () => {
//   const [admin, adminToken] = await registerUser(request(app));
//   const [normalUser] = await registerUser(request(app));

//   await DB.addUserRole(admin.id, Role.Admin);

//   const res = await request(app)
//     .put(`/api/user/${normalUser.id}`)
//     .set('Authorization', 'Bearer ' + adminToken)
//     .send({
//       name: 'admin updated',
//       email: normalUser.email,
//       password: 'newpass',
//     });

//   expect(res.status).toBe(200);
//   expect(res.body.user.name).toBe('admin updated');
// });




test('get me unauthorized', async () => {
  const res = await request(app).get('/api/user/me');
  expect(res.status).toBe(401);
});


test('get me success', async () => {
  const [user, token] = await registerUser(request(app));

  const res = await request(app)
    .get('/api/user/me')
    .set('Authorization', 'Bearer ' + token);

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(user.id);
  expect(res.body.email).toBe(user.email);
});


test('update self user', async () => {
  const [user, token] = await registerUser(request(app));

  const updateData = {
    name: 'updated name',
    email: user.email,
    password: 'newpass',
  };

  const res = await request(app)
    .put(`/api/user/${user.id}`)
    .set('Authorization', 'Bearer ' + token)
    .send(updateData);

  expect(res.status).toBe(200);
  expect(res.body.user.name).toBe('updated name');
  expect(res.body.token).toBeDefined();
});


test('update other user forbidden', async () => {
  const [user1, token1] = await registerUser(request(app));
  console.log(user1);
  const [user2] = await registerUser(request(app));

  const res = await request(app)
    .put(`/api/user/${user2.id}`)
    .set('Authorization', 'Bearer ' + token1)
    .send({
      name: 'hacker',
      email: user2.email,
      password: '123',
    });

  expect(res.status).toBe(403);
  expect(res.body.message).toBe('unauthorized');
});




test('delete user returns not implemented', async () => {
  const [user, token] = await registerUser(request(app));

  const res = await request(app)
    .delete(`/api/user/${user.id}`)
    .set('Authorization', 'Bearer ' + token);

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('not implemented');
});

test('list users returns empty object body', async () => {
  const [user, token] = await registerUser(request(app));
  console.log(user);

  const res = await request(app)
    .get('/api/user')
    .set('Authorization', 'Bearer ' + token);

  expect(res.status).toBe(200);
  expect(res.body).toEqual({});
});