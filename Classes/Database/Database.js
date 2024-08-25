// Import Package Modules
import chalk from "chalk";
import { connect } from "mongoose";

// Import Modules
import Notification from "../../Modules/Notification.js";
import PasswordProtection from "../PasswordProtection/PasswordProtection.js";

// Import Databases Schemas
import WebsiteData from "../../Schemas/WebsiteData.js";
import Users from "../../Schemas/Users.js";

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
        const UserData = await Users.findOne({PhoneNumber: PhoneNumber})
        const ReGeneratedPassword = await PasswordProtection.ReGeneratePassword(Password)
        if (VerifyAction == true) {
            if (!UserData) {
                const Data = await new Users({
                    FirstName: FirstName,
                    LastName: LastName,
                    PhoneNumber: PhoneNumber,
                    Password: ReGeneratedPassword
                })

                await Data.save().catch(async err => {
                    return {
                        Status: {
                            Code: 500,
                            Message: 'Failed'
                        },
                        DatabaseMessage: `❌ An Error Happend When Creating ${PhoneNumber} User, ERROR: ${err}`,
                        DatabaseAction: null
                    }
                })

                return {
                    Status: {
                        Code: 201,
                        Message: 'Created'
                    },
                    UserData: {
                        UserPhoneNumber: PhoneNumber,
                        UserFirstName: FirstName,
                        UserLastName: LastName,
                        UserFullName: `${FirstName} ${LastName}`
                    },
                    DatabaseMessage: `✅ User Account ${PhoneNumber} Has Been Created Successfully`,
                    DatabaseAction: null
                }

            } else {
                return {
                    Status: {
                        Code: 400,
                        Message: 'ShouldLogin'
                    },
                    DatabaseMessage: `User Account ${PhoneNumber} Registred Before, Please Login`,
                    DatabaseAction: `Login`
                }
            }
        } else {
            return {
                Status: {
                    Code: 503,
                    Message: 'CantVerifyApiKey'
                },
                DatabaseMessage: `Cannot Verify ApiKey`,
                DatabaseAction: `Verify`
            }
        }
    }

    async LoginUser(ApiKey, { PhoneNumber: PhoneNumber, Password: Password, OTP: OTP }) {
        const VerifyAction = await this.#VerifyApiKey(ApiKey)
        const UserData = await Users.findOne({PhoneNumber: PhoneNumber})
        const CheckPassword = await PasswordProtection.ComparePassword(Password, UserData.Password)
        if (VerifyAction == true) {
            if (UserData) {
                if (OTP) {
                    return {
                        Status: {
                            Code: 500,
                            Message: 'Failed'
                        },
                        DatabaseMessage: `OTP Verfication Option Disabled`,
                        DatabaseAction: `OTP_Failed`
                    }
                } else {
                    if (UserData.Password === CheckPassword) {
                        return {
                            DatabaseMessage: `User ${PhoneNumber} Has Been Successfully Logined into Account`,
                            DatabaseAction: `Logined`,
                            DatabaseOptionalData: {
                                UserPhoneNumber: UserData.PhoneNumber,
                                UserFirstName: UserData.FirstName,
                                UserLastName: UserData.LastName,
                                UserFullName: `${UserData.FirstName} ${UserData.LastName}`
                            },
                            Status: {
                                Code: 500,
                                Message: 'Failed'
                            }
                        }
                    } else {
                        return {
                            Status: {
                                Code: 500,
                                Message: 'Failed'
                            },
                            DatabaseMessage: `Password is Incorrect`,
                            DatabaseAction: `Login_Failed`
                        }
                    }
                }
            } else {
                return {
                    Status: {
                        Code: 500,
                        Message: 'Failed'
                    },
                    DatabaseMessage: `User Account ${PhoneNumber} Not Registred Yet, Please Sign up`,
                    DatabaseAction: `Signup`
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
        const Data = await WebsiteData.findOne({DataAvailability: 1})

        const ComparedApiKey = await PasswordProtection.ComparePassword(Data.ApiKey, ApiKey)

        if (ComparedApiKey == true) return true

        return false
    }
}