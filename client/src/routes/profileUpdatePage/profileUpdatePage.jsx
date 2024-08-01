import { useContext, useState } from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest.js"
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget.jsx";

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext)
  const [error, setError] = useState("")
  const [avatar, setAvatar] = useState([])
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const { username, email, password } = Object.fromEntries(formData);

    try {

      const res = await apiRequest.put(`/users/${currentUser.userInfo.id}`, {
        username, email, password, avatar:avatar[0]
      });
      console.log("in profile update page", res.data);
      //updateUser(res.data)
      setError(" Update Successfully")
    } catch (error) {
      console.log(error);
      setError(error.response.data.message)
    }
  }

  return (
    <div className="profileUpdatePage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Update Profile</h1>
          <div className="item">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={currentUser.userInfo.username}
            />
          </div>
          <div className="item">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={currentUser.userInfo.email}
            />
          </div>
          <div className="item">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" />
          </div>
          <button>Update</button>
          {error && <span>{error};</span>}
        </form>
      </div>
      <div className="sideContainer">
        <img src={avatar[0] || currentUser.userInfo.avatar ||"https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
          alt="" className="avatar" />
        <UploadWidget uwConfig={{
          cloudName: "anmoldb",
          uploadPreset: "estate",
          multiple: false,
          maxImageFileSize: 2000000,
          folder: "posts",
        }}
          setState={setAvatar}
        />
      </div>
    </div>
  );
}

export default ProfileUpdatePage;