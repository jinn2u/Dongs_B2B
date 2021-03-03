import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { parseSelectionSet } from 'graphql-tools';
import { StringDecoder } from 'string_decoder';

const GRAPHQL_ENDPOINT = '/graphql'
const testUser = {
  EMAIL : "bsybear623@gmail.com",
  PASSWORD : "12345"
}

jest.mock("got", () => {
  return{
    post: jest.fn()
  }
})

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {

    it('should create account', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            createAccount(input: {
              email:"${testUser.EMAIL}",
              password:"${testUser.PASSWORD}",
              role:Owner
            }) {
              ok
              error
            }
          }
        `,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true)
        expect(res.body.data.createAccount.error).toBe(null)
      })
    })
    it('should fail if account already exists', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            createAccount(input: {
              email:"${testUser.EMAIL}",
              password:"${testUser.PASSWORD}",
              role:Owner
            }) {
              ok
              error
            }
          }
        `,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false)
        expect(res.body.data.createAccount.error).toBe("이메일을 가지고 있는 사용자가 존재합니다.")
      })
    })
  })

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation{
            login(input: {
              email:"${testUser.EMAIL}",
              password:"${testUser.PASSWORD}",
            }){
              ok
              error
              token
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        const {body: {data: {login}}} = res
        expect(login.ok).toBe(true)
        expect(login.error).toBe(null)
        expect(login.token).toEqual(expect.any(String))
        let jwtToken = login.token
      })
    })
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation{
            login(input: {
              email:"${testUser.EMAIL}",
              password: "asdf",
            }){
              ok
              error
              token
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        const {body: {data: {login}}} = res
        expect(login.ok).toBe(false)
        expect(login.error).toBe("비밀번호가 잘못되었습니다.")
        expect(login.token).toBe(null)
      })
    })
  })
  it.todo('userProfile')
  it.todo('me')
  it.todo('vertifyEmail')
  it.todo('editProfile')
});
