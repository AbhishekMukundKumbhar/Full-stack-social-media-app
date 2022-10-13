import React, { useState, useEffect, useContext } from "react";
import { userContext } from "../../App";
import { Link } from "react-router-dom"

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [liked, setLiked] = useState([]);
    const [comments, setComments] = useState([]);
    const { state, dispatch } = useContext(userContext);
    useEffect(() => {
        fetch('/post', {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        }).then(res => res.json())
            .then(result => {
                setPosts(result.posts);
                setLiked(result.likedUsers);
                setComments(result.allComments);
            })
    }, []);

    const likePost = (post_id) => {
        fetch('/post/like', {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                post_id
            })
        }).then(res => res.json())
            .then(result => {
                const updatedPost = result.updated_post[0];
                let likedpost = liked;
                likedpost.push(result.updated_like[0]);
                setLiked(likedpost);
                const newPosts = posts.map(post => {
                    if (post.post_id === updatedPost.post_id) {
                        return updatedPost;
                    } else {
                        return post;
                    }
                });
                setPosts(newPosts);
            }).catch(error => {
                console.log(error);
            })
    }
    const unlikePost = (post_id) => {
        fetch('/post/unlike', {
            method: 'delete',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                post_id
            })
        }).then(res => res.json())
            .then(result => {
                let filteredLikes = liked.filter(item => item.post_id !== result.unlikedpost[0].post_id || item.liked_by !== result.unlikedpost[0].liked_by)
                const updatedPost = result.updated_post[0];
                const newPosts = posts.map(post => {
                    if (post.post_id === updatedPost.post_id) {
                        return updatedPost;
                    } else {
                        return post;
                    }
                });
                setPosts(newPosts);
                setLiked(filteredLikes);
            }).catch(error => {
                console.log(error);
            })
    }

    const makeComment = (post_id, comment_text) => {
        fetch('/post/addcomment', {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                post_id,
                comment_text
            })
        }).then(res => res.json())
            .then(result => {
                const updatedPost = result.updated_post[0];
                const newPosts = posts.map(post => {
                    if (post.post_id === updatedPost.post_id) {
                        return updatedPost;
                    } else {
                        return post;
                    }
                });
                setPosts(newPosts);
                let cmt = comments;
                cmt.push(result.addedComment);
                setComments(cmt);
            }).catch(error => {
                console.log(error);
            })
    }
    const deletePost = (post_id) => {
        fetch(`/post/deletepost/${post_id}`, {
            method: 'delete',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        }).then(res => res.json())
            .then(result => {
                const deletedPost = result.deletedPost[0];
                let updatedPosts = posts.filter(post => (
                    post.post_id !== deletedPost.post_id
                ));
                setPosts(updatedPosts);
            }).catch(error => {
                console.log(error);
            })
    }
    return (
        <div className="home">
            {posts && posts.length != 0 ? posts.map(post => {
                return (
                    <div className="card home_card" key={post.post_id}>
                        <div style={{
                            'display': 'flex',
                            'height': '45px',
                            'margin': '5px 3px'
                        }}>
                            <img src={post.profile_pic} alt='not found' style={{
                                'borderRadius': '50%',
                                'width': '45px'
                            }} />
                            <h5 style={{
                                'marginTop': '10px',
                                'marginLeft': '10px',
                                'width' : '80%'
                            }}>
                                 <Link to={state.email !== post.postedby_email ? '/userprofile/' + post.postedby_email : '/profile'}>{post.postedby}</Link>
                               
                            </h5>
                                {
                                    (state.name == post.postedby) && <i className="material-icons" style={{ 'marginTop':'10px', 'cursor' : 'pointer' }} onClick={() => deletePost(post.post_id)}>delete</i>
                                }
                        </div>

                        <div className="card-image">
                            <img src={post.photo}
                                alt="image not found"
                            />
                        </div>
                        <div className="card-content">
                            <i className="material-icons" style={{ "color": "red" }}>favorite</i>
                            {
                                liked.filter(like => like.post_id == post.post_id && like.liked_by === state.email).length > 0 ?
                                    <i className="material-icons" style={{ "color": "blue", "cursor" : "pointer" }} onClick={() => unlikePost(post.post_id)}>thumb_down</i> :
                                    <i className="material-icons" style={{ "color": "blue", "cursor" : "pointer" }} onClick={() => likePost(post.post_id)}>thumb_up</i>
                            }
                            <p>{post.likes} Likes</p>
                            <h6>{post.title}</h6>
                            <p>{post.body}</p>
                            {
                                comments.length > 0 ? comments.map(comment => {
                                    if (comment.post_id == post.post_id) {
                                        return (
                                            <h6><span style={{ 'fontWeight': 'bold' }}>{comment.commented_by}</span>{' : ' + comment.comment_text}</h6>
                                        )
                                    }
                                })
                                    : ''
                            }
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                makeComment(post.post_id, e.target[0].value);
                                e.target[0].value = '';
                            }}>
                                <input type={"text"} placeholder="add a comment" />
                            </form>
                        </div>
                    </div>
                )
            })
                :
                <div>
                    <h3 style={{ "margin": "auto auto" }}>Ooops...! There is no posts available.</h3>
                </div>
            }

        </div>
    )
}

export default Home;