import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolvers';

@Module({
    providers:[RestaurantsResolver]
})
export class RestaurantsModule {}
