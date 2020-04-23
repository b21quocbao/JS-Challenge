import confessionsDAO from "../dao/confessionsDAO"
import usersDAO from "../dao/usersDAO"
import { User } from "./users.controller"
import ConfessionsDAO from "../dao/confessionsDAO"

export default class ConfessionsController {

    static async apiGetConfessions(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }

            let confessions = await confessionsDAO.getSuccessConfessions()
            let status = await usersDAO.getUsers()
            let user = await usersDAO.getUserByUserName(username)

            res.render("confession-list", { confessions: confessions, user: user, status: status })
        } catch (e) {
            console.log("API get confessions error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetAddConfession(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }

            let status = await usersDAO.getUsers()
            let user = await usersDAO.getUserByUserName(username)

            res.render("addConfession", { user: user, status: status })
        } catch (e) {
            console.log("API get edit confession error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetCheckConfessions(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }
            
            let user = await usersDAO.getUserByUserName(username)
            
            if (typeof user.cfs === 'undefined' || user.cfs === null) {
                res.redirect("/")
                return
            }
            let status = await usersDAO.getUsers()
            let confessions = await ConfessionsDAO.getPendingConfessions()

            res.render("checkConfession", { confessions: confessions, user: user, status: status })
        } catch (e) {
            console.log("API get edit confession error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiAcceptConfession(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }
            
            let user = await usersDAO.getUserByUserName(username)
            
            if (typeof user.cfs === 'undefined' || user.cfs === null) {
                res.redirect("/")
                return
            }
            await confessionsDAO.acceptConfession(req.params.id)
            res.redirect("/confessions/check")
        } catch (e) {
            console.log("API accept confession error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiDeclineConfession(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }
            
            let user = await usersDAO.getUserByUserName(username)
            
            if (typeof user.cfs === 'undefined' || user.cfs === null) {
                res.redirect("/")
                return
            }
            await confessionsDAO.declineConfession(req.params.id)
            res.redirect("/confessions/check")
        } catch (e) {
            console.log("API accept confession error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiAddConfession(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }
            
            let user = await usersDAO.getUserByUserName(username)
            
            console.log(await confessionsDAO.addConfession(user._id,req.body.text))
            res.redirect("/confessions/list")
        } catch (e) {
            console.log("API update confession by id error", e)
            res.status(500).json({ error: e })
        }
    }
}