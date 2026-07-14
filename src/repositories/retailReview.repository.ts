import prisma from "../utils/prismaClient.js";
import { Prisma } from "@prisma/client";
import {
  RetailReviewCreateData,
  RetailReviewUpdateData,
} from "../types/retailReview.types.js";


type Transaction = Prisma.TransactionClient;


export const retailReviewRepository = {

  async create(
    data: RetailReviewCreateData,
    tx: Transaction = prisma
  ) {
    return tx.retailProductReview.create({
      data,
      include:{
        user:{
          select:{
            id:true,
            name:true
          }
        }
      }
    });
  },


  async findAllByProduct(retailProductId:number){

    return prisma.retailProductReview.findMany({

      where:{
        retailProductId
      },

      include:{
        user:{
          select:{
            id:true,
            name:true
          }
        }
      },

      orderBy:{
        createdAt:"desc"
      }
    });

  },


  async findById(id:string){

    return prisma.retailProductReview.findUnique({
      where:{
        id
      }
    });

  },


  async findByUserAndProduct(
    userId:number,
    retailProductId:number
  ){

    return prisma.retailProductReview.findUnique({

      where:{
        userId_retailProductId:{
          userId,
          retailProductId
        }
      }

    });

  },


  async update(
    id:string,
    data:RetailReviewUpdateData,
    tx:Transaction = prisma
  ){

    return tx.retailProductReview.update({

      where:{
        id
      },

      data,

      include:{
        user:{
          select:{
            id:true,
            name:true
          }
        }
      }

    });

  },


  async delete(
    id:string,
    tx:Transaction = prisma
  ){

    return tx.retailProductReview.delete({
      where:{
        id
      }
    });

  },


  async getAverageRating(
    retailProductId:number,
    tx:Transaction = prisma
  ){

    const result = await tx.retailProductReview.aggregate({

      where:{
        retailProductId
      },

      _avg:{
        rating:true
      }

    });


    return result._avg.rating ?? 0;

  }

};