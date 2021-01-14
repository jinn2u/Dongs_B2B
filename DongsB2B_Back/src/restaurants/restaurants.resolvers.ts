import { Args, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";


@Resolver()
export class RestaurantsResolver{
    @Query(() => [Restaurant])
    restaurants(@Args('veganOnly')veganOnly:Boolean ):Restaurant[] {
        return []
    }
}