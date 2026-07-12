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
    const updateData = {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.material !== undefined && {
        material: data.material,
      }),

      ...(data.pattern !== undefined && {
        pattern: data.pattern,
      }),

      ...(data.price !== undefined && {
        price: data.price,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),

      ...(data.colors !== undefined && {
        colors: data.colors,
      }),

      ...(data.images !== undefined && {
        images: data.images,
      }),
    };

    return prisma.blankProduct.update({
      where: {
        id,
      },
      data: updateData,
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
