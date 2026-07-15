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

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.price !== undefined && {
          price: data.price,
        }),

        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),

        materials: {
          create: data.materials,
        },

        colors: {
          create: data.colors.map((color) => ({
            color: color.color,

            images: {
              create: color.images,
            },
          })),
        },
      },

      include: {
        materials: true,

        colors: {
          include: {
            images: true,
          },
        },
      },
    });
  }

  findAll() {
    return prisma.blankProduct.findMany({
      include: {
        materials: true,

        colors: {
          include: {
            images: true,
          },
        },
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
        materials: true,

        colors: {
          include: {
            images: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateBlankProductInput) {
    return prisma.$transaction(async (tx) => {
      if (data.materials !== undefined) {
        await tx.blankProductMaterial.deleteMany({
          where: {
            blankProductId: id,
          },
        });
      }

      if (data.colors !== undefined) {
        await tx.blankProductColor.deleteMany({
          where: {
            blankProductId: id,
          },
        });
      }

      return tx.blankProduct.update({
        where: {
          id,
        },

        data: {
          ...(data.name !== undefined && {
            name: data.name,
          }),

          ...(data.description !== undefined && {
            description: data.description,
          }),

          ...(data.price !== undefined && {
            price: data.price,
          }),

          ...(data.isActive !== undefined && {
            isActive: data.isActive,
          }),

          ...(data.materials !== undefined && {
            materials: {
              create: data.materials,
            },
          }),

          ...(data.colors !== undefined && {
            colors: {
              create: data.colors.map((color) => ({
                color: color.color,

                images: {
                  create: color.images,
                },
              })),
            },
          }),
        },

        include: {
          materials: true,

          colors: {
            include: {
              images: true,
            },
          },
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