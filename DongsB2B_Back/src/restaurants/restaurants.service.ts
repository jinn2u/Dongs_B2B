import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/editRestaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>,
        private readonly categories: CategoryRepository
    ){}


     
    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInput)
            newRestaurant.owner = owner
            const category = await this.categories.getOrCreate(createRestaurantInput.categoryname)
            newRestaurant.category = category
            return{ok: true}
        }catch{
            return { ok: false, error: '식당을 생성할 수 없습니다.'}
        }
    }
    async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput>{
        try{
            const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId, {loadRelationIds: true})
            if(!restaurant){
                return {
                    ok: false,
                    error: "해당하는 식당이 존재하지 않습니다."
                }
            }
            if(owner.id !== restaurant.ownerId){
                return {
                    ok: false,
                    error: "소유하고 식당이 아니므로 수정할 수 없습니다."
                }
            }
        }catch(e){
            console.error(e)
            return{
                ok:false,
                error: '식당을 수정할수 없습니다.'
            }
        }
    }

}