import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';


@Module({
  imports: [
    GraphQLModule.forRoot({
      //자동으로 gql스키마파일을 생성한다.(true로 하면 메모리로부터 파일을 생성한다.)
      autoSchemaFile: true 
    }),
    RestaurantsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
