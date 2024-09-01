// Import Package Modules
import chalk from "chalk";
import { connect } from "mongoose";
import JWT from "jsonwebtoken";

// Import Modules and Classes
import Notification from "../../Modules/Notification.js";
import CommentID from "../../Modules/CommentID.js";
import PasswordProtection from "../PasswordProtection/PasswordProtection.js";

// Import Databases Schemas
import WebsiteData from "../../Schemas/WebsiteData.js";
import Users from "../../Schemas/Users.js";
import Comments from "../../Schemas/Comments.js";

// Import Websites Texts Documention (include all website texts)
import Website from "../../Docs/Website/Website.js"

// Import Configs
import Config from "../../Configs/Config.json" assert { type: "json" }

// Import JSON Web Tokens methods
const { sign, verify } = JWT

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
                    UserToken: (await this.#GetUserToken({
                        PhoneNumber: (await Users.findOne({PhoneNumber: PhoneNumber})).PhoneNumber,
                        FirstName: (await Users.findOne({PhoneNumber: PhoneNumber})).FirstName,
                        LastName: (await Users.findOne({PhoneNumber: PhoneNumber})).LastName,
                        FullName: `${(await Users.findOne({PhoneNumber: PhoneNumber})).FirstName} ${(await Users.findOne({PhoneNumber: PhoneNumber})).LastName}`
                    })),
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
                        UserToken: (await this.#GetUserToken({
                            PhoneNumber: UserData.PhoneNumber,
                            FirstName: UserData.FirstName,
                            LastName: UserData.LastName,
                            FullName: `${UserData.FirstName} ${UserData.LastName}`
                        })),
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

    async SaveComment(ApiKey, { Name: Name, PhoneNumber: PhoneNumber, Email: Email, Subject: Subject, CommentMessage: CommentMessage }) {
        const VerifyAction = await this.#VerifyApiKey(ApiKey)
        const GeneratedCommentID = CommentID(1, 10000)

        if (VerifyAction == true) {
            if (PhoneNumber || Email) {
                const Data = await new Comments({
                    CommentID: Number(GeneratedCommentID),
                    Name: String(Name),
                    PhoneNumber: String(PhoneNumber),
                    Email: String(Email),
                    Subject: String(Subject),
                    Comment: String(CommentMessage)
                })

                Data.save().catch(e => {
                    return {
                        Status: {
                            Code: 500,
                            Message: 'Failed'
                        },
                        DatabaseMessage: `❌ An Error Happend When Creating ${PhoneNumber, Email} User Comment, ERROR: ${e}`,
                        DatabaseAction: null
                    }
                })

                return {
                    Status: {
                        Code: 201,
                        Message: 'CommentCreated'
                    },
                    CommentData: {
                        CommentID: GeneratedCommentID,
                        Name: Name,
                        PhoneNumber: String(PhoneNumber),
                        Email: String(Email),
                        Subject: String(Subject),
                        CommentMessage: String(CommentMessage)
                    },
                    DatabaseMessage: `User With Email: ${Email} and Phone number ${PhoneNumber}, Created a Comment`,
                    DatabaseAction: null
                }

            }
        }
    }

    async #GetUserToken({PhoneNumber: PhoneNumber, FirstName: FirstName, LastName: LastName, FullName: FullName}) {
        const UserDataToken = await sign({
            UserPhoneNumber: PhoneNumber,
            UserFirstName: FirstName,
            UserLastName: LastName,
            UserFullName: FullName
        }, Config.Key)

        return UserDataToken
    }

    async #VerifyApiKey(ApiKey) {
        const Data = await WebsiteData.findOne({DataAvailability: 1})

        const ComparedApiKey = await PasswordProtection.ComparePassword(Data.ApiKey, ApiKey)

        if (ComparedApiKey == true) return true

        return false
    }
}