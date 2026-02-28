import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({
    limit: "16kb"
}))
app.use(urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))  // user se agr koi file lekr agr mujhe store krna h apne server pe toh vo pulic file me store hoga
app.use(cookieParser())


// import route 

import { router } from "./routes/user.routes.js";

app.use("/user", router)

export { app }