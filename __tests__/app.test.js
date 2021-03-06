require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns all todos', async() => {

      const expectation = [
        {
          id: 1,
          todo: 'sweep the floors',
          completed: true,
          user_id: 1
        },
        {
          id: 2,
          todo: 'call mechanic',
          completed: false,
          user_id: 1 
        },
        {
          id: 3,
          todo: 'finish to-do list lab',
          completed: false,
          user_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('creates a new todo as the test user', async() => {
      const newTodo = {
        todo: 'wash windows',
        completed: false
      };

      const expectation = {
        id: 4,
        todo: 'wash windows',
        completed: false,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .set({ 'Authorization': token })
        .send(newTodo)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('gets the test user todos', async() => {
      const expectation = [{
        id: 4,
        todo: 'wash windows',
        completed: false,
        user_id: 2
      }];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set({ 'Authorization': token })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('updates the completed property of a user todo item', async() => {
      const expectation = {
        id: 4,
        todo: 'wash windows',
        completed: true,
        user_id: 2
      };

      const update = { completed: true };

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set({ 'Authorization': token })
        .send(update)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});