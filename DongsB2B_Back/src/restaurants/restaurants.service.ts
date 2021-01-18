import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dtos/createRestaurant.dto";
import { UpdateRestaurantDto } from "./dtos/updateRestaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository
        (Restaurant) private readonly restaurants: Repository<Restaurant>
    ){}

    getAll(): Promise<Restaurant[]>{
        return this.restaurants.find()
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant>{
        const newRestaurant = this.restaurants.create(createRestaurantDto)
        return this.restaurants.save(newRestaurant)
    }

    updateRestaurant({id, data}: UpdateRestaurantDto){
        return this.restaurants.update(id, {...data})
    }
}