// Import Encryption Modules
import { hashSync, compareSync } from "bcrypt"

// Import Config File
import Config from "../../Configs/Config.json" assert { type: "json" }

export default class PasswordProtection {


    // Re Generate Password With Hash and Salt (PRIVATE)
    static async #ReGeneratePassword(Password) {
        const SaltRounds = 10
        const HashedPassword = hashSync(Password, SaltRounds)

        return {
            HashedPassword: HashedPassword
        }
    }

    // Verify Password with API Password Input (PRIVATE)
    static async #ComparePassword(InputPassword, UserPassword) {
        if (compareSync(InputPassword, UserPassword)) {
            return {
                IsPasswordCorrect: true
            }
        } else {
            return {
                IsPasswordCorrect: false
            }
        }
    }

    // Make Re Generate Password Funtion Public
    static async ReGeneratePassword(Password) {
        return (await this.#ReGeneratePassword(Password)).HashedPassword
    }

    // Make Verify Password With API Password Input Public
    static async ComparePassword(InputPassword, UserPassword) {
        return (await this.#ComparePassword(InputPassword, UserPassword)).IsPasswordCorrect
    }

}
let a = 'APA-a-p165^*&%#'
let b = '$2b$10$anXjU06.a1l51zPYUW/N2O..ZSb20q4MaWiFWlx.JDv4XXdzPFmEO'
let c = '$2b$10$WK9WDLFlEtsPNdjITr7Zpeeeeo2HBqUOQ7GPX09WFar/z/l7jegly'
// let t = await PasswordProtection.ReGeneratePassword('$2b$10$anXjU06.a1l51zPYUW/N2O..ZSb20q4MaWiFWlx.JDv4XXdzPFmEO')
let s = await PasswordProtection.ComparePassword(b, c)
let d = await PasswordProtection.ComparePassword(a, b)
let e = await PasswordProtection.ComparePassword('APA-a-p165^*&%#', Config.Key)

await console.log(s, d)