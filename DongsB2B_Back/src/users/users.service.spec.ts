import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service"
import { Repository } from "typeorm"
import { User, UserRole } from "./entities/user.entity"
import { Vertification } from "./entities/vertification.entity"
import { UserService } from "./user.service"

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn()
})
const mockJwtService = {
    sign: jest.fn(()=> 'signed-token'),
    vertify: jest.fn(),
}

const mockMailService = {
    sendVerificationEmail: jest.fn()
}

type mockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("UserService", () => { 
    let service: UserService
    let usersRepository: mockRepository<User>
    let vertificationRepository: mockRepository<Vertification>
    let mailService: MailService
    let jwtService: JwtService

    beforeEach(async ()=> {
        const module = await Test.createTestingModule({
            providers: [
                UserService, 
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository()
                },
                {
                    provide: getRepositoryToken(Vertification),
                    useValue: mockRepository()
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                },
        ]
        }).compile()

        service = module.get<UserService>(UserService)
        mailService = module.get<MailService>(MailService)
        usersRepository = module.get(getRepositoryToken(User))
        vertificationRepository = module.get(getRepositoryToken(Vertification))
        jwtService = module.get<JwtService>(JwtService)
    })

    it('be definded', ()=>{
        expect(service).toBeDefined()
    })

    describe("createAccount", () => {
        const createAccountArgs = {
            email: "",
            password: "" ,
            role: UserRole.Owner
        }
        it('should fail if user exists', async () => {
            usersRepository.findOne.mockResolvedValue({
                id:1,
                email: 'asdf',
                role: ""
            })
            const result = await service.createAccount(createAccountArgs)
            expect(result).toMatchObject({ok: false, error: "이메일을 가지고 있는 사용자가 존재합니다."})
        })
        it('should create a new user', async () => {
            usersRepository.findOne.mockResolvedValue(undefined)
            usersRepository.create.mockReturnValue(createAccountArgs)
            usersRepository.save.mockResolvedValue(createAccountArgs)
            vertificationRepository.create.mockReturnValue(createAccountArgs)
            vertificationRepository.save.mockResolvedValue({code: 'code'})

            const result = await service.createAccount(createAccountArgs)
 
            expect(usersRepository.create).toHaveBeenCalledTimes(1)
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs)
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs)

            expect(vertificationRepository.create).toHaveBeenCalledTimes(1)
            expect(vertificationRepository.create).toHaveBeenCalledWith({
                user:createAccountArgs
            })            
            expect(vertificationRepository.save).toHaveBeenCalledTimes(1)
            expect(vertificationRepository.save).toHaveBeenCalledWith(createAccountArgs)

            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1)
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String)) 
            expect(result).toEqual({ok: true})
        })
        it('should fail on exception', async() => {
            usersRepository.findOne.mockRejectedValue(new Error())
            const result = await service.createAccount(createAccountArgs)
            expect(result).toEqual({ok: false, error: "계정을 생성할수 없습니다."})

        })

    })
    
    describe('login', () => {
        const loginArgs = {
            email:"", 
            password: ""
        }

        it('should fail if user does not exist', async() => {

            usersRepository.findOne.mockResolvedValue(null)
            const result = await service.login(loginArgs)
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
            expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
            expect(result).toEqual({ok: false, error: "사용자를 찾을 수 없습니다."})
        })
        it('should fail if the password is wrong', async () => {            
            const mockedUser = {checkPassword: jest.fn(()=> Promise.resolve(false))}
            usersRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(result).toEqual({ok:false, error:"비밀번호가 잘못되었습니다."})
        })
        it('should return token if password correct', async() => {
            const mockedUser = {id: 1, checkPassword: jest.fn(()=> Promise.resolve(true ))}
            usersRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(jwtService.sign).toHaveBeenCalledTimes(1)
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))
            expect(result).toEqual({ok: true, token: 'signed-token'})
        })
        it('should fail on exception', async () => {
            usersRepository.findOne.mockRejectedValue(false)
            const result = await service.login(loginArgs)
            expect(result).toEqual({ok: false, error: false})
        })
    }) 
    describe('findById', () => {
        const findByIdArgs = {
            id: 1
        }
        it('should find an existing user', async() => {
            usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs)
            const result = await service.findById(1)
            expect(result).toEqual({ok: true, user: findByIdArgs})
        })
        it('should fail if no user found', async() => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error())
            const result = await service.findById(1)
            expect(result).toEqual({ok: false, error:"사용자가 존재하지 않습니다."})
        })
        it('should fail on exception', async () => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error())
            const result = await service.findById(1)
            expect(result).toEqual({ok: false, error:"사용자가 존재하지 않습니다."})
        })
    })
    describe('editProfile', () => {
        it('should change email', async () => {
            const oldUser = {
                email: "as@google.com",
                vertified: true
            }
            const editProfileArgs = {
                userId: 1,
                input: {email: "as@google.com"},
            }
            const newVertification = {
                code: 'code'
            }
            const newUser = {
                email: editProfileArgs.input.email,
                vertified: false,
            }
            usersRepository.findOne.mockResolvedValue(oldUser)
            vertificationRepository.create.mockReturnValue(newVertification)
            vertificationRepository.save.mockResolvedValue(newVertification)

            await service.editProfile(editProfileArgs.userId, editProfileArgs.input)

            expect(usersRepository.findOne).toHaveBeenCalledWith(editProfileArgs.userId)
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
            expect(vertificationRepository.create).toHaveBeenCalledWith({user:newUser})
            expect(vertificationRepository.save).toHaveBeenCalledWith(newVertification)
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVertification.code)
        })
        it('should change password', async() => {
            const editProfileArgs = {
                userId: 1,
                input: {password: "asd"},
            }
            usersRepository.findOne.mockResolvedValue({password: 'old'})
            const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
            expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input)
            expect(result).toEqual({ok: true})
        })
        it('should fail on exception', async() => {
            usersRepository.findOne.mockRejectedValue(new Error())
            const result = await service.editProfile(1,{email:'12'})
            expect(result).toEqual({ ok: false, error: "프로필을 업데이트할 수 없습니다."})
        })
    })
    describe('vertifyEmail', () => {
        it('should vertify email', async() => {
            const mockedVertification = {
                user: {
                    vertified: false
                },
                id: 1
            }
            vertificationRepository.findOne.mockResolvedValue(mockedVertification)
            const result = await service.vertifyEmail('')

            expect(vertificationRepository.findOne).toHaveBeenCalledTimes(1)
            expect(vertificationRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
            expect(usersRepository.save).toHaveBeenCalledWith({vertified: true})
            expect(vertificationRepository.delete).toHaveBeenCalledTimes(1)
            expect(vertificationRepository.delete).toHaveBeenCalledWith(mockedVertification.id)
            expect(result).toEqual({ok: true})
        })
        it('should fail on vertification not found', async() => {
            vertificationRepository.findOne.mockResolvedValue(undefined)
            const result = await service.vertifyEmail('')
            expect(result).toEqual({ok: false, error: "올바른 인증이 아닙니다."})
        })
        it('should fail on exception', async() => {
            vertificationRepository.findOne.mockRejectedValue(new Error())
            const result = await service.vertifyEmail('')
            expect(result).toEqual({ok: false, error: "메일 인증을 할 수 없습니다."})
        })
    })
})   