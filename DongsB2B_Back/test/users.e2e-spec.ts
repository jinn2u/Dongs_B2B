import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { parseSelectionSet } from 'graphql-tools';
import { StringDecoder } from 'string_decoder';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql'
const testUser = {
  email : "bsybear623@gmail.com",
  password : "12345"
}

jest.mock("got", () => {
  return{
    post: jest.fn()
  }
})

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string
  let usersRepository: Repository<User>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
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
              email:"${testUser.email}",
              password:"${testUser.password}",
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
              email:"${testUser.email}",
              password:"${testUser.password}",
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
              email:"${testUser.email}",
              password:"${testUser.password}",
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
        jwtToken = login.token
      })
    })
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation{
            login(input: {
              email:"${testUser.email}",
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
  describe('userProfile', () => {
    let userId: number

    beforeAll(async() => {
      const [User] =await usersRepository.find()
      userId = User.id
    })
    it("should find user's profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set('X-JWT', jwtToken).send({
        query: `
          {
            userProfile(userId: ${userId}){
              ok
              error
              user{
                id
              }
            }
          }
        `
      })
      .expect(200)
      .expect(res=> {
        const {body: {data: {userProfile: {ok, error, user: {id}}}}} = res
        expect(ok).toBe(true)
        expect(error).toBe(null)
        expect(id).toBe(userId)
      })
    })
    it("should not found a profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set('X-JWT', jwtToken).send({
        query: `
          {
            userProfile(userId: 123){
              ok
              error
              user{
                id
              }
            }
          }
        `
      })
      .expect(200)
      .expect(res=> {
        const {body: {data: {userProfile: {ok, error, user}}}} = res
        expect(ok).toBe(false)
        expect(error).toBe("사용자가 존재하지 않습니다.")
        expect(user).toBe(null)
      })
    })
  })

  describe('me', () => {
    it("should find my profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set('X-JWT', jwtToken).send({
        query: `
          {
            me {
              email
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        const {body: {data: {me: {email}}}} = res
        expect(email).toBe(testUser.email)
      })
    })
    it("should not allow logged out user", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          {
            me {
              email
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        const {body: {errors}} = res
        const [error] = errors
        expect(error.message).toBe('Forbidden resource')
      })
    })
  })
  it.todo('vertifyEmail')
  it.todo('editProfile')
});
