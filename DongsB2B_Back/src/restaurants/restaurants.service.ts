import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/allCategories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/deleteRestaurant.dto";
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
            const category = await this.categories.getOrCreate(createRestaurantInput.categoryName)
            newRestaurant.category = category
            await this.restaurants.save(newRestaurant);
            return { ok: true }
        }catch{
            return { ok: false, error: '식당을 생성할 수 없습니다.'}
        }
    }
    async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput>{
        try{
            const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId)
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
            let category: Category = null
            if(editRestaurantInput.categoryName){
                category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
            }
            await this.restaurants.save([{
                id:editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                ...(category && {category})
            }])
            return { ok: true }
        }catch(e){
            console.error(e)
            return{ ok:false, error: '식당을 수정할수 없습니다.' }
        }
    }

    async deleteRestaurant(owner: User, {restaurantId}: DeleteRestaurantInput): Promise<DeleteRestaurantOutput>{
        try{
            const restaurant = await this.restaurants.findOne(restaurantId)
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
            await this.restaurants.delete(restaurantId)
            return{ ok: true}
        }catch(e){
            console.error(e)
            return{ ok: false,  error: "식당을 삭제할 수 없습니다." }
        }
    }

    async allCategories(): Promise<AllCategoriesOutput>{
        try{
            const categories = await this.categories.find()
            return{ok: true, categories}
        }catch{
            return{ ok:false, error:"카테고리를 로딩할 수 없습니다."}
        }
    }
    countRestaurants(category: Category){
        return this.restaurants.count({category})
    }
    
    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne({ slug });
            if (!category) {
                return { ok: false, error: 'Category not found'};
            }
            const restaurants = await this.restaurants.find({
                where: {
                    category
                },
                take: 25,
                skip: (page -1) * 25
            })
            category.restaurants = restaurants
            const totalResults = await this.countRestaurants(category);
            return { ok: true, category, totalPages: Math.ceil(totalResults / 25) };
        } catch(e) {
            return { ok: false, error: 'Could not load category' };
        }
    }
}