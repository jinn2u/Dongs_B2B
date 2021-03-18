import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Raw, Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/allCategories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/createDish.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/deleteDish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/deleteRestaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/editDish.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/editRestaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/searchRestaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish) 
        private readonly dishes:Repository <Dish>,
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
    async allRestaurants({page}: RestaurantsInput): Promise<RestaurantsOutput>{
        try{
            const [restaurants, totalResults] = await this.restaurants.findAndCount({ skip: (page -1) * 25, take: 25 })
            return{ ok: true, results:restaurants, totalPages: Math.ceil(totalResults / 25), totalResults}
        }catch(e){
            console.error(e)
            return { ok: false, error: '식당을 로딩할 수 없습니다.'}
        }
    }

    async findRestaurantById({restaurantId}: RestaurantInput): Promise<RestaurantOutput>{
        try{
            const restaurant = await this.restaurants.findOne(restaurantId, {relations: ['menu']})
            if(!restaurant){
                return { ok: false, error: '식당을 찾을 수 없습니다.'}
            }
            return { ok: true, restaurant}
        }catch(e){  
            console.error(e)
            return { ok: false, error: '식당을 찾을 수 없습니다.'}
        }
    }

    async searchRestaurantByName({query, page}:SearchRestaurantInput): Promise<SearchRestaurantOutput>{
        try{
            const [restaurants, totalResults] = await this.restaurants.findAndCount({where: {name: Raw(name => `${name} ILIKE '%${query}%'`)}, take: 25, skip: (page -1) * 25 })
            return { ok: true, restaurants, totalResults, totalPages: Math.ceil(totalResults / 25) }
        }catch(e){
            console.error(e)
            return{ ok: false, error: '식당이 존재하지 않습니다.'} 
        }
    }
    async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput>{
        try{
            const restaurant = await this.restaurants.findOne(createDishInput.restaurantId)
            if(!restaurant){
                return {ok: false, error: "식당을 찾을 수 없습니다."}
            }
            if(owner.id !== restaurant.ownerId){
                return {ok: false, error: "잘못된 접근입니다."}
            }
            const dish = await this.dishes.save(this.dishes.create({...createDishInput, restaurant}))
            return { ok: true}
        }catch(e){
            console.error(e)
            return { ok: false, error: "잘못된 접근입니다."}
        }
    }
    async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput>{
        try{
            const dish = await this.dishes.findOne(editDishInput.dishId, {relations:['restaurant']})
            if(!dish){
                return { ok: false, error: '삭제할 메뉴가 존재하지 않습니다.'}
            }
            if(dish.restaurant.ownerId !== owner.id){
                return { ok: false, error: '메뉴를 삭제할 권한인 없습니다.'}
            }
            await this.dishes.save({id: editDishInput.dishId, ...editDishInput})
            // await this.dishes.save([{id: editDishInput.dishId, ...editDishInput}])
            return { ok: true }
        }catch(e){
            console.error(e)
            return {ok: false}
        }
    }
    async deleteDish(owner: User, {dishId}:DeleteDishInput): Promise<DeleteDishOutput>{
        try{
            const dish = await this.dishes.findOne(dishId, {relations:['restaurant']})
            if(!dish){
                return { ok: false, error: '삭제할 메뉴가 존재하지 않습니다.'}
            }
            if(dish.restaurant.ownerId !== owner.id){
                return { ok: false, error: '메뉴를 삭제할 권한인 없습니다.'}
            }
            await this.dishes.delete(dishId )
            return { ok: true }
        }catch(e){
            console.error(e)
            return { ok: false, error: '메뉴를 삭제할 수 없습니다.' }
        }
    }
}