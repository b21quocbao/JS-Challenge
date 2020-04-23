import { ObjectId } from "bson"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import UsersDAO from "../dao/usersDAO"
import PreRegistersDAO from "../dao/preRegistersDAO";
import formidable from "formidable"
import nodemailer from "nodemailer"
let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
       user: 'jschallengeteam1@gmail.com',
       pass: 'baokienthong'
    }
});

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
    encoded(long = false) {
        let l = 0
        if (long) {
            l = 60 * 60 * 24 * 30
        } else {
            l = 60 * 30
        }
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
    static async preRegister(req, res) {
        try {
            console.log(req.body);
            req.body.avatarFile = "assets/img/avatars/" + req.body.sex + ".jpg"
            const userFromBody = req.body

            if (userFromBody && userFromBody.password.length < 8) {
                res.render("register", { error: "Your password must be at least 8 characters." })
                return
            }
            if (userFromBody && userFromBody.username.length < 3) {
                res.render("register", { error: "You must specify a username of at least 3 characters." })
                return
            }
            if (userFromBody && !userFromBody.email.includes("@fpt.edu.vn")) {
                res.render("register", { error: "You must enter an email from FPT University" })
                return
            }

            if (userFromBody && userFromBody.role === 'Choose here...') {
                res.render("register", { error: "Bạn phải chọn ban của mình" })
                return
            }
            
            const userInfo = {
                ...userFromBody,
                password: await hashPassword(userFromBody.password),
            }
            if (await UsersDAO.getUserByEmail(userFromBody.email)) {
                res.render("register", {error: "Email is already exists"} )
                return
            }
            if (await UsersDAO.getUserByUserName(userFromBody.username)) {
                res.render("register", {error: "Username is already exists" } )
                return
            }
            let otp = await PreRegistersDAO.insertPreRegister(userInfo)
            const message = {
                from: 'jschallengeteam1@gmail.com', 
                to: userFromBody.email,        
                subject: 'Your OTP for your register',
                text: 'Chào bạn\nCảm ơn bạn đã đến với CLB JS của chúng mình\nĐây là mã OTP của bạn: ' + otp.toString()
            };
            transport.sendMail(message, function(err, info) {
                if (err) {} else {}
            });
            res.redirect("/users/otp/register")
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: e })
        }
    }

    static async register(req, res) {
        try {
            const userInfo = await PreRegistersDAO.getUserByOTP(parseInt(req.body.otp))
            if (!userInfo) {
                res.render("register", {error: "Wrong or expired OTP. Please register again"} )
                return
            }

            const insertResult = await UsersDAO.addUser(userInfo.user)
            if (!insertResult.success) {
                res.render("register", {error: insertResult.error} )
                return
            }

            const userFromDB = await UsersDAO.getUserByUserName(userInfo.username)
            if (!userFromDB) {
                res.render("register", {error: "Internal error, please try again later"} )
                return
            }
        
            const user = new User(userFromDB)
            res.cookie("token", user.encoded())

            res.redirect("/users/update")
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
            const loginResponse = await UsersDAO.loginUser(user.username, user.encoded(req.body.remember))
            if (!loginResponse.success) {
                res.render("login", { error: loginResponse.error })
                return
            }
            
            res.cookie("token", user.encoded(req.body.remember))

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
                console.log("dmm");
                res.redirect("/")
                return
            }
            let user = await UsersDAO.getUserByUserName(userFromHeader.username)
            if (req.body.avatarFile === "") {
                req.body.avatarFile = user.avatarFile
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
            return
        } catch (e) {
            console.error("Error at get info user", e)
            res.redirect("/")
        }
    }
    
    static async getLogin(req, res) {
        res.render("login")
    }

    static async getRegister(req, res) {
        res.render("register")
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
    
    static async getOTP (req, res) {
        res.render("otp", { link: req.params.link })
    }
    
    static async getRequest(req, res) {
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
            
            res.render("request", { user: result, status: status })
        } catch (e) {
            console.error("Error at get info user", e)
            res.redirect("/")
        }
    }

    static async getForgot(req, res) {
        res.render("forgot")
    }

    static async forgotEmail(req, res) {
        try {
            let user = await UsersDAO.getUserByEmail(req.body.email)
            if (typeof user === 'undefined' || !user) {
                res.render("forgot", { error: "Email bạn nhập không tồn tại" })
                return
            }
            let otp = await PreRegistersDAO.insertPreRegister(user)
            const message = {
                from: 'jschallengeteam1@gmail.com', 
                to: req.body.email,        
                subject: 'Your OTP for your register',
                text: 'Chào bạn\nCảm ơn bạn đã đến với CLB JS của chúng mình\nĐây là mã OTP của bạn: ' + otp.toString()
            };
            transport.sendMail(message, function(err, info) {
                if (err) {} else {}
            });
            res.redirect("/users/otp/forgot")
        } catch (e) {
            console.error(e)
            res.render("forgot", { error: e })
        }
    }

    static async forgotPassword(req, res) {
        try {
            let userData = await PreRegistersDAO.getUserByOTP(parseInt(req.body.otp))
            if (!userData) {
                res.render("forgot", { error: "Wrong or expired OTP" })
                return
            }
            let user = new User(userData)
            const loginResponse = await UsersDAO.loginUser(user.username, user.encoded())
            if (!loginResponse.success) {
                res.render("login", { error: loginResponse.error })
                return
            }
            res.cookie("token", user.encoded())
            res.redirect("/users/changePassword/0")
        } catch (e) {
            console.error("Unable to post forgot password", e)
            res.redirect("/")
        }
    }

    static async getChangePassword(req, res) {
        try {
            let { error } = await User.decoded(req.cookies.token)
            if (error) {
                res.redirect("/")
                return
            }
            res.render("changePassword", { id: req.params.id })
        } catch (e) {
            console.error("Get chage password error", e)
            res.redirect("/")
        }
    }

    static async changePassword (req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            if (error) {
                res.render("changePassword", { id: req.params.id, error: error })
                return
            }
            let user = await UsersDAO.getUserByUserName(username)
            if (typeof req.body.oldPassword !== 'undefined' && !(await bcrypt.compare(req.body.oldPassword, user.password))) {
                res.render("changePassword", { id: req.params.id, error: "Sai mật khẩu cũ"} )
                return
            }
            user.password = await hashPassword(req.body.newPassword)
            await UsersDAO.editUser(user.username, user)
            res.redirect("/")
        } catch (e) {
            console.error("Changa password error", e)
            res.redirect("/")
        }
    }
}