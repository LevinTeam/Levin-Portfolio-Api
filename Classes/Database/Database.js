// Import Package Modules
import chalk from "chalk";
import { connect } from "mongoose";

// Import Modules
import Notification from "../../Modules/Notification.js";
import PasswordProtection from "../PasswordProtection/PasswordProtection.js";

// Import Website Schema
import WebsiteData from "../../Schemas/WebsiteData.js";

// Import Websites Texts Documention (include all website texts)
import Website from "../../Docs/Website/Website.js"
import Users from "../../Schemas/Users.js";


export default class Database {

    constructor(Username = "", Password = "") {
        this.Username = Username;
        this.Password = Password;
    }

    async Connect() {
        try {
            await connect(`mongodb+srv://${this.Username}:${this.Password}@levinteam.73n1f.mongodb.net/portfolio`).then(async () => {
                Notification('Database Connection Successfully Established!')
            }).catch((e) => {
                Notification(`[ Database ]: ${chalk.red('Connection Problem!')}, Error Message: ${e}`)
            })
        } catch (error) {
            Notification(`Database => Connect ${error}`)
        }
    }

    async CreateUser(ApiKey, { FirstName: FirstName, LastName: LastName, PhoneNumber: PhoneNumber, Password: Password }) {
        const VerifyAction = await this.#VerifyApiKey(ApiKey)
        const UserData = Users.findOne({PhoneNumber: PhoneNumber})
        if (VerifyAction == true) {
            if (!UserData) {
                const Data = new Users({
                    FirstName: FirstName,
                    LastName: LastName,
                    PhoneNumber: PhoneNumber,
                    Password: (await PasswordProtection.ReGeneratePassword(Password))
                })

                Data.save().then(async e => {
                    return {
                        DatabaseMessage: `✅ User Account ${PhoneNumber} Has Been Created Successfully`,
                        DatabaseAction: null
                    }
                }).catch(async err => {
                    return {
                        DatabaseMessage: `❌ An Error Happend When Creating ${PhoneNumber} User, ERROR: ${err}`,
                        DatabaseAction: null
                    }
                })
            } else {
                return {
                    DatabaseMessage: `User Account ${PhoneNumber} Registred Before, Please Login`,
                    DatabaseAction: `Login`
                }
            }
        } else {
            return {
                DatabaseMessage: `Cannot Verify ApiKey`,
                DatabaseAction: `Verify`
            }
        }
    }

    async #VerifyApiKey(ApiKey) {
        const WebsiteData = await WebsiteData.findOne({DataAvailability: 1})

        const ComparedApiKey = await PasswordProtection.ComparePassword(WebsiteData.ApiKey, ApiKey)

        if (ComparedApiKey == true) return true

        return false
    }
}