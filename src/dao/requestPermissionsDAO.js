import { ObjectID } from "bson"

let requestPermissions

export default class RequestPermissionsDAO {
    static async injectDB(conn) {
        if (requestPermissions) {
          return
        }
        try {
          requestPermissions = await conn.db(process.env.DB).collection("requestPermissions")
        } catch (e) {
          console.error(
            `Unable to establish a collection handle in RequestPermissionsDAO: ${e}`,
          )
        }
    }

    /**
     * Insert a new request
     
        - username, username of the user request permission
        - permission, name of permission request

     * @param {string} username - username of the user request
     * @param {string} permission - name of permission
     * @returns {DAOResponse} - error or success inserted document 
     */
    static async insertRequest(username, permission) {
        try {
            return await requestPermissions.insertOne(
                { username: username, permission: permission, status: "pending" }
            )
        } catch (e) {
            console.error("Insert request error", e)
            return { error: e }
        }
    }

    /**
     * Find a request by Id
     * @param {string} id - id of the request
     * @returns {DAOResponse} - documnent with given id or nothing
     */
    static async findRequestById(id) {
        try {
            return await requestPermissions.findOne(
                { "_id": ObjectID(id) }
            )
        } catch (e) {
            console.error("Find request by Id error", e)
            return null 
        }
    }

    /**
     * Delete a request by Id
     * @param {string} id - id of the request
     * @param {string} status - status of the request
     * @returns {DAOResponse} - success or error message
     */
    static async deleteRequestById(id, status) {
        try {
            await requestPermissions.updateOne(
                { "_id": ObjectID(id) },
                { $set: { status: status } }
            )
            return { success: true }
        } catch (e) {
            console.error("Delete request by Id error", e)
            return { error: e } 
        }
    }

    /**
     * Get all requests
     * @returns {DAOResponse} - returns all documents in the collection or nothing
     */
    static async getRequests() {
        try {
            return await requestPermissions.find({
                status: "pending"
            }).toArray()
        } catch (e) {
            console.error("Get requests error", e)
            return null
        }
    }

    /**
     * Get requests by username
     * @param {string} username - username of the user
     * @returns {DAOResponse} - returns all documents matches or nothing
     */
    static async getRequestsByUsername(username) {
        try {
            return await requestPermissions.find({
                username: username
            }).toArray()
        } catch (e) {
            console.error("Get requests error", e)
            return null
        }
    }
}