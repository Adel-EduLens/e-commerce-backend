export interface CreateShippingCountryInput {
  name: string;
  code?: string;
}

export interface UpdateShippingCountryInput {
  name?: string;
  code?: string;
}

export interface CreateShippingCityInput {
  name: string;
  shippingCost?: number;
  countryId: string;
}

export interface UpdateShippingCityInput {
  name?: string;
  shippingCost?: number;
  countryId?: string;
}
