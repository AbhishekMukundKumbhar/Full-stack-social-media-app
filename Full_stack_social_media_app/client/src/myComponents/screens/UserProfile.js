import React, { useContext, useEffect, useState } from "react";
import { userContext } from "../../App";
import { useParams } from 'react-router-dom';

const UserProfile = () => {
    const { state, dispatch } = useContext(userContext);
    const [posts, setPosts] = useState([]);
    const [profile, setProfie] = useState(null);
    const [showFollow, setShowFollow] = useState(true);
    const { email } = useParams();
    useEffect(() => {
        fetch(`/user/userprofile/${email}`, {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        }).then(res => res.json())
            .then(result => {
                setProfie(result.user);
                setPosts(result.posts);
            }).catch(error=>{
                console.log(error);
            })
    }, []);

    

    const follow = () =>{
        try {
            fetch(`/user/follow`, {
                method: 'post',
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('jwt'),
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    email : profile.email
                })
            }).then(res => res.json())
                .then(result => {
                    setProfie(current=>{
                        return{
                            ...current,
                            followers : result.profileFollowers
                        }
                    });
                    setShowFollow(false);
                }).catch(error=>{
                    console.log(error);
                })
        } catch (error) {
            console.log(error);  
        }
    }

    const unfollow = () =>{
        try {
            fetch(`/user/unfollow`, {
                method: 'post',
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('jwt'),
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    email : profile.email
                })
            }).then(res => res.json())
                .then(result => {
                    setProfie(current=>{
                        return{
                            ...current,
                            followers : result.profileFollowers
                        }
                    });
                    setShowFollow(true);
                }).catch(error=>{
                    console.log(error);
                })
        } catch (error) {
            console.log(error);  
        }
    }

    return (
        <>
            {profile ?
                <div style={{ "maxWidth": "620px", "margin": "0px auto" }}>
                    <div style={{ "display": "flex", "justifyContent": "space-around", "margin": "18px 0px", "borderBottom": "1px solid grey" }}>
                        <div>
                            <img style={{ "width": "170px", "height": "170px", "borderRadius": "80px" }}
                                src={profile.profile_pic}
                                alt="image is not loaded"
                            />
                        </div>
                        <div>
                            <h4>{profile.name}</h4>
                            <h5>{profile.email}</h5>
                            <div style={{ "display": "flex", "justifyContent": "space-between", "width": "120%" }}>
                                <h6>{posts.length} Posts</h6>
                                <h6>{profile.followers.length} followers</h6>
                                <h6>{profile.following.length} following</h6>
                            </div>
                            {
                                showFollow && !profile.followers.includes(state.email) ? 
                                <button className="btn waves-effect waves-light #1e88e5 green darken-1" onClick={()=>(follow())} style = {{"margin":"10px"}}>follow</button>
                                : <button className="btn waves-effect waves-light #1e88e5 red darken-1" onClick={()=>(unfollow())}  style = {{"margin":"10px"}}>unfollow</button>
                            }
                            
                        </div>
                    </div>
                    <div className="gallery">
                        {posts ? posts.map(post => {
                            return (
                                <img className="item" alt="image is not loaded" src={post.photo} style={{ "margin": "3px 0px" }} />
                            )
                        }) :
                            <h3 style={{ "margin": "auto auto" }}>Ooops...! Still not posted anything yet.</h3>
                        }
                    </div>
                </div>
                : <div style={{"textAlign":"center"}}>
                    <h3>page is loading.....</h3>
                </div>

            }
        </>
    )
}

export default UserProfile;