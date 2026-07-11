import prisma from "../utils/prismaClient.js";

class BlankProductRepository {
  create(data: any) {
    return prisma.blankProduct.create({
      data: {
        name: data.name,

        description: data.description,

        material: data.material,

        pattern: data.pattern,

        price: data.price,

        isActive: data.isActive,

        colors: {
          create: data.colors,
        },

        images: {
          create: data.images,
        },
      },

      include: {
        colors: true,

        images: true,
      },
    });
  }

  findAll() {
    return prisma.blankProduct.findMany({
      include: {
        colors: true,

        images: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.blankProduct.findUnique({
      where: {
        id,
      },

      include: {
        colors: true,

        images: true,
      },
    });
  }

  async update(id: string, data: any) {
  return prisma.$transaction(async (tx) => {

    if (data.colors) {
      await tx.blankProductColor.deleteMany({
        where: {
          blankProductId: id,
        },
      });
    }


    if (data.images) {
      await tx.blankProductImage.deleteMany({
        where: {
          blankProductId: id,
        },
      });
    }


    const updateData: any = {
      name: data.name,
      description: data.description,
      material: data.material,
      pattern: data.pattern,
      price: data.price,
      isActive: data.isActive,
    };


    if (data.colors) {
      updateData.colors = {
        create: data.colors,
      };
    }


    if (data.images) {
      updateData.images = {
        create: data.images,
      };
    }


    return tx.blankProduct.update({

      where: {
        id,
      },

      data: updateData,

      include: {
        colors: true,
        images: true,
      },

    });

  });
}

  delete(id: string) {
    return prisma.blankProduct.delete({
      where: {
        id,
      },
    });
  }
}

export const blankProductRepository = new BlankProductRepository();
