// Import Package Modules
import chalk from "chalk";
import { connect } from "mongoose";

// Import Modules
import Notification from "../../Modules/Notification.js";
import PasswordProtection from "../PasswordProtection/PasswordProtection.js";

// Import Databases Schemas
import WebsiteData from "../../Schemas/WebsiteData.js";
import Users from "../../Schemas/Users.js";
import Comments from "../../Schemas/Comments.js";

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

    async LoginUser(ApiKey, { PhoneNumber: PhoneNumber, Password: Password }) {
        const VerifyAction = await this.#VerifyApiKey(ApiKey)
        const UserData = await Users.findOne({PhoneNumber: PhoneNumber})
        if (VerifyAction == true) {
            if (UserData) {
                const CheckPassword = await PasswordProtection.ComparePassword(Password, UserData.Password)
                if (CheckPassword == true) {
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
                            Code: 200,
                            Message: 'Loggined'
                        }
                    }
                } else {
                    return {
                        DatabaseMessage: `Password is Incorrect`,
                        DatabaseAction: `Login_Failed`,
                        Status: {
                            Code: 404,
                            Message: 'PasswordIncorrect'
                        }
                    }
                }
            } else {
                return {
                    DatabaseMessage: `User Account ${PhoneNumber} Not Registred Yet, Please Sign up`,
                    DatabaseAction: `Signup`,
                    Status: {
                        Code: 400,
                        Message: 'ShouldSignup'
                    }
                }
            }
        } else {
            return {
                DatabaseMessage: `Cannot Verify ApiKey`,
                DatabaseAction: `Verify`
            }
        }
    }

    async ForgotPassword(ApiKey, {PhoneNumber: PhoneNumber, OTP: OTP}) {

    }

    async SaveComment(ApiKey, { Name: Name, PhoneNumber: PhoneNumber, Email: Email, Subject: Subject, CommentMessage: CommentMessage }) {
        const VerifyAction = await this.#VerifyApiKey(ApiKey)

        if (VerifyAction == true) {

        }
    }

    async #VerifyApiKey(ApiKey) {
        const Data = await WebsiteData.findOne({DataAvailability: 1})

        const ComparedApiKey = await PasswordProtection.ComparePassword(Data.ApiKey, ApiKey)

        if (ComparedApiKey == true) return true

        return false
    }
}