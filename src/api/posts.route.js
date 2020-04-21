import { Router } from "express"
import PostsCtrl from "./posts.controller"
import CommentsCtrl from "./comments.controller"

const router = new Router()

router.route("/add").get(PostsCtrl.apiGetAddPost)
router.route("/add").post(PostsCtrl.apiAddPost)
router.route("/list").get(PostsCtrl.apiGetPosts)
router.route("/:id").get(PostsCtrl.apiGetPostById)
router.route("/edit/:id").get(PostsCtrl.apiGetEditPost)
router.route("/update/:id").post(PostsCtrl.apiUpdatePostById)
router.route("/delete/:id").post(PostsCtrl.apiDeletePostById)
router.route("/:id/addComment/:post").post(CommentsCtrl.addComment)

export default router