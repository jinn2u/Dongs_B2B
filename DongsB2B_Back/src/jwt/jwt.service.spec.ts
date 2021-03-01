import { Test } from "@nestjs/testing/test"
import { CONFIG_OPTIONS } from "src/common/common.constants"
import { JwtService } from "./jwt.service"
import * as jwt from 'jsonwebtoken'

const Test_Key = 'testKey'
const USER_ID = 1

jest.mock('jsonwebtoken', () => {
    return{
        sign: jest.fn(()=> "TOKEN"),
        verify: jest.fn(()=> ({id: USER_ID}))
    }
})
describe('JwtService', () => {
    let service: JwtService
    beforeEach(async() => {
        const module = await Test.createTestingModule({
            providers: [JwtService, {
                provide: CONFIG_OPTIONS,
                useValue: {privateKey: Test_Key}
            }]
        }).compile()
        service = module.get<JwtService>(JwtService)
    })
    it('be definded', ()=>{
        expect(service).toBeDefined()
    })
    describe("sign", () => {
        it('should return a signed token', async() => {
            const token = service.sign(USER_ID)
            expect(typeof token).toBe('string')
            expect(jwt.sign).toHaveBeenCalledTimes(1)
            expect(jwt.sign).toHaveBeenCalledWith({id: USER_ID}, Test_Key)
        })
    })
    describe('vertify', () => {
        it('should return the decoded token', () => {
            const TOKEN = "TOKEN"
            const decodedToken = service.vertify(TOKEN)
            expect(decodedToken).toEqual({id: USER_ID})
            expect(jwt.verify).toHaveBeenCalledTimes(1)
            expect(jwt.verify).toHaveBeenCalledWith(TOKEN, Test_Key)
        })
    })
})