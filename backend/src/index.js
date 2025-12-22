import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import connectDB from './db/index.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const PORT = process.env.PORT || 5000

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(express.static("public"));
app.use(cookieParser());

import authRoutes from './routes/auth.routes.js'
import workSpaceRoutes from "./routes/workspace.routes.js"

app.use("/api/auth", authRoutes)
app.use("/api/workspace", workSpaceRoutes)

try {
  await connectDB()
} catch (error) {
  console.error("Error connecting to database:", error)
}

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
})