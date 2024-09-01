// Import Packages
import express from "express";
import csurf from "csurf";
import Throttle from "express-throttle/lib/throttle.js";
import JWT from "jsonwebtoken";

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
const { sign, verify } = JWT

// POST user data and create user account and return user saved info to Front-end side
Router.post('/create', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {FirstName, LastName, PhoneNumber, Password} = req.body
    const {authorization} = req.headers
    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, authorization)

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
                                switch (message.Status.Code) {
                                    case 201:
                                        res.status(201).json({
                                            Data: `اکانت با شماره ${PhoneNumber} با موفقیت ساخته شد.`,
                                            UserData: message.UserData,
                                            UserToken: message.UserToken
                                        })
                                    break;

                                    case 500:
                                        res.status(500).json({
                                            Data: `An Error happened when creating ${PhoneNumber} Account.`
                                        })
                                    break;

                                    case 400:
                                        res.status(400).json({
                                            Data: `اکانتبا شماره ${PhoneNumber} قبلا در سایت ثبت نام شده است.`
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
                                Data: `پسورد باید بین 5 تا 100 حرف باشد.`
                            })
                        }
                    } else {
                        res.status(400).json({
                            Data: `شماره تلفن باید بین 10 تا 13 عدد باشد.`
                        })
                    }
                } else {
                    res.status(400).json({
                        Data: `نام خانوادگی باید بین 3 تا 20 حروف باشد.`,
                    })
                }
            } else {
                res.status(400).json({
                    Data: `نام باید بین 3 تا 20 حروف باشد.`,
                })
            }
        } else {
            res.status(400).json({
                Data: `مقدار یکی از ورودی ها اشتباه است.`,
            })
        }
    }
})

// POST user phone number and password and logging into user account and return user saved info to Front-end side
Router.post('/login', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {PhoneNumber, Password} = req.body
    const {authorization} = req.headers
    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, authorization)

    if (CompareApiKey == true) {
        if ((typeof PhoneNumber && typeof Password) == "string") {
            if (PhoneNumber.length >= 10 && PhoneNumber.length <= 13) {
                if (Password.length >= 5 && Password.length <= 100) {
                    await Data.LoginUser(Config.Key, {
                        PhoneNumber: PhoneNumber,
                        Password: Password
                    }).then(async message => {
                        switch (message.Status.Code) {
                            case 200:
                                res.status(200).json({
                                    Data: `کاربر با شماره ${PhoneNumber} با موفقیت وارد شد.`,
                                    UserData: message.DatabaseOptionalData,
                                    UserToken: message.UserToken
                                })
                            break;

                            case 404:
                                res.status(404).json({
                                    Data: `پسورد اکانت ${PhoneNumber} اشتباه است.`
                                })
                            break;

                            case 400:
                                res.status(400).json({
                                    Data: `شماره ${PhoneNumber} تا کنون داخل سایت ثبت نام نکرده است.`
                                })
                            break;

                            default:break;
                        }
                    })
                } else {
                    res.status(404).json({
                        Data: `پسورد باید بین 5 تا 100 حرف باشد.`
                    })
                }
            } else {
                res.status(404).json({
                    Data: `شماره تلفن باید بین 10 تا 13 عدد باشد.`
                })
            }
        } else {
            res.status(404).json({
                Data: `مقدار تمام ورودی باید رشته باشد.`
            })
        }
    }
})

// POST user comment and save it into database
Router.post('/create-comment', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {Name, PhoneNumber, Email, Subject, CommentMessage} = req.body
    const {authorization} = req.headers
    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, authorization)

    if (CompareApiKey == true) {
        if ((typeof Name && typeof Subject && typeof CommentMessage) == "string") {
            if (PhoneNumber || Email) {
                if ((typeof PhoneNumber || typeof Email) == "string") {
                    if (Name.length >= 3 && Name.length <= 30) {
                        if ((PhoneNumber.length >= 10 && PhoneNumber.length <= 13) || (Email.length >= 6 && Email.length <= 50)) {
                            if ((Email !== undefined) || (Email == undefined)) {
                                if (Subject.length >= 4 && Subject.length <= 50) {
                                    if (CommentMessage.length >= 20 && CommentMessage.length <= 1000) {
                                        await Data.SaveComment(Config.Key, {
                                            Name: Name,
                                            PhoneNumber: PhoneNumber,
                                            Email: (Email?.includes("@gmail.com") || Email?.includes("@yahoo.com") || Email?.includes("@outlook.com")) ? Email : Email,
                                            Subject: Subject,
                                            CommentMessage: CommentMessage
                                        }).then(async message => {
                                            switch (message.Status.Code) {
                                                case 201:
                                                    res.status(201).json({
                                                        Data: `Comment Created`,
                                                        CommentData: message.CommentData
                                                    })
                                                break;

                                                case 500:
                                                    res.status(500).json({
                                                        Data: `An Error happened when Creating Comment.`
                                                    })
                                                break;

                                                default:break;
                                            }
                                        })
                                    } else {
                                        res.status(404).json({
                                            Data: `متن نظر شما باید بین 20 تا 1000 حروف باشد.`
                                        })
                                    }
                                } else {
                                    res.status(404).json({
                                        Data: `موضوع نظر شما باید بین 4 تا 50 حروف باشد.`
                                    })
                                }
                            } else {
                                res.status(404).json({
                                    Data: `ایمیل وارد شده اشتباه است.`
                                })
                            }
                        } else {
                            res.status(404).json({
                                Data: `مقدار شماره تلفن یا ایمیل اشتباه است.`
                            })
                        }
                    } else {
                        res.status(404).json({
                            Data: `نام باید بین 3 تا 30 حروف باشد.`
                        })
                    }
                } else {
                    res.status(404).json({
                        Data: `مقدار ورودی تمام اینپوت ها باید رشته باشد.`
                    })
                }
            } else {
                res.status(404).json({
                    Data: `حتما باید ایمیل یا شماره تلفن را وارد کنید.`
                })
            }
        } else {
            res.status(404).json({
                Data: `مقدار ورودی تمام اینپوت ها باید رشته باشد.`
            })
        }
    }
})

Router.get('/get-info', Throttle({ "rate": "10/min" }), async (req, res, next) => {
    const {authorization} = req.headers
    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, authorization)

    if (CompareApiKey == true) {
        res.status(200).send({
            UserData: verify(authorization, Config.Key)
        })

    }
})

export default Router