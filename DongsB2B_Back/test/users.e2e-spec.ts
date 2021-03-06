import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { parseSelectionSet } from 'graphql-tools';
import { StringDecoder } from 'string_decoder';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vertification } from 'src/users/entities/vertification.entity';

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
  let vertificationRepository: Repository<Vertification>

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) => baseTest()
.set('X-JWT', jwtToken)
.send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    vertificationRepository = module.get<Repository<Vertification>>(getRepositoryToken(Vertification))

    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(`
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
      )
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true)
        expect(res.body.data.createAccount.error).toBe(null)
      })
    })
    it('should fail if account already exists', () => {
      return publicTest(`
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
      )
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false)
        expect(res.body.data.createAccount.error).toBe("이메일을 가지고 있는 사용자가 존재합니다.")
      })
    })
  })

  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest(`
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
      )
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
      return publicTest(`
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
      )
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
      return privateTest(`
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
      )
      .expect(200)
      .expect(res=> {
        const {body: {data: {userProfile: {ok, error, user: {id}}}}} = res
        expect(ok).toBe(true)
        expect(error).toBe(null)
        expect(id).toBe(userId)
      })
    })
    it("should not found a profile", () => {
      return privateTest(`
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
      )
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
      return privateTest(`
          {
            me {
              email
            }
          }
        `
      )
      .expect(200)
      .expect(res => {
        const {body: {data: {me: {email}}}} = res
        expect(email).toBe(testUser.email)
      })
    })
    it("should not allow logged out user", () => {
      return publicTest(`
          {
            me {
              email
            }
          }
        `
      )
      .expect(200)
      .expect(res => {
        const {body: {errors}} = res
        const [error] = errors
        expect(error.message).toBe('Forbidden resource')
      })
    })
  })
  describe('editProfile', () => {
    const NEW_EMAIL = 'new Email@google.com'
    it('should change email', () => {
      return privateTest(`
          mutation{
            editProfile(input: {
              email: "${NEW_EMAIL}"
            }){
              ok
              error
            }
          }
        `
      )
      .expect(200)
      .expect(res => {
        const {body: {data: {editProfile: {ok, error}}}} = res
        expect(ok).toBe(true)
        expect(error).toBe(null) 
      })
    })
    it('should have new email', () => {
      return privateTest(`
        {
          me {
            email
          }
        }
      `
      )
      .expect(200) 
      .expect(res => {
        const {body: {data: {me: {email}}}} = res
        expect(email).toBe(NEW_EMAIL)
      })
    })
  })
  describe('vertifyEmail', () => {
    let vertificationCode: string
    beforeAll(async () => {
      const [vertification] = await vertificationRepository.find()
      vertificationCode = vertification.code
    })
    it("should vertify email", () => {
      return privateTest(`
          mutation{
            vertifyEmail(input:{
              code: "${vertificationCode}"
            }){
              ok
              error
            }
          }
        `
      )
      .expect(200)
      .expect(res => {
        const {body: {data: {vertifyEmail: {ok, error}}}} = res
        expect(ok).toBe(true)
        expect(error).toBe(null)
      })
    })

    it("should fail on wrong vertification code", () => {
      return privateTest(`
          mutation{
            vertifyEmail(input:{
              code: "wrong"
            }){
              ok
              error
            }
          }
        `
      )
      .expect(200)
      .expect(res => {
        const {body: {data: {vertifyEmail: {ok, error}}}} = res
        expect(ok).toBe(false)
        expect(error).toBe("올바른 인증이 아닙니다.")
      })
    })
  })
});
