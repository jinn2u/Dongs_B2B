import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service"
import got from "got"
import * as FormData from 'form-data';

jest.mock('got')
jest.mock('form-data')

const TEST_DOMAIN = 'test-domain'

describe("MailService", () => {
    let service: MailService;

    beforeEach(async()=> {
        const module = await Test.createTestingModule({
            providers: [MailService,{
                provide: CONFIG_OPTIONS,
                useValue: { 
                    apiKey: 'test-apiKey',
                    domain: TEST_DOMAIN,
                    fromEmail: 'test-fromEmail',
                } 
            }]
        }).compile()
        service = module.get<MailService>(MailService)
    })

    it('be definded', ()=>{
        expect(service).toBeDefined()
    })
    describe('sendVertificationEmail', () => {
        it('should call sendEmail', () => {
            const sendVertificationEmailArgs = {
                email: 'email',
                code: 'code'
            }
            jest.spyOn(service, 'sendEmail').mockImplementation(async()=> true)
            service.sendVerificationEmail(sendVertificationEmailArgs.email, sendVertificationEmailArgs.code)
            expect(service.sendEmail).toHaveBeenCalledTimes(1)
            expect(service.sendEmail).toHaveBeenLastCalledWith(
                'vertify-email', 'qwe', [
                { key: 'code', value: sendVertificationEmailArgs.code },
                { key: 'username', value: sendVertificationEmailArgs.email },
            ]) 
            
        })
    })
    describe('sendEmail', () => {
        it('send email', async() => {
            const result = await service.sendEmail('', '', [])
            const formSpy = jest.spyOn(FormData.prototype, "append")
            
            expect(formSpy).toHaveBeenCalled()
            expect(got.post).toHaveBeenCalledTimes(1)
            expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, expect.any(Object))
            expect(result).toEqual(true)
        })
        it('sends email', async () => {
            const ok = await service.sendEmail('', '', [
            { key: 'attr', value: 'attrValue' },
            ]);
            const formSpy = jest.spyOn(FormData.prototype, 'append');
            
            expect(formSpy).toHaveBeenCalledTimes(9);

            });
        it('fails on error', async () => {
            jest.spyOn(got, 'post').mockImplementation(()=> {throw new Error()})
            const result = await service.sendEmail('','',[])
            expect(result).toEqual(false)
        })
    })
})