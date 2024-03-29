import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { AllCategoriesOutput } from "./dtos/allCategories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/createDish.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/deleteDish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/deleteRestaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/editDish.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/editRestaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import {  RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/searchRestaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(()=>Restaurant)
export class RestaurantsResolver{
    constructor(private readonly restaurantService: RestaurantService){}
    // 식당 추가하기
    @Mutation(()=> CreateRestaurantOutput)
    @Role(['Owner'])
    async createRestaurant( 
        @AuthUser() authUser: User,
        @Args('input')createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> { 
        return this.restaurantService.createRestaurant(authUser, createRestaurantInput)
    }
    // 식당정보 수정하기
    @Mutation(()=> EditRestaurantOutput)
    @Role(['Owner'])
    editRestaurant(
        @AuthUser() owner: User,
        @Args('input') editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput)
    }
    // 식당 삭제하기
    @Mutation(()=> DeleteRestaurantOutput)
    @Role(['Owner'])
    deleteRestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput)
    }

    @Query(()=> RestaurantsOutput)
    restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput>{
        return this.restaurantService.allRestaurants(restaurantsInput)
    }

    @Query(()=> RestaurantOutput)
    restaurant(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput>{
        return this.restaurantService.findRestaurantById(restaurantInput)
    }

    @Query(()=> SearchRestaurantOutput)
    searchRestaurant(@Args('input') searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput>{
        return this.restaurantService.searchRestaurantByName(searchRestaurantInput)
    }
}

@Resolver(()=> Category)
export class CategoryResolver{
    constructor (private readonly restaurantService:RestaurantService){}
    
    @ResolveField(()=> Number)
    restaurantCount(@Parent()category: Category): Promise<number>{
        console.log(category)
        return this.restaurantService.countRestaurants(category)
    }
    //모든 카테고리 조회
    @Query(()=> AllCategoriesOutput)
    allCategories():Promise<AllCategoriesOutput>{
        return this.restaurantService.allCategories()
    }
    //slug로 카테고리 찾기
    @Query(()=> CategoryOutput)
    category(@Args('input') categoryInput:CategoryInput): Promise<CategoryOutput>{
        return this.restaurantService.findCategoryBySlug(categoryInput)
    }
}

@Resolver(()=> Dish)
export class DishResolver{
    constructor(private readonly restaurantService: RestaurantService){}

    // 메뉴 만들기
    @Mutation(()=>CreateDishOutput)
    @Role(['Owner'])
    createDish(@AuthUser()owner: User, @Args('input')createDishInput: CreateDishInput): Promise<CreateDishOutput>{
        return this.restaurantService.createDish(owner, createDishInput)
    }
    //메뉴 수정하기
    @Mutation(()=>EditDishOutput)
    @Role(['Owner'])
    editDish(@AuthUser()owner: User, @Args('input')editDishInput: EditDishInput): Promise<EditDishOutput>{
        return this.restaurantService.editDish(owner, editDishInput)
    }
    //메뉴 삭제하기
    @Mutation(()=>DeleteDishOutput)
    @Role(['Owner'])
    deleteDish(@AuthUser()owner: User, @Args('input')deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput>{
        return this.restaurantService.deleteDish(owner, deleteDishInput)
    }
}