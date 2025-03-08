import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./src/db/connect.js";

dotenv.config({
    path: './.env'
}
);

connectDB().then(
    () => {
        app.listen(process.env.PORT, () => {
            console.log("Server is running on http://localhost:" + process.env.PORT);
        });
    }
)