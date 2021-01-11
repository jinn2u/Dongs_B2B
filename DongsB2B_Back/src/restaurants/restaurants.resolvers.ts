import { Query, Resolver } from "@nestjs/graphql";


@Resolver()
export class RestaurantsResolver{
    @Query(returns =>Boolean)
    isPizzaGood():Boolean {
        return true
    }
    //Query데코레이터는 typeFunc를 받는다. 
    // 이는 query가 return하고자 하는 type을 return하는 function이어야 한다.
}