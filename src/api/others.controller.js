import usersDAO from "../dao/usersDAO"
import { User } from "./users.controller"

export default class OthersController {
    
    static async apiGetIndex(req, res) {
        try {
            
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.render(req.url.slice(1))
                return
            }
            
            let user = await usersDAO.getUserByUserName(username)
            let status = await usersDAO.getUsers()
            res.render(req.url.slice(1), { user: user, status: status })
        } catch (e) {
            console.log("API get others page error", e)
            res.status(500).json({ error: e })
        }
    }

    static async mainPage(req, res) {
        res.redirect("/index")
    }
}