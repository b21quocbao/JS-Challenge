let preRegisters
function getRandomArbitrary(min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
}

export default class PreRegistersDAO {
    static async injectDB(conn) {
        if (preRegisters) {
            return
        }
        try {
            preRegisters = await conn.db(process.env.DB).collection("preRegisters")
        } catch (e) {
            console.error(`Unable to establish a collection handle in postsDAO: ${e}`)
        }
    }
    
    /**
     * Create a pre register document
     
        - username
        - otp
        - email
        - password
        - sex

     * @param {$Object} - Information of registered user
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async insertPreRegister(user) {
        try {
            let otp = getRandomArbitrary(100000, 999999)
            user.otp = otp
            await preRegisters.updateOne(
                { "username": user.username },
                { $set: { user } },
                { upsert: true }
            )
            await preRegisters.createIndex(
                { "username": 1 },
                { "expireAfterSeconds": 300 }
            )
            return otp
        } catch (e) {
            console.error("Insert pre register error", e)
            return { error: e }
        }
    }

    /**
     * Get user by OTP
     * @param {int} otp - 6-digit otp enter by the user
     * @returns {Object} - Infrmation of the user with the given otp
     */
    static async getUserByOTP (otp) {
        try {
            return await preRegisters.findOne(
                { "user.otp" : otp }
            )
        } catch (e) {
            console.error("Get user by OTP error ", e)
            return null
        }
    }
}