// Import Packages
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv"; config();
import cors from "cors"

// Import Modules
import Listen from "./Modules/Listen.js";

// Import Config Files
import Config from "./Configs/Config.json" assert { type: "json" };

// Import Handlers
import DatabaseHandler from "./Handlers/Database.js";
import CrashHandler from "./Handlers/CrashHandler.js";

// Import Routes
import User from "./Routes/User.js"

// Port Setting
const Port = Config.Port || 3001 || 3002

// Main Code
const app = express()

// Start Crash Handler
await CrashHandler.Load()

// Connect to Database
await DatabaseHandler.Start()

// Use and Support JSON Responses
app.use(express.json())

// Parse Cookies
app.use(cookieParser())

// Using CORS Headers
app.use(cors())

// Deploy Api Routes
app.use(`/api/${Config.ApiVersion}/user`, User)

// GET Status Of API Started or Not
app.get(`/api/${Config.ApiVersion}/status`, (req, res) => {
    res.send({
        Status: "Running"
    });
})

// Run API on Port
Listen(app, Port)