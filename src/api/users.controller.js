import { ObjectId } from "bson"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import UsersDAO from "../dao/usersDAO"
import cookie from "cookie"

const hashPassword = async password => await bcrypt.hash(password, await bcrypt.genSalt(10))

export class User {
    constructor({ username, email, password, preferences = {} } = {}) {
        this.username = username
        this.email = email
        this.password = password
        this.preferences = preferences
    }
    toJson() {
        return { username: this.username, email: this.email, preferences: this.preferences }
    }
    async comparePassword(plainText) {
        return await bcrypt.compare(plainText, this.password)
    }
    encoded() {
        return jwt.sign(
            {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
            ...this.toJson(),
            },
            process.env.SECRET_KEY,
        )
    }
    static async decoded(userJwt) {
        return jwt.verify(userJwt, process.env.SECRET_KEY, (error, res) => {
            if (error) {
            return { error }
            }
            return new User(res)
        })
    }
}

export default class UsersController {
    static async register(req, res) {
        try {
            req.body.avatarFile = "assets/img/avatars/" + req.body.sex + ".jpg"
            const userFromBody = req.body
            
            let errors = {}
            if (userFromBody && userFromBody.password.length < 8) {
                res.render("registration", { error: "Your password must be at least 8 characters." })
                return
            }
            if (userFromBody && userFromBody.username.length < 3) {
                res.render("registration", { error: "You must specify a username of at least 3 characters." })
                return
            }
            console.log(userFromBody);
            
            const userInfo = {
                ...userFromBody,
                password: await hashPassword(userFromBody.password),
            }
            console.log(userInfo);
        
            const insertResult = await UsersDAO.addUser(userInfo)
            if (!insertResult.success) {
                res.render("registration", {error: insertResult.error} )
                return
            }
            const userFromDB = await UsersDAO.getUserByUserName(userInfo.username)
            if (!userFromDB) {
                res.render("registration", {error: "Internal error, please try again later"} )
                return
            }
        
            const user = new User(userFromDB)
            res.cookie("token", user.encoded())

            res.redirect("/users/profile")
        } catch (e) {
            res.status(500).json({ error: e })
        }
    }


    static async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email || typeof email !== "string") {
                res.render("login", { error: "Bad email format, expected string." })
                return
            }
            if (!password || typeof password !== "string") {
                res.render("login", { error: "Bad password format, expected string." })
                return
            }
            let userData = await UsersDAO.getUserByEmail(email)
            if (!userData) {
                res.render("login", { error: "Make sure your email is correct." })
                return
            }
            const user = new User(userData)

            if (!(await user.comparePassword(password))) {
                res.render("login", { error: "Make sure your password is correct." })
                return
            }
            const loginResponse = await UsersDAO.loginUser(user.username, user.encoded())
            if (!loginResponse.success) {
                res.render("login", { error: loginResponse.error })
                return
            }

            res.cookie("token", user.encoded())

            res.redirect("/")
        } catch (e) {
            console.error("Login error:", e)
            res.redirect("/")
        }
    }
    
    static async logout(req, res) {
        try {
            const userJwt = req.cookies.token
            const userObj = await User.decoded(userJwt)
            var { error } = userObj
            if (error) {
                res.redirect("/")
                return
            }
            res.clearCookie("token")

            const logoutResult = await UsersDAO.logoutUser(userObj.username)
            var { error } = logoutResult
            if (error) {
                res.redirect("/")
                return
            }

            res.redirect("/")
        } catch (e) {
            console.error("Error at logout user", e)
            res.redirect("/")
        }
    }
    
    static async update(req, res) {
        try {
            const userJwt = req.cookies.token
            const userFromHeader = await User.decoded(userJwt)
            var { error } = userFromHeader
            if (error) {
                res.redirect("/")
                return
            }

            await UsersDAO.editUser(userFromHeader.username,req.body)

            res.redirect("/users/profile")
        } catch (e) {
            console.error("Error at update user", e)
            res.redirect("/")
        }
    }

    static async getProfile(req, res) {
        try {
            const userJwt = req.cookies.token
            const userFromHeader = await User.decoded(userJwt)
            var { error } = userFromHeader
            if (error) {
                res.redirect("/")
                return
            }
            
            let result = await UsersDAO.getUserByUserName(userFromHeader.username)
            
            res.redirect("/users/" + result.username)
        } catch (e) {
            console.error("Error at get profile", e)
            res.redirect("/")
        }
    }

    static async getInfo(req, res) {
        try {
            const userJwt = req.cookies.token
            const userFromHeader = await User.decoded(userJwt)
            var { error } = userFromHeader
            if (error) {
                res.redirect("/")
                return
            }
            let result = await UsersDAO.getUserByUserName(req.params.username)
            let status = await UsersDAO.getUsers()
            // Update: Update own information only
            res.render("user", { user: result, status: status, update: (result.username == userFromHeader.username) })
        } catch (e) {
            console.error("Error at get info user", e)
            res.redirect("/")
        }
    }
    
    static async getLogin(req, res) {
        res.render("login")
    }

    static async getRegister(req, res) {
        res.render("registration")
    }

    static async getUpdate(req, res) {
        try {
            const userJwt = req.cookies.token
            const userFromHeader = await User.decoded(userJwt)
            var { error } = userFromHeader
            if (error) {
                res.redirect("/")
                return
            }
            let result = await UsersDAO.getUserByUserName(userFromHeader.username)
            let status = await UsersDAO.getUsers()
            // Update: Update own information only
            res.render("infoUpdate", { user: result, status: status })
        } catch (e) {
            console.error("Error at get info user", e)
            res.redirect("/")
        }
    }
}