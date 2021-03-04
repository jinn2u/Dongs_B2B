import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository
        (Restaurant) private readonly restaurants: Repository<Restaurant>,
        @InjectRepository
        (Category) private readonly categories: Repository<Category>
    ){}

    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInput)
            newRestaurant.owner = owner
            const categoryName =  createRestaurantInput.categoryname.trim().toLowerCase() 
            const categorySlug = categoryName.replace(/ /g, '-')
            let category = await this.categories.findOne({slug:categorySlug})
            if(!category){
                category = await this.categories.save(this.categories.create({slug: categorySlug, name: categoryName}))
            }
            newRestaurant.category = category
            return{ok: true}
        }catch{
            return { ok: false, error: '식당을 생성할 수 없습니다.'}
        }
    }

}