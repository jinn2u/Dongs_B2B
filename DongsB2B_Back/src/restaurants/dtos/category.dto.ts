// import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
// import { CoreOutput } from "src/common/dtos/output.dto";
// import { Category } from "../entities/category.entity";

// @ArgsType()
// export class CategoryInput {
//     @Field(()=> String)
//     slug: string
// }

// @ObjectType()
// export class CategoryOutput extends CoreOutput{
//     @Field(()=>Category, {nullable: true})
//     category?: Category
// }

import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PaginationInput, PaginationOutput } from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';


@InputType()
export class CategoryInput extends PaginationInput{
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}