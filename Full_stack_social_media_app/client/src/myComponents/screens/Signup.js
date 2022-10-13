import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import M from "materialize-css";

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState(undefined);
    const validName = new RegExp(`[A-Z][a-z]{3,}`);
    const validEmail = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$');

    useEffect(()=>{
        if(url){
            postDetails();
        }
    },[url]);

    const postDetails = async () => {
        fetch("/auth/signup", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                url
            })
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    M.toast({ html: data.error, classes: '#c62828 red' });
                } else {
                    M.toast({ html: data.message, classes: '#4caf50 green' });
                    navigate('/signin');
                }
            }).catch(error => {
                console.log(error);
            });
    
    }

    const postData = async () => {
        if (!validName.test(name)) {
            M.toast({ html: "user name should start with upper case with min length 4", classes: '#c62828 red' });
            return;
        }
        if (!validEmail.test(email)) {
            M.toast({ html: "Please enter valid Email id", classes: '#c62828 red' });
            return;
        }
        if (!(/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
            && /[!@#$%^&*()]/.test(password))) {
            M.toast({ html: "Password must be alphanumeric with special charecter ", classes: '#c62828 red' });
            return;
        }
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
                    setUrl(result.url);  // when url will get set again useEffect will get trigger
                })
                .catch(err => console.log(err));
        }
        else{
            postDetails();
        }
    }
    return (
        <div className="my_card">
            <div className="card auth_card card-panel input-field" >
                <h3>post now!</h3>
                <input type={'text'}
                    placeholder='User name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input type={'text'}
                    placeholder='Email id'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input type={'password'}
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="file-field input-field">
                    <div className="btn waves-effect waves-light #1e88e5 blue darken-1" >
                        <span>Profile Photo</span>
                        <input type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" />
                    </div>
                </div>
                <button className="btn waves-effect waves-light #1e88e5 blue darken-1" onClick={() => postData()}>sign up</button>
                <h5>
                    <Link to={"/signin"}>Already have account?</Link>
                </h5>
            </div>
        </div>
    )
}

export default Signup;