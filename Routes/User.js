// Import Packages
import express from "express";
import csurf from "csurf";
import Throttle from "express-throttle/lib/throttle.js";

// Import Package Classes
const Router = express.Router();

// Middleware
const CSRFProtection = csurf({ cookie: true })

// Import Config File
import Config from "../Configs/Config.json" assert { type: "json" }

// Import Classes
import Database from "../Classes/Database/Database.js";
import PasswordProtection from "../Classes/PasswordProtection/PasswordProtection.js";
import Notification from "../Modules/Notification.js";

const Data = new Database();

// GET Website texts from database and return it to Front-End side
Router.post('/create', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {ApiKey, FirstName, LastName, PhoneNumber, Password} = req.body

    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, ApiKey)

    if (CompareApiKey == true) {
        await Data.CreateUser(Config.Key, {
            FirstName: FirstName,
            LastName: LastName,
            PhoneNumber: PhoneNumber,
            Password: Password
        }).then(async message => {
            await console.log(message)
            switch (message.Status.Code) {
                case 201:
                    res.status(201).json({
                        Data: `Account successfully created, Phone number: ${PhoneNumber}.`,
                        UserData: message.UserData
                    })
                break;

                case 500:
                    res.status(500).json({
                        Data: `An Error happened when creating ${PhoneNumber} Account.`
                    })
                break;

                case 400:
                    res.status(400).json({
                        Data: `Account with Number -> ${PhoneNumber}, has been registred before.`
                    })
                break;

                case 503:
                    res.status(503).json({
                        Data: `An Error happened when verifying API Key.`
                    })
                break;

                default:break;
            }
        })
    }
})

export default Router