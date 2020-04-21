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

     * @param {Object} user - Object containing user's information
     * @param {Object} confession - Object containing confession's information 
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async addConfession(userId, confession) {
        try {
            console.log("Added a confession ", " on ", date)
            confession.date = getTime()
            confession.userId = ObjectId(userId)
            return await posts.insertOne(confession)
        } catch (e) {
            console.error(`Unable to add confession: ${e}`)
            return { error: e }
        }
    }

    /**
     * Gets a confession list
     * @returns {Confessions[]} Returns a list of confessions
     */
    static async getConfessions() {
        try {
            const pipeline = [
                {
                $lookup: {
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
                  },
                },
            ]
            return await confessions.aggregate(pipeline).toArray()
        } catch (e) {
            console.error(`Unable to get list confession: ${e}`)
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
