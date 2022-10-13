import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import M from "materialize-css";

const CreatePost = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState("");
    const navigate = useNavigate();

    useEffect(()=>{
        if(url){
            fetch("/post/createpost",{
                method : "post",
                headers :{
                    "Content-Type" : "application/json",
                    "Authorization" : "Bearer "+localStorage.getItem("jwt")
                },
                body :JSON.stringify({
                    title,
                    body,
                    photoUrl : url
                })
            }).then(res=>res.json())
            .then(data=>{
                if(data.error){
                    M.toast({html: data.error, classes : '#c62828 red'});
                }else{
                    M.toast({html: data.message, classes : '#4caf50 green'});
                   navigate('/');
                }
            }).catch(error=>{
                console.log(error);
            });
        }
    },[url]);

    const postDetails = async()=>{
        const data = new FormData();
        data.append("file",image);
        data.append("upload_preset","instagram-clone");
        data.append("cloud_name","myaccount");

        fetch("https://api.cloudinary.com/v1_1/myaccount/image/upload",{
            method: "post",
            body : data
        }).then(res=>res.json())
        .then(result=>{
            setUrl(result.url);  // when url will get set again useEffect will get trigger
        })
        .catch(err=>console.log(err));
    }

    return (
        <div className="card card-panel input-field"
            style={{
                "margin": "40px auto",
                "maxWidth": "500px",
                "textAlign": "center"
            }}>
            <input type={'text'}
                placeholder='Title'
                value={title}
                onChange = {e=>setTitle(e.target.value)}
            />
            <input type={'text'}
                placeholder='Body'
                value={body}
                onChange = {e=>setBody(e.target.value)}
            />
            <div className="file-field input-field">
                <div className="btn waves-effect waves-light #1e88e5 blue darken-1" >
                    <span>Upload Image</span>
                    <input type="file"
                    onChange={(e)=>setImage(e.target.files[0])}
                     />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" />
                </div>
            </div>
            <button className="btn waves-effect waves-light #1e88e5 blue darken-1" onClick={()=>postDetails()}>Submit Post</button>
        </div>
    )
}

export default CreatePost;