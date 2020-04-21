import confessionsDAO from "../dao/confessionsDAO"
import usersDAO from "../dao/usersDAO"
import { User } from "./users.controller"

export default class ConfessionsController {

    static async apiGetConfessions(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/")
                return
            }

            let confessions = await confessionsDAO.getConfessions()
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

    // static async apiAddConfession(req, res) {
    //     try {
    //         if (!req.body.html)
    //         req.body.confession = '<p>' + req.body.confession.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + '</p>';
    //         delete req.body.html
    //         await confessionsDAO.updateConfession(req.body, req.cookies.userId)
    //         res.redirect("/confessions/list")
    //     } catch (e) {
    //         console.log("API update confession by id error", e)
    //         res.status(500).json({ error: e })
    //     }
    // }
}