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
    sign: jest.fn(),
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

    beforeAll(async ()=> {
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
    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('vertifyEmail')
})