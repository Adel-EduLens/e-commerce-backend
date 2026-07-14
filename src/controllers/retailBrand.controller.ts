import { Request, Response } from "express";
import { retailBrandService } from "../services/retailBrand.service.js";

export const createRetailBrand = async (req: Request, res: Response) => {
  const { name } = req.body;
  const brand = await retailBrandService.create(name);
  res.status(201).json({
    message: "Brand created",
    data: brand,
  });
};
export const getRetailBrands = async (req: Request, res: Response) => {
  const brands = await retailBrandService.getAll();
  res.json(brands);
};

export const getRetailBrandById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const brand = await retailBrandService.getById(id);

  res.json(brand);
};

export const updateRetailBrand = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const brand = await retailBrandService.update(id, req.body.name);

  res.json({
    message: "Brand updated",
    data: brand,
  });
};

export const deleteRetailBrand = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await retailBrandService.delete(id);

  res.json({
    message: "Brand deleted",
  });
};

export const getMyRetailBrands = async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const brands = await retailBrandService.getTraderBrands(traderId);
  res.json(brands);
};
