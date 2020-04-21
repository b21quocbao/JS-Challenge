import { ObjectId } from "bson"
import getTime from "../getTime"

let users
let sessions

export default class UsersDAO {
    static async injectDB(conn) {
        if (users) {
          return
        }
        try {
          users = await conn.db(process.env.DB).collection("users")
          sessions = await conn.db(process.env.DB).collection("sessions")
        } catch (e) {
          console.error(
            `Unable to establish a collection handle in UsersDAO: ${e}`,
          )
        }
    }

    /**
     * Create user
     
        - "email", user email
        - "username", display name
        - "password", encrypted user password
        - "socket", socket id
        - "phone", personal phone number
        - "dob", Date of Birth
        - "home", Home town
        - "training", array of training registered
        - "avatarFile", path to avatar File
        - "role", role in club  
        - "sex", 1/0 correspond to male/female
        - "post", can add/edit post
        - "training", can add/edit training
        - "cfs", can approve confessions
        - "admin", can approve other's permission

     * @param {Object} user - Object contains user information
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async addUser(user) {
        try {
            let emailExist = await this.getUserByEmail(user.email) 
            let nameExist = await this.getUserByUserName(user.username)
            if (emailExist) return { error: "A user with the given email already exists." }
            if (nameExist) return { error: "A user with the given username already exists." }
            await users.insertOne(
                user,
                { writeConcern: { w: "majority", wtimeout: 5000 } }
            )
            return { success: true }
        } catch (e) {
            console.error(`Unable to add new user error, ${e}.`)
            return { error: e }
        }
    }

    /**
     * Edit a user
     * @param {string} username - Username of the user needs to update
     * @param {Object} profile - Object contains user updated information 
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async editUser(username, profile) {
        try {
            for (let i of Object.keys(profile))
            if (profile[i])
            await users.updateOne(
                { "username": username },
                { $set: { [i]: profile[i] } }
            )
            return { success: true }
        } catch (e) {
            console.error(`Unable to edit user: ${e}`)
            return { error: e }
        }
    }

    /**
     * Adds a user to the `sessions` collection
     * @param {string} username - The username of the user to login
     * @param {string} jwt - A JSON web token representing the user's claims
     * @returns {DAOResponse} Returns either a "success" or an "error" Object
     */
    static async loginUser(username, jwt) {
        try {
        await sessions.updateOne(
            { "username": username },
            { $set: { "jwt": jwt } },
            { upsert: true }
        )
        return { success: true }
        } catch (e) {
        console.error(`Error occurred while logging in user, ${e}`)
        return { error: e }
        }
    }

    /**
     * Removes a user from the `sessons` collection
     * @param {string} username - The username of the user to logout
     * @returns {DAOResponse} Returns either a "success" or an "error" Object
     */
    static async logoutUser(username) {
        try {
            await sessions.deleteOne({ "username": username })
            await this.removeSocket(username)
            return { success: true }
        } catch (e) {
            console.error(`Error occurred while logging out user, ${e}`)
            return { error: e }
        }
    }

    /**
     * Gets a user from the `sessions` collection
     * @param {string} usernmae - The usernmae of the user to search for in `sessions`
     * @returns {Object | null} Returns a user session Object, an "error" Object
     * if something went wrong, or null if user was not found.
     */
    static async getUserSession(username) {
        try {
        return sessions.findOne({ "username": usernmae })
        } catch (e) {
        console.error(`Error occurred while retrieving user session, ${e}`)
        return null
        }
    }
    
    /**
     * Removes a user from the `sessions` and `users` collections
     * @param {string} username - The username of the user to delete
     * @returns {DAOResponse} Returns either a "success" or an "error" Object
     */
    static async deleteUser(username) {
        try {
        await users.deleteOne({ username })
        await sessions.deleteOne({ username: username })
        if (!(await this.getUser(username)) && !(await this.getUserSession(username))) {
            return { success: true }
        } else {
            console.error(`Deletion unsuccessful`)
            return { error: `Deletion unsuccessful` }
        }
        } catch (e) {
        console.error(`Error occurred while deleting user, ${e}`)
        return { error: e }
        }
    }

    /**
     * Add socket Id to user
     * @param {string} username - username of the user add the socket
     * @param {string} socket - Id of the socket to add to the user
     * @returns {DAOResponse} - Returns an object with either DB response or "error"
     */
    static async addSocket(username, socket) {
        try {
            return await users.updateOne(
                { "username": username },
                { $set: { "socket": socket } }
            )
        } catch (e) {
            console.error(`Unable to add socket: ${e}`)
            return { error: e }
        }
    }

    /**
     * Remove socket Id from user
     * @param {string} username - username of the user add the socket
     * @returns {DAOResponse} - Returns an object with either DB response or "error"
     */
    static async removeSocket(username) {
        try {
            return await users.updateOne(
                { "username": username },
                { $set: { "socket": null } }
            )
        } catch (e) {
            console.error(`Unable to remove socket: ${e}`)
            return { error: e }
        }
    }

    /**
     * Get list of users
     * @returns {Users[]} - List of users
     */
    static async getUsers() {
        try {
            return await users.find({}).toArray()
        } catch (e) {
            console.error(`Unable to get Users: ${e}`)
            return []
        }
    }

    /**
     * Get profile of user by username
     * @returns {User} - Returns a signle user or nothing
     */
    static async getUserByUserName(username) {
        try {
            return await users.findOne({ "username": username })
        } catch (e) {
            console.error(`Unable to get username: ${e}`)
            return null
        }
    }

    /**
     * Get profile of user by email
     * @returns {User} - Returns a signle user or nothing
     */
    static async getUserByEmail(email) {
        try {
            return await users.findOne({ "email": email })
        } catch (e) {
            console.error(`Unable to get Users email: ${e}`)
            return null
        }
    }

    /**
     * Get profile of user by _id
     * @returns {User} - Returns a signle user or nothing
     */
    static async getUserById(id) {
        try {
            return await users.findOne({ "_id": ObjectId(id) })
        } catch (e) {
            console.error(`Unable to get Users id: ${e}`)
            return null
        }
    }

    /**
     * Register training
     * @param {string} userId - Id of user register the training
     * @param {string} trainingId - Id of the training that user registered
     * @returns {DAOResponse} - Returns an object with either DB response or "error"
     */
    static async registerTraining(userId, trainingId) {
        try {
            return await users.updateOne(
                { "_id": ObjectId(userId) },
                { $push: { "trainings": trainingId } }
            )
        } catch (e) {
            console.error("Unable to register training ", e)
            return { error: e }
        }
    }
}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */

/**
 * An User
 * @typedef User
 * @property {string} email
 * @property {string} password
 * @property {string} phone
 * @property {string | Date} dob
 * @property {string} home
 * @property {string} username
 * @property {trainings[]} training
 * @property {string} avatarFile
 * @property {string} role
 * @property {boolean} sex
 * @property {boolean} post
 * @property {boolean} training
 * @property {boolean} cfs
 * @property {boolean} admin
 */

