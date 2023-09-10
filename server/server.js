import express from "express";
import cors from "cors";
import "./loadEnvironment.js";
import paypal from "./routes/paypal.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/paypal", paypal);

// start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
