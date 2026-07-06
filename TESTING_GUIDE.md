# Testing Guide - Retail Products & Cart

## Overview
Complete testing guide for retail products and cart functionality.

---

## Prerequisites

1. **Server Running**
   ```bash
   npm start
   ```

2. **Database Setup**
   - MySQL running and configured
   - Prisma migrations applied
   - Sample data seeded (optional)

3. **Authentication Token**
   - Get JWT token from `/api/auth/login`
   - Use in Authorization header

---

## Unit Testing: Retail Products

### Test 1: Get All Retail Products
```bash
GET /api/retail/products?page=1&limit=10

Expected Response: 200 OK
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "total": N,
      "page": 1,
      "limit": 10,
      "pages": M
    }
  }
}
```

✅ **Pass Criteria:**
- Returns array of products
- Pagination info included
- Each product has category, images, colors, sizes

---

### Test 2: Get Retail Product by ID (Success)
```bash
GET /api/retail/products/1

Expected Response: 200 OK
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Black Hoodie",
    "slug": "black-hoodie",
    "price": 850,
    "discountPrice": 699,
    "stock": 10,
    "sku": "BH-001",
    "isActive": true,
    "category": {...},
    "images": [{...}],
    "colors": [{...}],
    "sizes": [{...}]
  }
}
```

✅ **Pass Criteria:**
- Product returned with all fields
- Related data (category, images, colors, sizes) included
- Price and discount price visible

---

### Test 3: Get Retail Product by ID (Not Found)
```bash
GET /api/retail/products/99999

Expected Response: 404 Not Found
{
  "success": false,
  "message": "Retail product not found or inactive"
}
```

✅ **Pass Criteria:**
- Returns 404 status
- Clear error message

---

### Test 4: Get Retail Product by ID (Inactive)
```bash
// Create or update product with isActive: false first

GET /api/retail/products/1

Expected Response: 404 Not Found
{
  "success": false,
  "message": "Retail product not found or inactive"
}
```

✅ **Pass Criteria:**
- Inactive products not returned (404)

---

### Test 5: Get Retail Product by Slug (Success)
```bash
GET /api/retail/products/slug/black-hoodie

Expected Response: 200 OK
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Black Hoodie",
    "slug": "black-hoodie",
    ...
  }
}
```

✅ **Pass Criteria:**
- Same as Test 2 but using slug

---

### Test 6: Get Retail Product by Slug (Not Found)
```bash
GET /api/retail/products/slug/non-existent-product

Expected Response: 404 Not Found
{
  "success": false,
  "message": "Retail product not found or inactive"
}
```

✅ **Pass Criteria:**
- Returns 404 for invalid slug

---

## Unit Testing: Cart

### Test 7: Get Empty Cart (New User)
```bash
GET /api/cart
Headers: Authorization: Bearer {token}

Expected Response: 200 OK
{
  "success": true,
  "cart": {
    "id": 1,
    "userId": 1,
    "items": [],
    "subtotal": 0
  }
}
```

✅ **Pass Criteria:**
- Cart created automatically
- Empty items array
- Subtotal is 0

---

### Test 8: Add Regular Product to Cart
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "productId": "prod-123",
  "quantity": 2
}

Expected Response: 201 Created
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "items": [
      {
        "id": 1,
        "type": "PRODUCT",
        "productId": "prod-123",
        "retailProductId": null,
        "quantity": 2,
        "unitPrice": 500,
        "totalPrice": 1000,
        "product": {...},
        "retailProduct": null,
        "retailColor": null,
        "retailSize": null
      }
    ],
    "subtotal": 1000
  }
}
```

✅ **Pass Criteria:**
- Status code 201
- Item added to cart
- Type is "PRODUCT"
- Subtotal calculated correctly

---

### Test 9: Add Retail Product to Cart
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 1,
  "quantity": 1,
  "retailColorId": 1,
  "retailSizeId": 2
}

Expected Response: 201 Created
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "items": [
      ...previous items...,
      {
        "id": 2,
        "type": "RETAIL_PRODUCT",
        "productId": null,
        "retailProductId": 1,
        "quantity": 1,
        "unitPrice": 699,  // discountPrice
        "totalPrice": 699,
        "product": null,
        "retailProduct": {
          "id": 1,
          "name": "Black Hoodie",
          "price": 850,
          "discountPrice": 699,
          ...
        },
        "retailColor": {"id": 1, "name": "Black", ...},
        "retailSize": {"id": 2, "name": "L", ...}
      }
    ],
    "subtotal": 1699
  }
}
```

✅ **Pass Criteria:**
- Status code 201
- Type is "RETAIL_PRODUCT"
- Uses discountPrice for unitPrice
- Color and size info included
- Subtotal updated correctly

---

### Test 10: Add Same Retail Product Again (Duplicate)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 1,
  "quantity": 2,
  "retailColorId": 1,
  "retailSizeId": 2
}

Expected Response: 201 Created
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "items": [
      ...,
      {
        "id": 2,
        "type": "RETAIL_PRODUCT",
        "retailProductId": 1,
        "quantity": 3,  // Updated: 1 + 2 = 3
        "totalPrice": 2097,  // 699 * 3
        ...
      }
    ],
    "subtotal": 3097  // Updated subtotal
  }
}
```

✅ **Pass Criteria:**
- Same item not duplicated
- Quantity updated instead
- Subtotal recalculated

---

### Test 11: Update Item Quantity
```bash
PATCH /api/cart/items/2
Headers: Authorization: Bearer {token}
Body:
{
  "quantity": 5
}

Expected Response: 200 OK
{
  "success": true,
  "message": "Cart item updated successfully",
  "cart": {
    "items": [
      {
        "id": 2,
        "quantity": 5,
        "totalPrice": 3495,  // 699 * 5
        ...
      }
    ],
    "subtotal": 4495
  }
}
```

✅ **Pass Criteria:**
- Quantity updated
- Subtotal recalculated
- Item ID correct

---

### Test 12: Remove Item from Cart
```bash
DELETE /api/cart/items/2
Headers: Authorization: Bearer {token}

Expected Response: 200 OK
{
  "success": true,
  "message": "Cart item removed successfully",
  "cart": {
    "items": [
      // Item 2 removed
    ],
    "subtotal": 1000  // Updated
  }
}
```

✅ **Pass Criteria:**
- Item removed
- Subtotal updated
- Other items remain

---

### Test 13: Clear Entire Cart
```bash
DELETE /api/cart/clear
Headers: Authorization: Bearer {token}

Expected Response: 200 OK
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

✅ **Pass Criteria:**
- All items removed
- Subtotal is 0
- Cart still exists

---

## Error Testing

### Test 14: Both Product IDs Provided (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "productId": "prod-123",
  "retailProductId": 1,
  "quantity": 1
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Choose either productId or retailProductId, not both"
}
```

✅ **Pass Criteria:**
- Returns 400 status
- Clear error message
- Cart unchanged

---

### Test 15: Neither Product ID Provided (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "quantity": 1
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Either productId or retailProductId must be provided"
}
```

✅ **Pass Criteria:**
- Returns 400 status
- Clear error message

---

### Test 16: Invalid Quantity (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 1,
  "quantity": 0
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Quantity must be at least 1"
}
```

✅ **Pass Criteria:**
- Returns 400 status
- Rejects quantity < 1

---

### Test 17: Non-Existent Product (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 99999,
  "quantity": 1
}

Expected Response: 404 Not Found
{
  "success": false,
  "message": "Retail product not found or inactive"
}
```

✅ **Pass Criteria:**
- Returns 404 status
- Clear error message

---

### Test 18: Quantity Exceeds Stock (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 1,  // stock = 10
  "quantity": 15  // exceeds stock
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Requested quantity exceeds available stock"
}
```

✅ **Pass Criteria:**
- Returns 400 status
- Stock validation enforced

---

### Test 19: Unauthenticated Request (Error)
```bash
GET /api/cart
// No Authorization header

Expected Response: 401 Unauthorized
{
  "success": false,
  "message": "User not authenticated"
}
```

✅ **Pass Criteria:**
- Returns 401 status
- Requires authentication

---

### Test 20: Invalid Color for Product (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 1,
  "quantity": 1,
  "retailColorId": 999  // Invalid color ID
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Retail color is invalid for this product"
}
```

✅ **Pass Criteria:**
- Color validation enforced
- Returns appropriate error

---

### Test 21: Invalid Size for Product (Error)
```bash
POST /api/cart/items
Headers: Authorization: Bearer {token}
Body:
{
  "retailProductId": 1,
  "quantity": 1,
  "retailSizeId": 999  // Invalid size ID
}

Expected Response: 400 Bad Request
{
  "success": false,
  "message": "Retail size is invalid for this product"
}
```

✅ **Pass Criteria:**
- Size validation enforced
- Returns appropriate error

---

## Integration Testing

### Test 22: Complete User Journey
1. Add regular product
2. Add retail product with variants
3. Update quantities
4. View cart
5. Remove specific item
6. Clear cart

```javascript
// Sequential workflow
GET /api/cart                           // 200, empty
POST /api/cart/items (product)          // 201, 1 item
POST /api/cart/items (retail)           // 201, 2 items
PATCH /api/cart/items/1                 // 200, updated
GET /api/cart                           // 200, 2 items
DELETE /api/cart/items/1                // 200, 1 item
DELETE /api/cart/clear                  // 200, empty
```

✅ **Pass Criteria:**
- All responses correct
- Data consistency maintained
- Subtotal accurate at each step

---

## Performance Testing

### Test 23: Load Testing Cart Endpoints
- Add 100 items to cart
- Update 50 items
- Get full cart (should complete < 500ms)

✅ **Pass Criteria:**
- Responds within acceptable time
- No timeout errors
- Data integrity maintained

---

## Response Validation Checklist

For each successful response, verify:

```
☐ success: true
☐ Appropriate status code (200, 201)
☐ message: Clear string
☐ data structure: Matches specification
☐ All required fields present
☐ No extra unexpected fields
☐ Types correct (string, number, object, array)
☐ Prices calculated correctly
☐ Subtotal accurate
☐ Item count accurate
☐ Relationships populated (product, retailProduct, etc.)
```

For each error response, verify:

```
☐ success: false
☐ Appropriate error status code (400, 401, 404)
☐ message: Clear and actionable
☐ No cart modification occurred
☐ User informed of issue
☐ Consistent error format
```

---

## Automation Script Example

### Using Node.js with axios

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const token = 'your_jwt_token';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${token}` }
});

async function testCart() {
  try {
    // Get cart
    let cart = await api.get('/api/cart');
    console.log('Cart:', cart.data.cart);

    // Add retail product
    cart = await api.post('/api/cart/items', {
      retailProductId: 1,
      quantity: 2,
      retailColorId: 1,
      retailSizeId: 1
    });
    console.log('Added to cart:', cart.data.cart);

    // Update quantity
    const itemId = cart.data.cart.items[0].id;
    cart = await api.patch(`/api/cart/items/${itemId}`, {
      quantity: 5
    });
    console.log('Updated cart:', cart.data.cart);

    // Clear cart
    cart = await api.delete('/api/cart/clear');
    console.log('Cleared cart:', cart.data.cart);

  } catch (error) {
    console.error('Error:', error.response?.data);
  }
}

testCart();
```

---

## Summary

- **21 Test Cases** covering all functionality
- **Error scenarios** thoroughly tested
- **Integration workflows** validated
- **Performance** checked
- **Data integrity** verified

All tests should pass for production deployment.

