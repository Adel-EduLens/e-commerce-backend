import prisma from "../utils/prismaClient.js";
import type {
  CreateBlankProductInput,
  UpdateBlankProductInput,
} from "../types/blankProduct.type.js";
class BlankProductRepository {
  create(data: CreateBlankProductInput) {
    return prisma.blankProduct.create({
      data: {
        name: data.name,
        material: data.material,
        pattern: data.pattern,

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.price !== undefined && {
          price: data.price,
        }),

        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),

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

  async update(id: string, data: UpdateBlankProductInput) {
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
        colors: {
          deleteMany: {},
          create: data.colors,
        },
      }),

      ...(data.images !== undefined && {
        images: {
          deleteMany: {},
          create: data.images,
        },
      }),
    };

    return prisma.blankProduct.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        colors: true,
        images: true,
      },
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
