import trainingsDAO from "../dao/trainingsDAO"
import usersDAO from "../dao/usersDAO"
import { User } from "./users.controller"

export default class TrainingsController {

    static async apiGetTrainings(req, res) {
        try {
            let trainings = await trainingsDAO.getTrainings()
            let { username, error } = await User.decoded(req.cookies.token)

            if (error) {
                res.render("training-list", { trainings: trainings })
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            let status = await usersDAO.getUsers()
            res.render("training-list", { 
                trainings: trainings, user: user, status: status
            })
        } catch (e) {
            console.log("API get trainings error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetEditTraining(req, res) {
        try {
            let training = await trainingsDAO.getTrainingById(req.params.id)
            let { username, error } = await User.decoded(req.cookies.token)

            if (error) {
                res.redirect("trainings/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)

            if (!user.training) {
                res.redirect("trainings/list")
                return
            }

            let status = await usersDAO.getUsers()
            if (user.training) {
                res.render("editTraining", { 
                    training: training, user: user, status: status
                })
            }
        } catch (e) {
            console.error("API get edit training error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetAddTraining(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)

            if (error) {
                res.redirect("trainings/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)

            if (!user.training) {
                res.redirect("trainings/list")
                return
            }

            let status = await usersDAO.getUsers()
            if (user.training) {
                res.render("addTraining", { 
                    user: user, status: status
                })
            }
        } catch (e) {
            console.log("API get edit training error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiUpdateTrainingById(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/trainings/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            if (user.training) {
                req.body.requirement = '<ul><li>' + req.body.requirement1.replace("\n", "</li><li>") + '</li></ul>';
                await trainingsDAO.updateTraining(req.body, user._id, req.params.id)
            }
            res.redirect("/trainings/list")
        } catch (e) {
            console.log("API update training by id error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiAddTraining(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/trainings/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            if (user.training) {
                req.body.requirement = '<ul><li>' + req.body.requirement1.replace("\n", "</li><li>") + '</li></ul>';
                await trainingsDAO.updateTraining(req.body, user._id)
            }
            res.redirect("/trainings/list")
        } catch (e) {
            console.log("API update training by id error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiDeleteTrainingById(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/trainings/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            if (user.training) {
                await trainingsDAO.deleteTrainingById(req.params.id)
            }
            res.redirect("/trainings/list")
        } catch (e) {
            console.log("API delete training by id error", e)
            res.status(500).json({ error: e })
        }
    }

    
    static async apiRegisterTraining(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)

            if (error) {
                res.redirect("/trainings/list")
                return
            }
            
            let user = await usersDAO.getUserByUserName(username)
            await usersDAO.registerTraining(user._id, req.params.id)
            res.redirect("/trainings/list")
        } catch (e) {
            res.redirect("/trainings/list")
        }
    }
    
}