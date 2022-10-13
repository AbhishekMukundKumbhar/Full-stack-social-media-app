const db = require('../db/db');
const _ = require('lodash');
const { CREATE_POST, GET_ALL_POSTS, GET_MY_POSTS, LIKE_POST, UNLIKE_POST, GET_POST, LIKED_USERS, LIKED_USERS_LIKE_UNLIKE, DELETE_LIKES, DELETE_POST, GET_FOLLOWING_USER_POSTS } = require('../db/postQuery');
const { GET_ALL_COMMENTS, ADD_COMMENT, DELETE_COMMENTS } = require('../db/commentQuery');
const { GET_PROFILE_PICS } = require('../db/userQuery');

class PostController {

    assignProfilePicWithPost = async (allPosts) => {
        let profilePics = await db(GET_PROFILE_PICS, [], {});
        profilePics = profilePics.rows.map(user => {
            return ({
                email: user[0],
                profile_pic: user[1]
            });
        });
        function update(allPosts, profilePics) {
            var findProfile = email => profilePics.find(user => user.email === email);
            allPosts.forEach(post => {
                var profilePic = findProfile(post.postedby_email);
                var { profile_pic } = profilePic;
                Object.assign(post, { profile_pic });
            });
            return allPosts;
        }
        allPosts = update(allPosts, profilePics);
        return allPosts;
    }

    postsMapping = async(posts) =>{
        posts = posts.rows.map(post => {
            return {
                title: post[0],
                body: post[1],
                photo: post[2],
                postedby_email: post[3],
                postedby: post[4],
                post_id: post[5],
                likes: post[6]
            }
        });
        return posts;
    }

    getAllPosts = async (req, res) => {
        try {
            const result = await db(GET_ALL_POSTS, [], {});
            let likedUsers = await db(LIKED_USERS, [], {});
            let allComments = await db(GET_ALL_COMMENTS, [], {});
            if (result.rows.length == 0) {
                return res.status(200).json({ message: "Sorry there is no posts are available", posts: [] });
            }
            if (allComments.rows.length == 0) {
                allComments = [];
            } else {
                allComments = allComments.rows.map(comment => {
                    return {
                        post_id: comment[0],
                        commented_by: comment[1],
                        comment_text: comment[2]
                    }
                })
            }
            if (likedUsers.rows.length !== 0) {
                likedUsers = likedUsers.rows.map(liked => {
                    return (
                        {
                            post_id: liked[0],
                            liked_by: liked[1]
                        }
                    )
                });
            } else {
                likedUsers = [];
            }
            let allPosts =  await this.postsMapping(result);
            allPosts = await this.assignProfilePicWithPost(allPosts);
            res.status(200).json({ posts: allPosts, likedUsers, allComments });
        } catch (error) {
            res.status(401).json({ error: "getting all posts failed due to " + error });
        }
    }

    getMyPosts = async (req, res) => {
        const user = req.user[0];
        try {
            const result = await db(GET_MY_POSTS, [user], {});
            if (result.rows.length == 0) {
                return res.status(200).json({ message: "Sorry, you have empty posts", posts: [] });
            }
            let allPosts = result.rows.map(post => {
                return {
                    title: post[0],
                    body: post[1],
                    photo: post[2],
                    postedby: post[3]
                }
            });
            res.status(200).json({ posts: allPosts });
        } catch (error) {
            res.status(401).json({ error: 'fetching all my posts failed due to ' + error });
        }
    }

    createPost = async (req, res) => {
        const { title, body, photoUrl } = req.body;
        if (!title && !body && !photoUrl) {
            return res.status(422).json({ error: "please provide all the fields" });
        }
        try {
            const postedByEmail = req.user[0];
            const postedByName = req.user[1];
            const result = await db(CREATE_POST, [`${title}`, `${body}`, `${photoUrl}`, postedByEmail, postedByName], { autoCommit: true });
            if (result) {
                return res.status(200).json({ message: "Post is created successfully" });
            } else {
                return res.status(401).json({ error: "post creating is failed" });
            }
        } catch (error) {
            res.status(404).json({ error: "creating post is failed due to " + error });
        }
    }

    likePost = async (req, res) => {
        const { post_id } = req.body;
        if (!post_id) {
            return res.status(422).json({ error: "id is not available" });
        }
        try {
            const postedByEmail = req.user[0];
            const result = await db(LIKE_POST, [post_id, `${postedByEmail}`], { autoCommit: true });
            if (result) {
                const updatedPost = await db(GET_POST, [post_id], {});
                if (updatedPost.rows.length == 0) {
                    return res.status(200).json("Sorry, you have empty posts");
                }
                let updatedLike = await db(LIKED_USERS_LIKE_UNLIKE, [post_id, `${postedByEmail}`], {});
                if (updatedLike.rows.length === 0) {
                    updatedLike = [];
                } else {
                    updatedLike = updatedLike.rows.map(liked => {
                        return (
                            {
                                post_id: liked[0],
                                liked_by: liked[1]
                            }
                        )
                    });
                }
                let finalPost =  await this.postsMapping(updatedPost);
                finalPost = await this.assignProfilePicWithPost(finalPost);
                return res.status(200).json({ updated_post: finalPost, updated_like: updatedLike, message: "Post is liked" });
            } else {
                return res.status(401).json({ error: "post is not liked" });
            }
        } catch (error) {
            res.status(404).json({ error: "liking post is failed due to " + error });
        }
    }
    unlikePost = async (req, res) => {
        const { post_id } = req.body;
        if (!post_id) {
            return res.status(422).json({ error: "id is not available" });
        }
        try {
            const postedByEmail = req.user[0];
            const result = await db(UNLIKE_POST, [post_id, `${postedByEmail}`], { autoCommit: true });
            if (result) {
                const updatedPost = await db(GET_POST, [post_id], {});
                if (updatedPost.rows.length == 0) {
                    return res.status(200).json("Sorry, you have empty posts");
                }
                let unlikedpost = [{
                    post_id: post_id,
                    liked_by: postedByEmail
                }];
                let finalPost =  await this.postsMapping(updatedPost);
                finalPost = await this.assignProfilePicWithPost(finalPost);
                return res.status(200).json({ updated_post: finalPost, unlikedpost, message: "Post is unliked" });
            } else {
                return res.status(401).json({ error: "post is not unliked" });
            }
        } catch (error) {
            res.status(404).json({ error: "unliking post is failed due to " + error });
        }
    }

    addComment = async (req, res) => {
        const { post_id, comment_text } = req.body;
        const user = req.user[1];
        if (!post_id && !comment_text) {
            return res.status(422).json({ error: 'please provide all the filelds' })
        }
        try {
            const result = await db(ADD_COMMENT, [post_id, `${user}`, `${comment_text}`], { autoCommit: true });
            if (result) {
                const updatedPost = await db(GET_POST, [post_id], {});
                if (updatedPost.rows.length == 0) {
                    return res.status(200).json("Sorry, you have empty posts");
                }
                let finalPost =  await this.postsMapping(updatedPost);
                finalPost = await this.assignProfilePicWithPost(finalPost);
                let addedComment = {
                    post_id,
                    commented_by: user,
                    comment_text
                }
                res.status(200).json({ message: 'comment added successfully', addedComment, updated_post: finalPost });
            }
        } catch (error) {
            console.log(error);
        }
    }

    deletePost = async (req, res) => {
        const {post_id} = req.params;
        if (!post_id) {
            return res.status(422).json({ message: 'please provide valid id' });
        }
        try {
            const data = await db(GET_POST, [post_id], {});
            const post = data.rows[0];
            let finalPost =  await this.postsMapping(data);
            if (post[5] == post_id && post[3] == req.user[0]) {
                const delCmt = await db(DELETE_COMMENTS, [post_id], { autoCommit: true });
                const delLikes = await db(DELETE_LIKES, [post_id], { autoCommit: true });
                const delPost = await db(DELETE_POST, [post_id], { autoCommit: true });
                res.status(200).json({ message: 'Post is deleted is sucessfully', deletedPost: finalPost })
            }
        } catch (error) {
            console.log(error);
        }
    }

    getFollowingUserPosts = async (req, res) => {
        try {
            const loggedUserEmail = req.user[0];
            const result = await db(GET_FOLLOWING_USER_POSTS, [loggedUserEmail], {});
            let likedUsers = await db(LIKED_USERS, [], {});
            let allComments = await db(GET_ALL_COMMENTS, [], {});
            if (result.rows.length == 0) {
                return res.status(200).json({ message: "Sorry there is no posts are available", posts: [] });
            }
            if (allComments.rows.length == 0) {
                allComments = [];
            } else {
                allComments = allComments.rows.map(comment => {
                    return {
                        post_id: comment[0],
                        commented_by: comment[1],
                        comment_text: comment[2]
                    }
                })
            }
            if (likedUsers.rows.length !== 0) {
                likedUsers = likedUsers.rows.map(liked => {
                    return (
                        {
                            post_id: liked[0],
                            liked_by: liked[1]
                        }
                    )
                });
            } else {
                likedUsers = [];
            }
            let allPosts =  await this.postsMapping(result);
            allPosts = await this.assignProfilePicWithPost(allPosts);
            res.status(200).json({ posts: allPosts, likedUsers, allComments });
        } catch (error) {
            res.status(401).json({ error: "getting all posts failed due to " + error });
        }
    }

}

module.exports = new PostController();