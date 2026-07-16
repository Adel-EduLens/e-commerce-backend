import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { globalErrorHandler } from './utils/globalErrorHandler.util.js'
import authRouter from './routes/auth.routes.js'
import prizeRouter from './routes/prize.route.js'
import categoryRouter from './routes/category.route.js'
import productRouter from './routes/product.route.js'
import reviewRouter from './routes/review.route.js'
import wholesaleRouter from './routes/wholesale.route.js'
import userRouter from './routes/user.routes.js'

import uploadRouter from './routes/upload.routes.js'
import path from 'path'
import traderRouter from './routes/trader.auth.routes.js'


import traderProductRouter from './routes/trader.product.routes.js'
import brandRouter from './routes/brand.route.js'
import couponRouter from './routes/coupon.route.js'
import retailProductRouter from './routes/retail.routes.js'
import orderRouter from './routes/order.routes.js'
import cartRouter from './routes/cart.routes.js'
import notifyMeRouter from './routes/notifyMe.routes.js'
import userNotificationRouter from './routes/userNotification.routes.js'
import traderHelpCenterRouter from './routes/trader.helpCenter.routes.js'
import traderDesignRouter from './routes/trader.design.routes.js'
import traderFAQRouter from './routes/trader.faq.routes.js'
import wishlistRouter from './routes/wishlist.routes.js'
import recommendRouter from './routes/recommend.routes.js'
import recentlyViewedRouter from './routes/recentlyViewed.routes.js'
import shopBannerRouter from './routes/shopBanner.route.js'

import addressRouter from './routes/address.routes.js'
import blankProductRouter from './routes/blankProduct.routes.js'
import retailOrderRouter from './routes/retailOrder.route.js'

import collectionRouter from './routes/collection.routes.js'

import retailCategoryRouter from './routes/retailCategory.routes.js'
import retailBrandRouter from './routes/retailBrand.route.js'
import retailReviewRouter from "./routes/retailReview.route.js";

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile, override: true })

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
}

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')))

// App routes

app.use('/api/user', userRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/trader', traderRouter)
app.use('/api/auth', authRouter)
app.use('/api/prizes', prizeRouter)
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/wholesales', wholesaleRouter)
app.use('/api/trader/products', traderProductRouter)
app.use('/api/brands', brandRouter)
app.use('/api/coupons', couponRouter)
app.use('/api/orders', orderRouter)
app.use('/api/cart', cartRouter)
app.use('/api/notify-me', notifyMeRouter)
app.use('/api/notifications', userNotificationRouter)
app.use('/api/trader/help-center', traderHelpCenterRouter)
app.use('/api/trader/designs', traderDesignRouter)
app.use('/api/trader/faqs', traderFAQRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/recommend', recommendRouter)
app.use('/api/recently-viewed', recentlyViewedRouter)
app.use('/api/shop-banners', shopBannerRouter)

app.use('/api/address', addressRouter)

app.use('/api/blank-products', blankProductRouter)
app.use('/api/retail-products', retailProductRouter)
app.use('/api/retail-orders', retailOrderRouter)
app.use('/api/collections', collectionRouter)
app.use("/api/retail-category", retailCategoryRouter)
app.use("/api/retail-brand", retailBrandRouter)
app.use("/api/retail-reviews", retailReviewRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from TypeScript Express with Prisma!')
})

// Global Error Handler
app.use(globalErrorHandler)

// Start server after DB connection
const startServer = async () => {
  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀 Server is running at http://localhost:${env.PORT} in ${env.NODE_ENV} mode`
    )
  })
}

startServer()
