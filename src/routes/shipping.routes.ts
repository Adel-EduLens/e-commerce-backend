import { Router } from "express";
import {
  createCountry,
  getCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
} from "../controllers/shipping.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createShippingCountrySchema,
  updateShippingCountrySchema,
  createShippingCitySchema,
  updateShippingCitySchema,
} from "../schemas/shipping.schema.js";

const router = Router();

// ==========================================
// SHIPPING COUNTRY ROUTES
// ==========================================

// GET /api/shipping/countries
router.get("/countries", getCountries);

// POST /api/shipping/countries
router.post(
  "/countries",
  requireAuth,
  requireRole("trader"),
  validateRequest(createShippingCountrySchema),
  createCountry
);

// GET /api/shipping/countries/:id
router.get("/countries/:id", getCountryById);

// PATCH /api/shipping/countries/:id
router.patch(
  "/countries/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateShippingCountrySchema),
  updateCountry
);

// DELETE /api/shipping/countries/:id
router.delete(
  "/countries/:id",
  requireAuth,
  requireRole("trader"),
  deleteCountry
);

// ==========================================
// SHIPPING CITY ROUTES
// ==========================================

// GET /api/shipping/cities (optional query ?countryId=...)
router.get("/cities", getCities);

// POST /api/shipping/cities
router.post(
  "/cities",
  requireAuth,
  requireRole("trader"),
  validateRequest(createShippingCitySchema),
  createCity
);

// GET /api/shipping/cities/:id
router.get("/cities/:id", getCityById);

// PATCH /api/shipping/cities/:id
router.patch(
  "/cities/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateShippingCitySchema),
  updateCity
);

// DELETE /api/shipping/cities/:id
router.delete(
  "/cities/:id",
  requireAuth,
  requireRole("trader"),
  deleteCity
);

export default router;
