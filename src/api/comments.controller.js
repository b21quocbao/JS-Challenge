import commentsDAO from "../dao/commentsDAO"
import usersDAO from "../dao/usersDAO"

export default class CommentsController {

    static async addComment( req, res ) {
        try {
            let postId = req.params.id
            let text = req.body.text
            let post = req.params.post
            let user = await usersDAO.getUserById(req.cookies.userId)
            await commentsDAO.addComment(text, user.username, user.avatarFile, post, postId)
            if (post === 1) {
                res.redirect("/posts/" + req.params.id)
            } else {
                res.redirect("/confessions/list")
            }
        } catch (e) {
            console.error(`Unable to add comment ${e}`)
            res.redirect("/")
        }
    }
}