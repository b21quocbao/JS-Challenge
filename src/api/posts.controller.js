import postsDAO from "../dao/postsDAO"
import usersDAO from "../dao/usersDAO"
import { User } from "./users.controller"

export default class PostsController {

    static async apiGetPosts(req, res) {
        try {
            let posts = await postsDAO.getPosts()

            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.render("post-list", { posts: posts })
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            let status = await usersDAO.getUsers()
            res.render("post-list", { posts: posts, user: user, status: status })
        } catch (e) {
            console.log("API get posts error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetPostById(req, res) {
        try {
            let post = await postsDAO.getPostById(req.params.id)
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.render("post", { post: post })
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            let status = await usersDAO.getUsers()
            if (!post) {
                res.redirect("/posts/list")
                return
            }
            res.render("post", {  post: post, user: user, status: status })
        } catch (e) {
            console.log("API get post by Id error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetEditPost(req, res) {
        try {
            let post = await postsDAO.getPostById(req.params.id)
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error || !post) {
                res.redirect("/posts/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            let status = await usersDAO.getUsers()
            res.render("editPost", { post: post, user: user, status: status })
        } catch (e) {
            console.log("API get edit post error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetAddPost(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/posts/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            let status = await usersDAO.getUsers()
            res.render("addPost", { user: user, status: status })
        } catch (e) {
            console.log("API get edit post error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiUpdatePostById(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/posts/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            if (!user.post) {
                res.redirect("/posts/list")
                return
            }
            
            await postsDAO.updatePost(req.body, user.username, req.params.id)

            res.redirect("/posts/list")
        } catch (e) {
            console.log("API update post by id error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiAddPost(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/posts/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            if (!user.post) {
                res.redirect("/posts/list")
                return
            }

            await postsDAO.updatePost(req.body, user.username)

            res.redirect("/posts/list")
        } catch (e) {
            console.log("API update post by id error", e)
            res.status(500).json({ error: e })
        }
    }

    static async apiDeletePostById(req, res) {
        try {
            let { username, error } = await User.decoded(req.cookies.token)
            
            if (error) {
                res.redirect("/posts/list")
                return
            }

            let user = await usersDAO.getUserByUserName(username)
            if (!user.post) {
                res.redirect("/posts/list")
                return
            }
            
            await postsDAO.deletePostbyId(req.params.id)

            res.redirect("/posts/list")
        } catch (e) {
            console.log("API delete post by id error", e)
            res.status(500).json({ error: e })
        }
    }

    
}