import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';


@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');


  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')

  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPage = await this.product.count({
      where:{
        available:true
      }
    });

    const lastPage = Math.ceil(totalPage / limit!);


    return {
      data: await this.product.findMany({
        skip: (page! - 1) * limit!,
        take: limit,
        where:{
          available:true
        }
      }),
      meta:{
        page,
        total: totalPage,
        lastPage
      }
    }
  }

  async findOne(id: number) {

    const product = await this.product.findFirst({
      where:{
        id,
        available:true
      }
    })

    if(!product) throw new NotFoundException(`The product wiht #${id} not found`)


    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:_, ...data} = updateProductDto
    await this.findOne(id)

    return this.product.update({
      where:{
        id
      },
      data
    })
  }

  async remove(id: number) {

    await this.findOne(id)
    /* return this.product.delete({
      where:{id}
    }) */

      const product = await this.product.update({
        where:{id},
        data:{
          available:false
        }
      })

      return product
  }
}
