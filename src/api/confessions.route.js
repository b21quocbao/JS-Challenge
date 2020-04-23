import { Router } from "express"
import ConfessionsCtrl from "./confessions.controller"
import CommentsCtrl from "./comments.controller"

const router = new Router()

router.route("/add").get(ConfessionsCtrl.apiGetAddConfession)
router.route("/add").post(ConfessionsCtrl.apiAddConfession)
router.route("/list").get(ConfessionsCtrl.apiGetConfessions)
router.route("/check").get(ConfessionsCtrl.apiGetCheckConfessions)
router.route("/:id/accept").post(ConfessionsCtrl.apiAcceptConfession)
router.route("/:id/decline").post(ConfessionsCtrl.apiDeclineConfession)

router.route("/:id/addComment/:post").post(CommentsCtrl.addComment)

export default router