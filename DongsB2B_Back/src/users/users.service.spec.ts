import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { Vertification } from "./entities/vertification.entity"
import { UserService } from "./user.service"

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
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
            role: 0
        }
        it('should fail if user exists', async () => {
            usersRepository.findOne.mockResolvedValue({
                id:1,
                email: 'asdf'
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
    }) 
    it.todo('findById')
    it.todo('editProfile')
    it.todo('vertifyEmail')
})   