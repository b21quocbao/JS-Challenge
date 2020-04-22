import { Router } from "express"
import UsersCtrl from "./users.controller"
import cookieParser from "cookie-parser"

const router = new Router()

router.route("/login").get(UsersCtrl.getLogin)
router.route("/login").post(UsersCtrl.login)
router.route("/logout").get(UsersCtrl.logout)
router.route("/register").post(UsersCtrl.preRegister)
router.route("/otp").post(UsersCtrl.register)
router.route("/register").get(UsersCtrl.getRegister)
router.route("/profile").get(UsersCtrl.getProfile)
router.route("/update").get(UsersCtrl.getUpdate)
router.route("/update").post(UsersCtrl.update)
router.route("/otp").get(UsersCtrl.getOTP)
router.route("/request").get(UsersCtrl.getRequest)
// router.route("/request").post(UsersCtrl.request)
router.route("/:username").get(UsersCtrl.getInfo)

export default router