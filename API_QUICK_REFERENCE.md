# Quick Reference - API Endpoints

## Retail Products

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/retail/products` | ❌ | List all products (paginated) |
| GET | `/api/retail/products/:id` | ❌ | Get product by ID |
| GET | `/api/retail/products/slug/:slug` | ❌ | Get product by slug |
| POST | `/api/retail/products` | ✅ | Create product (admin) |
| PUT | `/api/retail/products/:id` | ✅ | Update product (admin) |
| DELETE | `/api/retail/products/:id` | ✅ | Delete product (admin) |

### Example: Get Product by ID
```bash
GET /api/retail/products/1

Response: 200 OK
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Black Hoodie",
    "slug": "black-hoodie",
    "price": 850,
    "discountPrice": 699,
    "stock": 10,
    "category": {...},
    "images": [...],
    "colors": [...],
    "sizes": [...]
  }
}
```

---

## Cart

### Get Cart
```bash
GET /api/cart
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "cart": {
    "id": 1,
    "userId": 1,
    "items": [...],
    "subtotal": 1699
  }
}
```

### Add Item to Cart
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body: {
  "retailProductId": 1,
  "quantity": 2,
  "retailColorId": 1,        // optional
  "retailSizeId": 2          // optional
}

Response: 201 Created
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {...}
}
```

### Add Regular Product
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body: {
  "productId": "prod-123",
  "quantity": 2
}

Response: 201 Created
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {...}
}
```

### Add Retail Product (Dedicated Endpoint)
```bash
POST /api/cart/retail-items
Headers: Authorization: Bearer {token}
Body: {
  "retailProductId": 1,
  "quantity": 1,
  "retailColorId": 1,
  "retailSizeId": 1
}

Response: 201 Created
{
  "success": true,
  "message": "Retail item added to cart successfully",
  "cart": {...}
}
```

### Update Item Quantity
```bash
PATCH /api/cart/items/:itemId
Headers: Authorization: Bearer {token}
Body: {
  "quantity": 5
}

Response: 200 OK
{
  "success": true,
  "message": "Cart item updated successfully",
  "cart": {...}
}
```

### Remove Item
```bash
DELETE /api/cart/items/:itemId
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Cart item removed successfully",
  "cart": {...}
}
```

### Clear Cart
```bash
DELETE /api/cart/clear
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "items": [],
    "subtotal": 0
  }
}
```

---

## Cart Item Response Format

```json
{
  "id": 10,
  "type": "RETAIL_PRODUCT",           // Type identifier
  "productId": null,                  // null for retail
  "retailProductId": 1,               // ID for retail
  "quantity": 2,
  "unitPrice": 699,                   // discountPrice if available, else price
  "totalPrice": 1398,                 // unitPrice * quantity
  "product": null,
  "retailProduct": {                  // Full product object
    "id": 1,
    "name": "Black Hoodie",
    "price": 850,
    "discountPrice": 699,
    "stock": 10,
    "images": [...],
    "colors": [...]
  },
  "retailColor": {                    // Color info if selected
    "id": 1,
    "name": "Black",
    "hexCode": "#000000"
  },
  "retailSize": {                     // Size info if selected
    "id": 1,
    "name": "M",
    "stock": 5
  }
}
```

---

## Validation Requirements

### Adding to Cart
- ✅ `quantity` required, must be >= 1
- ✅ Either `productId` OR `retailProductId` (XOR)
- ✅ For retail: color and size are optional but validated if provided
- ✅ User must be authenticated

### Error Codes
| Code | Message |
|------|---------|
| 400 | Both productId and retailProductId provided |
| 400 | Neither productId nor retailProductId provided |
| 400 | Quantity must be at least 1 |
| 400 | Requested quantity exceeds available stock |
| 401 | User not authenticated |
| 404 | Product not found |
| 404 | Product is inactive |
| 404 | User not found |
| 404 | Size/Color not found |

---

## Common Patterns

### Initialize Cart for User
```bash
# First request automatically creates cart if it doesn't exist
GET /api/cart
```

### Add Multiple Items
```bash
# First item
POST /api/cart/items
Body: {"retailProductId": 1, "quantity": 2}

# Second item
POST /api/cart/items
Body: {"retailProductId": 2, "quantity": 1}

# Get full cart
GET /api/cart
```

### Replace Item Quantity
```bash
# Get current cart to find item ID
GET /api/cart

# Update quantity (replaces, doesn't add)
PATCH /api/cart/items/11
Body: {"quantity": 5}
```

### Remove All of Specific Product
```bash
DELETE /api/cart/items/11
```

### Start Fresh
```bash
DELETE /api/cart/clear
```

---

## Testing Tools

### Postman
- Import `Postman_Collection.json`
- Set variables: `base_url`, `auth_token`
- Run pre-built requests

### cURL
```bash
# Get product
curl -X GET "http://localhost:3000/api/retail/products/1"

# Add to cart
curl -X POST "http://localhost:3000/api/cart/items" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"retailProductId": 1, "quantity": 2}'
```

### Thunder Client / REST Client
Copy-paste any endpoint from this guide

---

## Key Points

1. **One Cart Per User** - No need to create separate carts
2. **Type Identification** - Use `type` field to identify product source
3. **Mixed Items** - Cart can contain both regular and retail products
4. **Stock Validation** - Enforced automatically
5. **Variant Support** - Retail products support color/size variants
6. **Unified Response** - Consistent format for all cart operations
7. **Price Calculation** - Uses discount if available for retail

