// Import Package Modules
import chalk from "chalk";
import { connect } from "mongoose";

// Import Modules
import Notification from "../../Modules/Notification.js";
import PasswordProtection from "../PasswordProtection/PasswordProtection.js";

// Import Website Schema
import WebsiteText from "../../Schemas/WebsiteText.js";

// Import Websites Texts Documention (include all website texts)
import Website from "../../Docs/Website/Website.js"


export default class Database {

    constructor(Username = "", Password = "") {
        this.Username = Username;
        this.Password = Password;
    }

    async Connect() {
        try {
            await connect(`mongodb+srv://${this.Username}:${this.Password}@levinteam.73n1f.mongodb.net/portfolio`).then(async () => {
                Notification('Connection Successfully Established!')
                await this.#InsertData()
            }).catch((e) => {
                Notification(`[ Database ]: ${chalk.red('Connection Problem!')}, Error Message: ${e}`)
            })
        } catch (error) {
            Notification(`Database => Connect ${error}`)
        }
    }

    async FetchWebsiteData(ApiKey) {
        try {

            const WebsiteData = await WebsiteText.findOne({DataAvailability: 1})

            const ComparedApiKey = await PasswordProtection.ComparePassword(WebsiteData.Key, ApiKey)

            if (typeof ApiKey == "string") {
                if (ComparedApiKey === true) {
                    return {
                        Status: {
                            Code: 200,
                            Text: "OK"
                        },
                        Data: WebsiteData.Texts
                    }
                } else {
                    return {
                        Status: {
                            Text: "Api Key is not valid!",
                            Code: 404
                        }
                    }
                }
            } else {
                return {
                    Status: {
                        Text: "Api Key Type is not valid!",
                        Code: 404
                    }
                }
            }

        } catch (error) {
            Notification(`Database => FetchWebsiteData. ${error}`)
        }
    }

    async #InsertData() {
        try {
            const WebsiteData = await WebsiteText.findOne({DataAvailability: 1})

            if (!WebsiteData) {
                const Data = await new WebsiteText({
                    Key: 'APA-a-p165^*&%#',
                    DataAvailability: 1,
                    Texts: Website
                })

                Data.save().then(r => {
                    Notification('✅ Website Data has been successfully saved into database')
                    return true
                }).catch(e => {
                    Notification(`❌ There is An Error When Inserting Website Data into Schema. Error => ${e}`)
                    return {
                        Status: {
                            Message: "There is An Error When Inserting Website Data into Schema!",
                            Code: 404
                        }
                    }
                })
            }

        } catch (error) {
            Notification(`Database => #InsertData. ${error}`)
        }
    }
}