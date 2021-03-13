import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { AllCategoriesOutput } from "./dtos/allCategories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/deleteRestaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/editRestaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(()=>Restaurant)
export class RestaurantsResolver{
    constructor(
        private readonly restaurantService: RestaurantService
    ){}
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
}


@Resolver(()=> Category)
export class CategoryResolver{
    constructor (private readonly restaurantService:RestaurantService){}
    
    @ResolveField(()=> Number)
    restaurantCount(@Parent()category: Category): Promise<number>{
        console.log(category)
        return this.restaurantService.countRestaurants(category)
    }

    @Query(()=> AllCategoriesOutput)
    allCategoreis():Promise<AllCategoriesOutput>{
        return this.restaurantService.allCategories()
    }

    @Query(()=> CategoryOutput)
    category(@Args() categoryInput:CategoryInput): Promise<CategoryOutput>{
        return this.restaurantService.findCategoryBySlug(categoryInput)
    }
}