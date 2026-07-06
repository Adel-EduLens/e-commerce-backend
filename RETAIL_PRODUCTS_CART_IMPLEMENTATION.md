# Retail Products Cart Implementation - Documentation

## Overview
This document outlines the complete implementation of Retail Product Details and Add to Cart functionality for the e-commerce backend. The system allows users to:
1. View retail product details with full information (category, images, colors, sizes)
2. Add retail products to a shared cart alongside regular products
3. Manage cart items with unified responses

---

## Architecture

### Database Schema (Prisma)
The `CartItem` model supports both regular and retail products:

```prisma
model CartItem {
  id              Int                 @id @default(autoincrement())
  cartId          Int
  cart            Cart                @relation(fields: [cartId], references: [id], onDelete: Cascade)
  
  productId       String?             // Regular product ID
  product         Product?            @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  retailProductId Int?                // Retail product ID
  retailProduct   RetailProduct?      @relation(fields: [retailProductId], references: [id], onDelete: Cascade)
  
  retailColorId   Int?
  retailColor     RetailProductColor? @relation(fields: [retailColorId], references: [id], onDelete: SetNull)
  
  retailSizeId    Int?
  retailSize      RetailProductSize?  @relation(fields: [retailSizeId], references: [id], onDelete: SetNull)
  
  quantity        Int                 @default(1)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}
```

**Important Rules:**
- Either `productId` OR `retailProductId` must be set, never both
- Both cannot be null
- `retailColorId` and `retailSizeId` are optional and only for retail products

---

## API Endpoints

### 1. Retail Product Details

#### GET /api/retail/products/:id
Fetch retail product by ID with full details.

**Response (200 OK):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Black Hoodie",
    "slug": "black-hoodie",
    "description": "Premium black hoodie with comfortable fit",
    "shortDescription": "Premium hoodie",
    "price": 850,
    "discountPrice": 699,
    "stock": 10,
    "sku": "BH-001",
    "brand": "Nasu",
    "isFeatured": true,
    "isActive": true,
    "category": {
      "id": 1,
      "name": "Hoodies",
      "slug": "hoodies"
    },
    "images": [
      {
        "id": 1,
        "url": "https://example.com/image1.jpg",
        "alt": "Black hoodie front view",
        "isMain": true
      }
    ],
    "colors": [
      {
        "id": 1,
        "name": "Black",
        "hexCode": "#000000"
      }
    ],
    "sizes": [
      {
        "id": 1,
        "name": "S",
        "stock": 5
      },
      {
        "id": 2,
        "name": "M",
        "stock": 3
      }
    ]
  }
}
```

**Error Responses:**
- 404 Not Found: Product not found or inactive

---

#### GET /api/retail/products/slug/:slug
Fetch retail product by slug with full details.

**Response (200 OK):** Same as above

---

### 2. Cart Endpoints

#### GET /api/cart
Fetch user's cart with all items.

**Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "id": 1,
    "userId": 1,
    "items": [
      {
        "id": 10,
        "type": "PRODUCT",
        "productId": "prod-123",
        "retailProductId": null,
        "quantity": 2,
        "unitPrice": 500,
        "totalPrice": 1000,
        "product": {
          "id": "prod-123",
          "name": "T-Shirt",
          "price": 500
        },
        "retailProduct": null,
        "retailColor": null,
        "retailSize": null
      },
      {
        "id": 11,
        "type": "RETAIL_PRODUCT",
        "productId": null,
        "retailProductId": 1,
        "quantity": 1,
        "unitPrice": 699,
        "totalPrice": 699,
        "product": null,
        "retailProduct": {
          "id": 1,
          "name": "Black Hoodie",
          "price": 850,
          "discountPrice": 699,
          "stock": 10,
          "images": []
        },
        "retailColor": {
          "id": 1,
          "name": "Black"
        },
        "retailSize": {
          "id": 1,
          "name": "M"
        }
      }
    ],
    "subtotal": 1699
  }
}
```

---

#### POST /api/cart/items
Add a product (regular or retail) to cart.

**Request Body:**
```json
{
  "productId": "prod-123",
  "quantity": 2
}
```

OR

```json
{
  "retailProductId": 1,
  "quantity": 1,
  "retailColorId": 1,
  "retailSizeId": 2
}
```

**Response (201 Created):** Same as GET /api/cart

**Error Responses:**
- 400 Bad Request: Invalid quantity, or both/neither product types provided
- 401 Unauthorized: User not authenticated
- 404 Not Found: Product not found or user not found
- 400 Quantity exceeds stock: Requested quantity exceeds available stock

---

#### POST /api/cart/retail-items
Add a retail product to cart (dedicated endpoint).

**Request Body:**
```json
{
  "retailProductId": 1,
  "quantity": 1,
  "retailColorId": 1,
  "retailSizeId": 2
}
```

**Response (201 Created):** Same as GET /api/cart

**Validation:** Requires `retailProductId` to be present

---

#### PATCH /api/cart/items/:itemId
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):** Updated cart

---

#### DELETE /api/cart/items/:itemId
Remove item from cart.

**Response (200 OK):** Updated cart

---

#### DELETE /api/cart/clear
Clear entire cart.

**Response (200 OK):** Empty cart

---

## Service Logic (CartService)

### Key Methods

#### addItem(userId, data)
Adds a product to the user's cart with comprehensive validation.

**Validation Steps:**
1. ✓ Verify user exists
2. ✓ Validate quantity >= 1
3. ✓ Ensure exactly one of productId or retailProductId is provided (not both, not neither)
4. ✓ Get or create user's cart
5. ✓ For regular products: Verify product exists
6. ✓ For retail products:
   - Verify product exists and isActive = true
   - Verify stock > 0
   - If size specified: Verify size exists, belongs to product, and has sufficient stock
   - If color specified: Verify color exists and belongs to product
7. ✓ Check if item already exists in cart (by cart, productId/retailProductId, color, size)
8. ✓ If exists: Update quantity (ensuring total doesn't exceed stock)
9. ✓ If not exists: Create new CartItem
10. ✓ Return normalized cart

**Normalization:**
- Combines regular and retail products in single response
- Sets `type` field: 'PRODUCT' or 'RETAIL_PRODUCT'
- Calculates `unitPrice` and `totalPrice` (uses discountPrice for retail if available)
- Includes `subtotal` for entire cart

---

## Code Structure

### Files Modified/Created

#### 1. **src/services/cart.service.ts**
- Enhanced validation logic for addItem method
- Checks that productId and retailProductId are mutually exclusive
- Validates retail product-specific constraints

#### 2. **src/controllers/cart.controller.ts**
- Updated response status codes (201 for creation, 200 for updates)
- Enhanced error messages
- Added validation for retailProductId in addRetailCartItem

#### 3. **src/routes/cart.routes.ts**
- GET /cart - Get user's cart
- POST /items - Add item to cart
- POST /retail-items - Add retail item to cart
- PATCH /items/:itemId - Update item quantity
- DELETE /items/:itemId - Remove item
- DELETE /clear - Clear cart

#### 4. **src/routes/retail.routes.ts** (Already Exists)
- GET /products - List all products
- GET /products/:id - Get product by ID
- GET /products/slug/:slug - Get product by slug
- POST /products - Create product (admin)
- PUT /products/:id - Update product (admin)
- DELETE /products/:id - Delete product (admin)

#### 5. **src/schemas/cart.schema.ts** (Already Exists)
```javascript
addCartItemSchema = Joi.object({
  userId: Joi.number().optional(),
  productId: Joi.string().optional().allow(null),
  retailProductId: Joi.number().optional().allow(null),
  retailColorId: Joi.number().optional().allow(null),
  retailSizeId: Joi.number().optional().allow(null),
  quantity: Joi.number().integer().min(1).required()
}).oxor('productId', 'retailProductId')
```

---

## Implementation Details

### Cart Normalization
The `normalizeCart()` method in CartService ensures consistent response format:

```typescript
private normalizeCart(cart: any) {
  const items = (cart?.items || []).map((item: any) => {
    const unitPrice = item.retailProduct
      ? (item.retailProduct.discountPrice ?? item.retailProduct.price)
      : item.product?.price ?? 0

    return {
      id: item.id,
      type: item.retailProductId ? 'RETAIL_PRODUCT' : 'PRODUCT',
      productId: item.productId,
      retailProductId: item.retailProductId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
      product: item.product ?? null,
      retailProduct: item.retailProduct ?? null,
      retailColor: item.retailColor ?? null,
      retailSize: item.retailSize ?? null
    }
  })

  const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)

  return {
    id: cart?.id,
    userId: cart?.userId,
    items,
    subtotal
  }
}
```

---

## Testing Checklist

- [ ] GET /api/retail/products/1 - Returns product with all details
- [ ] GET /api/retail/products/slug/black-hoodie - Returns product by slug
- [ ] GET /api/cart - Returns empty cart for new user
- [ ] POST /api/cart/items (with productId) - Adds regular product
- [ ] POST /api/cart/items (with retailProductId) - Adds retail product
- [ ] POST /api/cart/items (both IDs) - Returns error
- [ ] POST /api/cart/items (neither ID) - Returns error
- [ ] POST /api/cart/items (duplicate) - Updates quantity
- [ ] PATCH /api/cart/items/1 - Updates quantity
- [ ] DELETE /api/cart/items/1 - Removes item
- [ ] DELETE /api/cart/clear - Clears all items
- [ ] Verify stock validation
- [ ] Verify color/size validation
- [ ] Verify response format matches specification

---

## Deployment Commands

```bash
# Format Prisma schema
npx prisma format

# Generate Prisma client
npx prisma generate

# Check TypeScript
npx tsc --noEmit

# Build project
npm run build

# Start server
npm start
```

---

## Environment Setup

Ensure `.env` or `.env.production` contains:
```
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce"
NODE_ENV="development"
PORT=3000
```

---

## Notes

1. **Backward Compatibility**: The implementation maintains full backward compatibility with existing regular products
2. **Single Cart**: Users have one cart that contains both regular and retail products
3. **Unified Response**: All cart operations return normalized responses with type field
4. **Validation**: Comprehensive validation at service layer ensures data integrity
5. **Error Handling**: Clear error messages for debugging
6. **Performance**: Uses findFirst instead of unique for null-safe queries with MySQL

---

## Future Enhancements

- Add cart item variants tracking
- Implement cart persistence across sessions
- Add bulk operations support
- Implement cart expiration
- Add promotional code support
- Implement cart analytics

