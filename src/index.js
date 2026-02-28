import { app } from "./app.js";
import connectionDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})


connectionDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is listening at PORT ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection Failed ", error);
})
