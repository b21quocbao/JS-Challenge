import { Router } from "express"
import OthersCtrl from "./others.controller"

const router = new Router()

router.route("/").get(OthersCtrl.mainPage)
router.route("/index").get(OthersCtrl.apiGetIndex)
router.route("/about-us").get(OthersCtrl.apiGetIndex)

export default router