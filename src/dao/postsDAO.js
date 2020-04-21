import { ObjectId } from "bson"
import getTime from "../getTime"

let posts

export default class PostsDAO {
    static async injectDB(conn) {
        if (posts) {
          return
        }
        try {
          posts = await conn.db(process.env.DB).collection("posts")
        } catch (e) {
          console.error(
            `Unable to establish a collection handle in postsDAO: ${e}`,
          )
        }
    }

    /**
     * Inserts a post
     
        - "name", post name
        - "brief", post brief
        - "post", main post
        - "imgPath", path to image cover
        - "date", created date
        - "userId", name of user created post

     * @param {Object} userId - Id of the user who update the post
     * @param {Object} post - Object containing post's information 
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async updatePost(post, userId, postId = null) {
        try {
            if (postId === null) {
                post.userId = ObjectId(userId)
                post.date = getTime()
            }
            return await posts.updateOne(
                { "_id": ObjectId(postId) },
                { $set: post },
                { upsert: true }
            )
        } catch (e) {
            console.error(`Unable to add post: ${e}`)
            return { error: e }
        }
    }

    /**
     * Deletes a post
     * @param {string} postId - The _id of the post in database
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async deletePostbyId(postId) {
        try {
            return await posts.deleteOne(
                { "_id": ObjectId(postId) },
            )
        } catch (e) {
            console.error(`Unable to delete post: ${e}`)
            return { error: e }
        }
    }

    /**
     * Gets a post list
     * @returns {Posts[]} Returns a list of posts
     */
    static async getPosts() {
        try {
            return await posts.find({}).toArray()
        } catch (e) {
            console.error(`Unable to get list post: ${e}`)
            return []
        }
    }

    /**
     * Gets a post by its id
     * @param {string} id - The desired post id
     * @returns {Post | null} - Returns either a single post or nothing
     */
    static async getPostById(id) {
        try {
            const pipeline = [
                {
                  $match: {
                    _id: ObjectId(id),
                  },
                },
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
              return await posts.aggregate(pipeline).next()
        } catch (e) {
            return null
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
 * A Post
 * @typedef Post
 * @property {string} _id
 * @property {string} name
 * @property {string} brief
 * @property {string} post
 * @property {string} imgPath
 * @property {string|Date} date
 * @property {string} userId
 */
