import prisma from "../utils/prismaClient.js"


class AddressRepository {


  create(userId:number,data:any){
    return prisma.address.create({
      data:{
        ...data,
        userId
      }
    })
  }


  findByUserId(userId:number){
    return prisma.address.findMany({
      where:{
        userId
      },
      orderBy:{
        createdAt:"desc"
      }
    })
  }



  findById(id:string){
    return prisma.address.findUnique({
      where:{
        id
      }
    })
  }



  update(id:string,data:any){
    return prisma.address.update({
      where:{
        id
      },
      data
    })
  }



  delete(id:string){
    return prisma.address.delete({
      where:{
        id
      }
    })
  }

}


export const addressRepository = new AddressRepository()