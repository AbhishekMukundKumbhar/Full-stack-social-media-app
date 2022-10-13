import React,{useState, useContext} from "react";
import { Link, useNavigate } from "react-router-dom";
import M from "materialize-css";
import {userContext} from "../../App";

const Signin = () => {
    const navigate = useNavigate();
    const {state, dispatch} = useContext(userContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const validEmail = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$');

    const postData=()=>{
        if(!validEmail.test(email)){
            M.toast({html: "Please enter valid Email id", classes : '#c62828 red'});
            return;
        }
        if(!(/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) 
        && /[!@#$%^&*()]/.test(password))){
            M.toast({html: "Password must be alphanumeric with special charecter ", classes : '#c62828 red'});
            return;
        }
        fetch("/auth/signin",{
        method : "post",
        headers :{
            "Content-Type" : "application/json"
        },
        body :JSON.stringify({
            email,
            password
        })
    }).then(res=>res.json())
    .then(data=>{
        if(data.error){
            M.toast({html: data.error, classes : '#c62828 red'});
        }else{
            localStorage.setItem("jwt",data.token);
            localStorage.setItem("user",JSON.stringify(data.user));
            dispatch({type : "USER", payload : data.user});
            M.toast({html: data.message, classes : '#4caf50 green'});
           navigate('/');
        }
    }).catch(error=>{
        console.log(error);
    });
    }

    return (
        <div className="my_card">
            <div className="card auth_card card-panel input-field" >
                <h3>post now!</h3>
                <input type={'text'}
                    placeholder='Email id'
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />
                <input type={'password'}
                    placeholder='Password'
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
                <button className="btn waves-effect waves-light #1e88e5 blue darken-1" onClick={()=>postData()}>sign in</button>
                <h5>
                    <Link to={"/signup"}>Don't have account?</Link>
                </h5>
            </div>
        </div>
    )
}

export default Signin;