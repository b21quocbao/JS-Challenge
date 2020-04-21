import { Router } from "express"
import ConfessionsCtrl from "./confessions.controller"
import CommentsCtrl from "./comments.controller"

const router = new Router()

router.route("/add").get(ConfessionsCtrl.apiGetAddConfession)
// router.route("/add").post(ConfessionsCtrl.apiAddConfession)
router.route("/list").get(ConfessionsCtrl.apiGetConfessions)
router.route("/:id/addComment/:post").post(CommentsCtrl.addComment)

export default router