import express, {Application} from "express";
import cors from "cors";
import {errorHandler} from "./middleware/error-handler";
import motherRouter from "./controllers/mother.controller";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/mothers', motherRouter)

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
})