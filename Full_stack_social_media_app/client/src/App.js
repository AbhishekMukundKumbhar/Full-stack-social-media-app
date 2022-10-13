import React, { useEffect, createContext, useReducer, useContext } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './myComponents/Navbar';
import Profile from './myComponents/screens/Profile';
import Home from './myComponents/screens/Home';
import Signin from './myComponents/screens/Signin';
import Signup from './myComponents/screens/Signup';
import CreatePost from './myComponents/screens/CreatePost';
import UserProfile from './myComponents/screens/UserProfile';
import FollowingUserPosts from './myComponents/screens/FollowingUserPosts';
import {initialState,reducer} from './reducer/userReducer';

export const userContext = createContext();

const Routing = () => {
  const navigate = useNavigate();
  const {state, dispatch} = useContext(userContext);
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem('user'));
    if(user){
      dispatch({type : 'USER', payload : user});
    }
    else{
      navigate('/signin');
    }
  },[]);
  return (
    <Routes>
      <Route exact path='/' element={<Home />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/signin' element={<Signin />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/createPost' element={<CreatePost />} />
      <Route path='/followingUserPosts' element={<FollowingUserPosts />} />
      <Route path='/userprofile/:email' element={<UserProfile />} />
    </Routes>
  )
}

function App() {
  const [state,dispatch] = useReducer(reducer,initialState);
  return (
    <userContext.Provider value={{state,dispatch}}>
    <BrowserRouter>
      <Navbar />
      <Routing />
    </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
