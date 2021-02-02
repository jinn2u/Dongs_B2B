import { Inject, Injectable, Post } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface';
import got from "got"
import * as FormData from 'Form-data'

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS)private readonly options: MailModuleOptions){}
    
    private async sendEmail(subject: string, template: string, emialVars: EmailVar[] ) {
        const form = new FormData();
        form.append('from', `Dong's Eats <mailgun@${this.options.domain}>`);
        form.append('to', `bsybear623@gmail.com`);
        form.append('subject', subject);
        form.append("template",template);
        emialVars.forEach(eVar=>form.append(`v:${eVar.key}`, eVar.value))
        try{
            await got(
              `https://api.mailgun.net/v3/${this.options.domain}/messages`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Basic ${Buffer.from(
                    `api:${this.options.apiKey}`,
                  ).toString('base64')}`,
                },
                body: form,
              },
            );
        }catch(e){
            console.error(e);
        }
    }
    sendVertificationEmail(email: string, code: string){
        this.sendEmail("이메일 검증입니다.", "vertify-email",[{key:"code", value: code},{key:"username", value:email}])
    }
}