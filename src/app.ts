import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import { envVars } from "./app/config/env";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import { PaymentRoutes } from "./app/modules/payment/payment.route";

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())

app.set("trust proxy", 1);

// ✅ Mount payment routes BEFORE cors — SSLCommerz server callbacks don't need CORS
app.use("/api/v1/payment", PaymentRoutes)

app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            envVars.FRONTEND_URL,
            'http://localhost:3000',
        ];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true
}))

app.use("/api/v1", router) // PaymentRoutes is also here, but /api/v1/payment hits first

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Tour Management System Backend"
    })
})

app.use(globalErrorHandler)
app.use(notFound)

export default app