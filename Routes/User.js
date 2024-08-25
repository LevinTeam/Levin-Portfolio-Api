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

// POST user data and create user account and return user saved info to Front-end side
Router.post('/create', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {ApiKey, FirstName, LastName, PhoneNumber, Password} = req.body

    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, ApiKey)

    if (CompareApiKey == true) {
        if ((typeof FirstName && typeof LastName && typeof PhoneNumber && typeof Password) == "string") {
            if (FirstName.length >= 3 && FirstName.length <= 20) {
                if (LastName.length >= 3 && LastName.length <= 20) {
                    if (PhoneNumber.length >= 10 && PhoneNumber.length <= 13) {
                        if (Password.length >= 5 && Password.length <= 100) {
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
                        } else {
                            res.status(400).json({
                                Data: `Password Length should be between 5 and 100 characters`,
                            })
                        }
                    } else {
                        res.status(400).json({
                            Data: `Phone number Length should be between 10 and 13 characters`,
                        })
                    }
                } else {
                    res.status(400).json({
                        Data: `Lastname Length should be between 3 and 20 characters`,
                    })
                }
            } else {
                res.status(400).json({
                    Data: `Firstname Length should be between 3 and 20 characters`,
                })
            }
        } else {
            res.status(400).json({
                Data: `Type of parameters is incorrect`,
            })
        }
    }
})

// POST user phone number and password and logging into user account and return user saved info to Front-end side
Router.post('/login', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {ApiKey, PhoneNumber, Password} = req.body

    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, ApiKey)

    if (CompareApiKey == true) {
        if ((typeof PhoneNumber && typeof Password) == "string") {
            if (PhoneNumber.length >= 10 && PhoneNumber.length <= 13) {
                if (Password.length >= 5 && Password.length <= 100) {
                    await Data.LoginUser(Config.Key, {
                        PhoneNumber: PhoneNumber,
                        Password: Password
                    }).then(async message => {
                        await console.log(message)
                        switch (message.Status.Code) {
                            case 200:
                                res.status(200).json({
                                    Data: `Login Successfull, Phone number: ${PhoneNumber}.`,
                                    UserData: message.DatabaseOptionalData
                                })
                            break;

                            case 404:
                                res.status(404).json({
                                    Data: `Password for ${PhoneNumber} Number is incorrect.`
                                })
                            break;

                            case 400:
                                res.status(400).json({
                                    Data: `Account with Number -> ${PhoneNumber}, not registred before.`
                                })
                            break;

                            default:break;
                        }
                    })
                } else {

                }
            } else {

            }
        } else {

        }
    }
})

export default Router