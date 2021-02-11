import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service"
import { User } from "./entities/user.entity"
import { Vertification } from "./entities/vertification.entity"
import { UserService } from "./user.service"

const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
}
const mockJwtService = {
    sign: jest.fn(),
    vertify: jest.fn(),
}

describe("UserService", () => { 
    let service: UserService
    beforeAll(async ()=> {
        const module = await Test.createTestingModule({
            providers: [
                UserService, 
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository
                },
                {
                    provide: getRepositoryToken(Vertification),
                    useValue: mockRepository
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
    })

    it('be definded', ()=>{
        expect(service).toBeDefined()
    })

    it.todo('createAccount')
    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('vertifyEmail')
})