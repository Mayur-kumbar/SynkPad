import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

dotenv.config()
const PORT = process.env.PORT || 5000

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(express.static("public"));
app.use(cookieParser());

import authRoutes from './routes/auth.routes.js'

app.use("/api/auth", authRoutes)

try {
  await connectDB()
} catch (error) {
  console.error("Error connecting to database:", error)
}


app.get('/', (req, res) => {
  res.send('Hello, World!')
})


app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
})