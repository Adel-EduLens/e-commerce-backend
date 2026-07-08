import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { globalErrorHandler } from './utils/globalErrorHandler.util.js'
import authRouter from './routes/auth.routes.js'
import adminAuthRouter from './routes/admin.auth.routes.js'
import prizeRouter from './routes/prize.route.js'
import FAQRouter from './routes/admin.FAQ.routes.js'
import helpCenterRouter from './routes/admin.helpCenter.routes.js'
import adminUserRouter from './routes/admin.user.routes.js'
import categoryRouter from './routes/category.route.js'
import productRouter from './routes/product.route.js'
import reviewRouter from './routes/review.route.js'
import wholesaleRouter from './routes/wholesale.route.js'
import userRouter from './routes/user.routes.js'

import uploadRouter from './routes/upload.routes.js'
import path from 'path'
import traderRouter from './routes/trader.auth.routes.js'


import brandRouter from './routes/brand.route.js'
import couponRouter from './routes/coupon.route.js'
import retailRouter from './routes/retail.routes.js'
import orderRouter from './routes/order.routes.js'
import cartRouter from './routes/cart.routes.js'

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

app.use('/api/admin/help-center', helpCenterRouter)
app.use('/api/user', userRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/trader', traderRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin/faqs', FAQRouter)
app.use('/api/admin/auth', adminAuthRouter)
app.use('/api/admin/users', adminUserRouter)
app.use('/api/prizes', prizeRouter)
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/wholesales', wholesaleRouter)
app.use('/api/brands', brandRouter)
app.use('/api/coupons', couponRouter)
app.use('/api/retail', retailRouter)
app.use('/api/orders', orderRouter)
app.use('/api/cart', cartRouter)

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
