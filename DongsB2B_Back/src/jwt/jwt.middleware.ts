import { Injectable } from "@nestjs/common";
import { NestMiddleware } from "@nestjs/common/interfaces";
import { NextFunction, Request, Response } from "express";
import { UserService } from "src/users/user.service";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware{
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ){}
    async use(req:Request,res:Response,next:NextFunction){
        if('x-jwt' in req.headers){
            const token = req.headers['x-jwt']
            const decoded = this.jwtService.vertify(token.toString())
            if(typeof decoded === 'object' && decoded.hasOwnProperty('id')){
                try{
                    const {user, ok} = await this.userService.findById(decoded['id'])
                    if(ok){
                        req['user'] = user
                    }
                }catch(e) {
                    console.error(e)
                }
            }
        }
    next()
    }

}
