import { Router } from "express"
import UsersCtrl, { User } from "./users.controller"
import cookieParser from "cookie-parser"

const router = new Router()

router.route("/login").get(UsersCtrl.getLogin)
router.route("/login").post(UsersCtrl.login)
router.route("/logout").get(UsersCtrl.logout)
router.route("/register").post(UsersCtrl.preRegister)
router.route("/otp/register").post(UsersCtrl.register)
router.route("/register").get(UsersCtrl.getRegister)
router.route("/profile").get(UsersCtrl.getProfile)
router.route("/update").get(UsersCtrl.getUpdate)
router.route("/update").post(UsersCtrl.update)
router.route("/otp/:link").get(UsersCtrl.getOTP)
router.route("/request").get(UsersCtrl.getRequest)
// router.route("/request").post(UsersCtrl.request)
router.route("/otp/forgot").post(UsersCtrl.forgotPassword)
router.route("/forgot").get(UsersCtrl.getForgot)
router.route("/forgot/email").post(UsersCtrl.forgotEmail)
router.route("/a").get(UsersCtrl.getLogin)
router.route("/:username").get(UsersCtrl.getInfo)
router.route("/changePassword/:id").get(UsersCtrl.getChangePassword)
router.route("/changePassword/:id").post(UsersCtrl.changePassword)

export default router