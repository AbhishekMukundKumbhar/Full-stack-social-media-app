const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const { INSERT_USER_WITHOUT_PIC, INSERT_USER_WITH_PIC, USER_EXIST, GET_FOLLOWERS, GET_FOLLOWING, INSERT_FOLLOWER, INSERT_FOLLOWING, DELETE_FOLLOWER, DELETE_FOLLOWING, UPDATE_PROFILE_PIC, SEARCH_USER } = require('../db/userQuery');
const { GET_MY_POSTS } = require('../db/postQuery');
const { JWT_SECRET_KEY } = require('../keys');

class userController {

    hashingPassword = async (password) => {
        try {
            const hashedPass = await bcrypt.hash(password, 12);
            return hashedPass;
        } catch (error) {
            throw error;
        }
    }

    signup = async (req, res) => {
        const { name, email, password, url } = req.body;
        if (!name && !email && !password) {
            return res.status(422).json({ error: "please provide all the fields" });
        }
        try {
            const userExist = await db(USER_EXIST, [`${email}`], {});
            if (userExist.rows.length !== 0) {
                return res.json({ error: "user already exist with same email" });
            }
            const hashedPassword = await this.hashingPassword(password);
            let result = undefined;
            if (url) {
                result = await db(INSERT_USER_WITH_PIC, [`${email}`, `${name}`, `${hashedPassword}`, url], { autoCommit: true });
            } else {
                result = await db(INSERT_USER_WITHOUT_PIC, [`${email}`, `${name}`, `${hashedPassword}`], { autoCommit: true });
            }
            if (result) {
                return res.status(200).json({ message: "Signup is sccessfull" });
            }
            else {
                res.status(401).json({ error: 'Signup is failed' });
            }

        } catch (error) {
            res.status(422).json("signup is failed due to " + error);
        }
    }

    signin = async (req, res) => {
        const { email, password } = req.body;
        if (!email && !password) {
            return res.status(422).json({ error: "plaese provide the valid email and password" });
        }
        try {
            const userExist = await db(USER_EXIST, [`${email}`], {});
            console.log(userExist.rows);
            if (userExist.rows.length == 0) {
                return res.status(422).json({ error: "invalid email or password" });
            } else {
                const userDetails = userExist.rows[0];
                const doMatch = await bcrypt.compare(password, userDetails[2]);
                if (doMatch) {
                    let token = jwt.sign({ user: userDetails }, JWT_SECRET_KEY);
                    const user = {
                        email: userDetails[0],
                        name: userDetails[1],
                        profile_pic: userDetails[3]
                    }
                    return res.status(200).json({ message: "Successfully signed in", token, user });
                } else {
                    return res.status(422).json({ error: "invalid email or password" });
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    filterNull = (array) => {
        let newArray = array.filter(item => {
            return item != null;
        });
        return newArray;
    }

    getFollowers = async (email) => {
        try {
            let followers = await db(GET_FOLLOWERS, [email], {});
            if (followers.rows.length == 0) {
                followers = [];
                return followers;
            } else {
                followers = followers.rows.map(itemArray => {
                    return itemArray[0];
                });
                followers = this.filterNull(followers);
                return followers;
            }
        } catch (error) {
            throw error;
        }
    }

    getFollowing = async (email) => {
        try {
            let following = await db(GET_FOLLOWING, [email], {});
            if (following.rows.length == 0) {
                following = [];
                return following;
            } else {
                following = following.rows.map(itemArray => {
                    return itemArray[0];
                });
                following = this.filterNull(following);
                return following;
            }
        } catch (error) {
            throw error;
        }

    }
    getUserAndPosts = async (req, res) => {
        const { email } = req.params;
        if (!email) {
            return res.status(422).json({ error: 'User id in not valid or not available' });
        }
        try {
            const userExist = await db(USER_EXIST, [email], {});
            if (userExist.rows.length == 0) {
                return res.status(422).json({ error: "invalid email or password" });
            } else {
                let followers = await this.getFollowers(email);
                let following = await this.getFollowing(email);
                const userDetails = userExist.rows[0];
                const user = {
                    email: userDetails[0],
                    name: userDetails[1],
                    profile_pic: userDetails[3],
                    followers,
                    following
                }
                let posts = await db(GET_MY_POSTS, [`${user.email}`], {});
                if (posts.rows.length == 0) {
                    posts = [];
                } else {
                    posts = posts.rows.map(post => {
                        return {
                            title: post[0],
                            body: post[1],
                            photo: post[2],
                            postedby: post[3]
                        }
                    })
                }
                return res.status(200).json({ message: 'Data fetched successfully', user, posts });
            }

        } catch (error) {
            console.log(error);
            res.status(404).json({ error: `user not found due to ${error}` });
        }
    }

    follow = async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(422).json({ error: 'Please provide email' });
        }
        const loggedUserEmail = req.user[0];
        try {
            const result = await db(INSERT_FOLLOWER, [email, loggedUserEmail], { autoCommit: true });
            if (result) {
                const result2 = await db(INSERT_FOLLOWING, [loggedUserEmail, email], { autoCommit: true });
                if (result2) {
                    let followers = await this.getFollowers(email);
                    return res.status(200).json({ message: 'Following successfully', profileFollowers: followers });
                }
            }
        } catch (error) {
            console.log(error);
            res.status(404).json({ error: `follow operation is failed due to ` + error });
        }
    }
    unfollow = async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(422).json({ error: 'Please provide email' });
        }
        const loggedUserEmail = req.user[0];
        try {
            const result = await db(DELETE_FOLLOWER, [email, loggedUserEmail], { autoCommit: true });
            if (result) {
                const result2 = await db(DELETE_FOLLOWING, [loggedUserEmail, email], { autoCommit: true });
                if (result2) {
                    let followers = await this.getFollowers(email);
                    return res.status(200).json({ message: 'Unfollowing successfully', profileFollowers: followers });
                }
            }
        } catch (error) {
            console.log(error);
            res.status(404).json({ error: `follow operation is failed due to ` + error });
        }
    }

    getProfileFollowDetails = async (req, res) => {
        try {
            let followers = await this.getFollowers(req.user[0]);
            let following = await this.getFollowing(req.user[0]);
            res.status(200).json({ message: 'Data fetched successfully', followers, following })
        } catch (error) {
            console.log(error);
            res.status(404).json({ error: `Getting details failed due to ` + error });
        }

    }

    updateProfilePic = async (req, res) => {
        const { url } = req.body;
        const email = req.user[0];
        if (!url) {
            return res.status(422).json({ error: 'Image url is not available' });
        }
        try {
            let result = await db(UPDATE_PROFILE_PIC, [url, email], { autoCommit: true });
            if (result) {
                res.json({ message: 'Profile pic updated successfully' });
            }
        } catch (error) {
            res.status(404).json({ error: 'updating profile is failed due to ' + error })
            console.log(error);
        }
    }

    searchUser = async (req, res) => {
        const { query } = req.body;
        if (query) {
            try {
                let result = await db(SEARCH_USER, [`%${query}%`], {});
                if(result.rows.length==0){
                    return res.status(200).json({message : 'User does not exist with this name',users : []});
                }
                else{
                    result = result.rows.map(userArray => {
                    return ({
                        email: userArray[0],
                        name: userArray[1],
                        profile_pic: userArray[3]
                    });
                });
                result = result.filter(user=> user.email !== req.user[0]);
                return res.status(200).json({message : 'Data fetched successfully',users : result});
                }
                
            } catch (error) {
                console.log(error);
            }
        } else{
            return res.status(200).json({message : 'Please type to search',users : []});
        }

    }
}

module.exports = new userController();
