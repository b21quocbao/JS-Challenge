import { ObjectId } from "bson"
import getTime from "../getTime"

let confessions

export default class ConfessionsDAO {
    static async injectDB(conn) {
        if (confessions) {
          return
        }
        try {
          confessions = await conn.db(process.env.DB).collection("confessions")
        } catch (e) {
          console.error(
            `Unable to establish a collection handle in confessionsDAO: ${e}`,
          )
        }
    }

    /**
     * Adds a confession
     
        - "text", confession text
        - "userId", Encrypted userId create confession
        - "status", post brief
        - "date", date create confessions

     * @param {string} userId - Id of the user who create the confession
     * @param {string} text - text of the confession
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async addConfession(userId, text) {
        try {
            return await confessions.insertOne({ userId: ObjectId(userId), text: text, status: "pending" })
        } catch (e) {
            console.error(`Unable to add confession: ${e}`)
            return { error: e }
        }
    }

    /**
     * Gets a success confessions list
     * @returns {Confessions[]} Returns a list of success confessions
     */
    static async getSuccessConfessions() {
        try {
            const pipeline = [
                { $match: {
                    status: "accepted"
                } },
                { $lookup: {
                    from: "comments",
                    let: { id: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$postId", "$$id"],
                          },
                        },
                      },
                      {
                        $sort: {
                          date: -1,
                        },
                      },
                    ],
                    as: "comments",
                } },
                { $sort: { date: 1 } }
            ]
            return await confessions.aggregate(pipeline).toArray()
        } catch (e) {
            console.error(`Unable to get list success confession: ${e}`)
            return []
        }
    }

    /**
     * Gets a pending confessions list
     * @returns {Confessions[]} Returns a list of pending confessions
     */
    static async getPendingConfessions() {
        try {
            const pipeline = [
                { $match: {
                    status: "pending"
                } }
            ]
            return await confessions.aggregate(pipeline).toArray()
        } catch (e) {
            console.error(`Unable to get list pending confession: ${e}`)
            return []
        }
    }

    /**
     * Gets a confession list by user
     * @param {string} - Encrypted user Id
     * @returns {Confessions[]} Returns a list of confessions by Id
     */
    static async getConfessionsByUserId(userId) {
        try {
            return await confessions.find(
                { "userId": userId }
            ).toArray()
        } catch (e) {
            console.error(`Unable to get list confessions by user: ${e}`)
            return []
        }
    }

    /**
     * Accept a confession
     * @param {string} - Id of accepted confession
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async acceptConfession(id) {
        try {
            await confessions.updateOne(
                { "_id": ObjectId(id) },
                { $set: { "status": "accepted", date: new Date() } }
            )
            return { success: true }
        } catch (e) {
            console.error("Accept confession error", e)
            return { error: e }
        }
    }

    /**
     * Decline a confession
     * @param {string} - Id of declined confession
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async declineConfession(id) {
        try {
            await confessions.updateOne(
                { "_id": ObjectId(id) },
                { $set: { "status": "declined" } }
            )
            return { success: true }
        } catch (e) {
            console.error("Decline confession error", e)
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
 * A Confession
 * @typedef Confession
 * @property {string} _id
 * @property {string} text
 * @property {string} status
 * @property {string} date
 */
