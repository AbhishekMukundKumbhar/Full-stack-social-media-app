import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "../App";
import M from "materialize-css";

const Navbar = () => {
  const searchModal = useRef(null);
  const logouthModal = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [searchTextMsg, setSearchTextMsg] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const { state, dispatch } = useContext(userContext);
  const navigate = useNavigate();
  useEffect(() => {
    M.Modal.init(searchModal.current);
    M.Modal.init(logouthModal.current);
  }, []);

  const logout = () => {
    localStorage.clear();
    dispatch({ type: "CLEAR" });
    navigate('/signin');
  }

  const searchUsers = (query) => {
    setSearchText(query);
    fetch('/user/search-user', {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem('jwt')
      },
      body: JSON.stringify({
        query
      })
    }).then(res => res.json())
      .then(result => {
        setUserDetails(result.users);
        setSearchTextMsg(result.message);
      }).catch(err => {
        console.log(err);
      })
  }
  const closeModal = () => {
    M.Modal.getInstance(searchModal.current).close();
    setSearchText('');
    setUserDetails([]);
    setSearchTextMsg('Please type to search');
  }
  const renderList = () => {
    if (state) {
      return [
        <li><i data-target="modal1" className="material-icons modal-trigger" style={{ "color": "black", "cursor": "pointer" }}>search</i></li>,
        <li><Link to="/profile" key="profile">Profile</Link></li>,
        <li><Link to="/followingUserPosts" key="followingUserPosts">Following user posts</Link></li>,
        <li><Link to="/createPost" key="createpost">Create Post</Link></li>,
        <li>
          <button data-target="modal2" className="modal-trigger btn waves-effect waves-light #f44336 red" key="logout">logout</button>
        </li>
      ]
    } else {
      return [
        <li><Link to="/signin" key="signin">Signin</Link></li>,
        <li><Link to="/signup" key="signup">Signup</Link></li>
      ]
    }
  }
  return (
    <nav>
      <div className="nav-wrapper">
        <img src="https://res.cloudinary.com/myaccount/image/upload/v1665163026/20221007_154704_0000_yayxwo.png" alt="not found" style={{'height': '63px','width' : '63px'}}/>
        <Link to={state ? "/" : "/signin"} className="brand-logo">post now!</Link>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          {renderList()}
        </ul>
      </div>
      <div id="modal1" className="modal" ref={searchModal} >
        <div className="modal-content" style={{ 'color': 'black' }}>
          <div style={{ 'display': 'flex' }}>
            <label htmlFor="searchText"><i className="material-icons" style={{ "color": "black" }}>search</i></label>
            <input type={'text'}
              placeholder='Search users'
              value={searchText}
              onChange={(e) => searchUsers(e.target.value)}
              style={{ 'marginLeft': '10px' }} />
          </div>
          <ul class="collection" style={{ 'display': 'grid' }}>
            {
              userDetails.length == 0 ? <li style={{
                'marginLeft': '12px',
                'color': 'red'
              }}>{searchTextMsg}</li>
                : userDetails.map(user => {
                  return (
                    <li class="collection-item">
                      <Link to={'/userprofile/' + user.email} onClick={() => closeModal()}>
                        <div style={{
                          'height': '24px',
                          'display': 'flex'
                        }}>
                          <img src={user.profile_pic} alt='img not loaded' style={{
                            'height': '39px',
                            'width': '40px',
                            'margintop': '-8px',
                            'borderRadius': '50%'
                          }} />
                          <p style={{
                            'fontWeight': 'bold',
                            'marginTop': '0px',
                            'marginLeft': '10px'
                          }}>{user.email}</p>
                        </div>
                      </Link></li>
                  )
                })
            }
          </ul>
        </div>
        <div className="modal-footer">
          <button className="modal-close waves-effect waves-green btn-flat red" style={{ 'color': 'white' }}>Close</button>
        </div>
      </div>


      <div id="modal2" class="modal" ref={logouthModal}>
        <div class="modal-content">
          <h4 style={{ 'color': 'red' }}>Logout</h4>
          <p style={{ 'color': 'black','fontSize':'20px' }}>Are you sure, you want to logout?</p>
        </div>
        <div class="modal-footer" style={{ 'marginBottom': '10px' }}>
          <button className="modal-close waves-effect waves-green btn-flat green" style={{ 'color': 'white' }}>no</button>
          <button className="modal-close waves-effect waves-red btn-flat red" style={{ 'color': 'white', 'marginLeft': '30px' }} onClick = {()=>{logout()}}>yes</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;