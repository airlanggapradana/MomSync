import express, {Application} from "express";
import cors from "cors";
import {errorHandler} from "./middleware/error-handler";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
})