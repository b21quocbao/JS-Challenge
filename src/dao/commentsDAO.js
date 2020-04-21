import { ObjectId } from "bson"
import getTime from "../getTime"
import UsersDAO from "./usersDAO"

let comments

export default class CommentsDAO {
    static async injectDB(conn) {
        if (comments) {
          return
        }
        try {
          comments = await conn.db(process.env.DB).collection("comments")
        } catch (e) {
          console.error(
            `Unable to establish a collection handle in commentsDAO: ${e}`,
          )
        }
    }
    
    /**
     * Add comment to post/confession
     
        - "text", content of the comment
        - "userId", Id of the user who post the comment
        - "post", If it's in a post the value will be 1, otherwise 0
        - "postId", Id of the post/confession

     * @param {string} text content of the comment
     * @param {string} username username of the user who post the comment
     * @param {string} avatarFile avatarFile of the user who post the comment
     * @param {boolean} post In a post or not
     * @param {string} postId Id of the post/confession
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async addComment(text, username, avatarFile, post, postId) {
        try {
            return await comments.insertOne(
                { text: text, username: username, avatarFile: avatarFile, post: post, postId: ObjectId(postId) }
            )
        } catch (e) {
            console.error(`Unable to add comment: ${e}`);
            return { error: e }
        }
    }

    /**
     * Delete comment to post/confession
     * @param {string} id Id of the comment
     * @param {string} userId Id of the user who post the comment
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async deleteComment(id, username) {
        try {
            return await comments.deleteOne(
                { "_id": ObjectId(id), "username": username }
            )
        } catch (e) {
            console.error(`Unable to delete comment: ${e}`);
            return { error: e }
        }
    }

    /**
     * Get comments of a post
     * @param {string} postId Id of the post
     * @returns {Comments[]} Return array of comments of the post
     */
    static async getPostComments(postId) {
        try {
            return await comments.find(
                { "post": 1, "postId": ObjectId(postId) }
            ).toArray()
        } catch (e) {
            console.error(`Unable to get comments from the post: ${e}`)
            return []
        }
    }

    /**
     * Get comments of a confession
     * @param {string} cfId Id of the confession
     * @returns {Comments[]} Return array of comments of the confession
     */
    static async getPostComments(cfId) {
        try {
            return await comments.find(
                { "post": 0, "postId": ObjectId(cfId) }
            ).toArray()
        } catch (e) {
            console.error(`Unable to get comments from the post: ${e}`)
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
 * A Comment
 * @typedef Comment
 * @property {string} _id
 * @property {string} text
 * @property {boolean} post
 * @property {string} postId
 * @property {string} username
 * @property {string} avatarFile
 */