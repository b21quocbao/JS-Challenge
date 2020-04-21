import { ObjectId } from "bson"
import getTime from "../getTime"

let trainings

export default class TrainingsDAO {
    static async injectDB(conn) {
        if (trainings) {
          return
        }
        try {
            trainings = await conn.db(process.env.DB).collection("trainings")
        } catch (e) {
          console.error(
            `Unable to establish a collection handle in trainingsDAO: ${e}`,
          )
        }
    }

    /**
     * Inserts/Update a training
     
        - "name", name of the training
        - "mentor", mentor of the training
        - "phone", phone of the mentor
        - "room", room for the training
        - "startDate", date start the training
        - "endDate", date end the training
        - "meet", link google meet for COVID-19 purpose
        - "link", link for materials of the training
        - "imgPath", Path to image cover of the training
        - "brief", brief introduction to the training
        - "popular", how popular of the thing in training 
        - "requirement", requirement to attend to this training
        - "syllabus", syllabus of the training
        - "userId", Id of user created the training
        - "createdDate", date created the training

     * @param {Object} training - Object containing training's information 
     * @param {String} UserId - Id of the user updates the training
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async updateTraining(training, userId, trainingId = null) {
        try {
            if (!training.userId) training.userId = ObjectId(userId)
            if (!training.date) training.date = getTime()
            trainings.updateOne(
                { "_id": ObjectId(trainingId) },
                { $set: training },
                { upsert: true }
            )
        } catch (e) {
            console.error(`Unable to update training: ${e}`)
            return { error: e }
        }
    }

    /**
     * Deletes a training
     * @param {string} trainingId - The _id of the training in database
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    static async deleteTrainingById(trainingId) {
        try {
            return await trainings.deleteOne(
                { "_id": ObjectId(trainingId) },
            )
        } catch (e) {
            console.error(`Unable to delete training: ${e}`)
            return { error: e }
        }
    }

    /**
     * Gets a training list
     * @returns {Trainings[]} Returns a list of trainings
     */
    static async getTrainings() {
        try {
            return await trainings.find({}).toArray()
        } catch (e) {
            console.error(`Unable to get list training: ${e}`)
            return []
        }
    }

    /**
     * Gets a training by its id
     * @param {string} id - The desired training id
     * @returns {Post | null} - Returns either a single training or nothing
     */
    static async getTrainingById(id) {
        try {
            return await trainings.findOne({ "_id": ObjectId(id) })
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
 * A Training
 * @typedef Training
 * @property {string} _id
 * @property {string} name
 * @property {string} mentor
 * @property {string} phone
 * @property {string} room
 * @property {string|Date} startDate
 * @property {string|Date} endDate
 * @property {string} meet
 * @property {string} link
 * @property {string} userId
 * @property {string} imgPath
 * @property {string|Date} createdDate
 * @property {string} brief
 * @property {string} popular
 * @property {string} requirement
 * @property {string} syllabus
 */
