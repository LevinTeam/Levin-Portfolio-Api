// Import Packages
import express from "express";
import csurf from "csurf";

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
Router.get('/', CSRFProtection, async (req, res, next) => {
    const {ApiKey} = req.body

    const CompareApiKey = await PasswordProtection.ComparePassword(Config.Key, ApiKey)

    if (CompareApiKey == true) {
        await Data.FetchWebsiteData(Config.Key).then(async message => {

            switch (message.Status.Code) {
                case 404:
                    return {
                        Data: res.status(404).send(message.Status.Text)
                    }
                break;

                case 200:
                    return {
                        Data: res.status(200).send(message.Data)
                    }
                break;

                default:break;
            }
        }).catch(e => {
            Notification(`ERROR: Routes -> Data => (/) Route ${e}`)
        })
    }
})

export default Router