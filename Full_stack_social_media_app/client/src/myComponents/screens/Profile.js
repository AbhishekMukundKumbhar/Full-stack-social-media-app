import React, { useContext, useEffect, useState } from "react";
import { userContext } from "../../App";

const Profile = () => {
    const { state, dispatch } = useContext(userContext);
    const [posts, setPosts] = useState([]);
    const [followers, setfollowers] = useState([]);
    const [following, setfollowing] = useState([]);
    const [image, setImage] = useState('');
    useEffect(() => {
        fetch('/post/myposts', {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        }).then(res => res.json())
            .then(result => {
                setPosts(result.posts);
            })

        fetch('/user/profilefollowdetails', {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        }).then(res => res.json())
            .then(result => {
                setfollowers(result.followers);
                setfollowing(result.following);
            })

        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "instagram-clone");
            data.append("cloud_name", "myaccount");

            fetch("https://api.cloudinary.com/v1_1/myaccount/image/upload", {
                method: "post",
                body: data
            }).then(res => res.json())
                .then(result => {
                    fetch('/user/updateProfilePic', {
                        method: 'put',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem('jwt')
                        },
                        body: JSON.stringify({
                            url: result.url
                        })
                    }).then(res => res.json())
                        .then(dbresult => {
                            localStorage.setItem('user', JSON.stringify({ ...state, profile_pic: result.url }))
                            dispatch({ type: 'UPDATE_PROFILE_PIC', payload: result.url });
                        })
                })
                .catch(err => console.log(err));
        }

    }, [image]);

    const updateProfilePhoto = (file) => {
        setImage(file);
    }
    return (
        <div style={{ "maxWidth": "620px", "margin": "0px auto" }}>
            <div style={{ "margin": "18px 0px", "borderBottom": "1px solid grey" }}>
                <div style={{ "display": "flex", "justifyContent": "space-around" }}>
                    <div>
                        <img style={{ "width": "170px", "height": "170px", "borderRadius": "80px" }}
                            src={state ? state.profile_pic : "Loading"}
                            alt="image is not loaded"
                        />
                    </div>
                    <div>
                        <h4>{state ? state.name : "Loading"}</h4>
                        <h5>{state ? state.email : "Loading"}</h5>
                        <div style={{ "display": "flex", "justifyContent": "space-between", "width": "120%" }}>
                            <h6>{posts.length} posts</h6>
                            <h6>{followers.length} followers</h6>
                            <h6>{following.length} following</h6>
                        </div>
                    </div>
                </div>
                <div className="file-field input-field" style={{ 'margin': '0px 0px 0px 42px' }}>
                    <div className="btn waves-effect waves-light #1e88e5 blue darken-1" >
                        <span>Change Profile Photo</span>
                        <input type="file"
                            onChange={(e) => updateProfilePhoto(e.target.files[0])}
                        />
                    </div>
                    <div className="file-path-wrapper" style={{ 'visibility': 'hidden' }}>
                        <input className="file-path validate" type="text" />
                    </div>
                </div>
            </div>
            <div className="gallery">
                {posts && posts.length != 0 ? posts.map(post => {
                    return (
                        <img className="item" alt="image is not loaded" src={post.photo} style={{ "margin": "3px 0px" }} />
                    )
                }) :
                    <div style={{ "textAlign": "center" }}>
                        <h3>Ooops...! Still not posted anything yet.</h3>
                    </div>
                }
            </div>
        </div>
    )
}

export default Profile;