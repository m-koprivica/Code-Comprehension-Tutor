// REFERENCE: https://stackoverflow.com/questions/40099431/how-do-i-clear-location-state-in-react-router-on-page-reload
// https://stackoverflow.com/questions/71500670/uselocation-hook-keeps-states-even-on-hard-refresh

import React, { useEffect,useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from "axios";
import style_auth from '../css/authentication.module.css'
import style_header from '../css/header.module.css'
import style from '../css/profile.module.css'

import Aplus from '../icons/sticker/A+.jpg'
import Anorm from '../icons/sticker/A.jpg'
import Aminus from '../icons/sticker/A-.jpg'
import Bplus from '../icons/sticker/B+.jpg'
import Bnorm from '../icons/sticker/B.jpg'
import Bminus from '../icons/sticker/B-.jpg'
import Cplus from '../icons/sticker/C+.jpg'
import Cnorm from '../icons/sticker/C.jpg'
import Cminus from '../icons/sticker/C-.jpg'
import Dnorm from '../icons/sticker/D.jpg'
import Fnorm from '../icons/sticker/F.jpg'

const Profile = (props) => {
  const navigate = useNavigate()
  const userInfo = useLocation().state;
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [researcher, setResearcher] = useState(false);
  const [grades, setGrade] = useState([]);

  const isResearcher = async () => {
    await axios.get("http://localhost:5000/users/research/researcher", {
      params: {
        username: userInfo.username,
        password: userInfo.password
      }
    }).then(data => {
      if (data.status === 200) { 
        setResearcher(true);
      } else {
        setResearcher(false);
      }
    }).catch(err => console.log(err.response.data.message));
  }

  const updateQuestions = async () => {
    await axios.put("http://localhost:5000/users/gradebook/questions", {
      username: userInfo.username,
      password: userInfo.password
    }).catch(err => console.log(err.response.data.message));
  }

  useEffect(() => {
    if (userInfo === null) {
      navigate("/");
    } else {
      isResearcher();
      updateQuestions();
      getGrades();
    }
  }, [])

  const onHomeButtonClicked = () => {
    navigate("/home", {state: userInfo});
  }

  const onProfileButtonClicked = () => {
    navigate("/profile", {state: userInfo});
  }

  const onLogoutButtonClicked = async () => {
    const username = userInfo.username;
    await axios.put("http://localhost:5000/users/logout", {
      username
    });
    window.history.replaceState({}, '');
    navigate("/", {
      state: null
    });
  }

  const onDeleteButtonClicked = async () => {
    const username = userInfo.username;
    const password = userInfo.password;
    await axios.delete("http://localhost:5000/users/" + username, {
      data: {
        password
      }
    });
    alert("Your account has been deleted")
    window.history.replaceState({}, '');
    navigate("/", {
      state: null
    });
  }

  const onButtonClick = async () => {
    if (oldPassword === "") {
      setError("ERROR: Input your old password");
      return;
    }

    if ((newPassword === "") || (newPassword.length < 5)) {
      setError("ERROR: Input a new password with at least 5 characters");
      return;
    }

    if ((confirmNewPassword === "") || (confirmNewPassword.length < 5)) {
      setError("ERROR: Confirm your new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("ERROR: Passwords do not match");
      return;
    }

    let valid = false;

    try {
      const res = await axios.put('http://localhost:5000/users/' + userInfo.username, {
        oldPassword,
        newPassword
      });
      
      valid = res.status === 204 ? true : false;
    } catch (err) {
      setError(err.response.data.message);
    } 
    if (valid) {
      alert("Your password has been reset");
      window.history.replaceState({}, '');
      navigate("/home", {
        state: null
      });
      return;
    } else {
      setError("ERROR: Old password is incorrect");
      return;
    }
  };

  const getGrades = async () => {
    try {
      const res = await axios.put("http://localhost:5000/users/" + userInfo.username + "/grade", {
        username: userInfo.username,
        password: userInfo.password
      });
      setGrade(res.data.grade);
    } catch (err) {
      console.log(err);
    }
  };

  const getAverageScore = (grades) => {
    let totalScore = 0
    let numCompletedQuestions = 0;
    for (let i = 0; i < grades.length; i++) {
      if (grades[i].testCorrect !== -1) {
        totalScore += 100 * (grades[i].testCorrect/grades[i].testTotal);
        numCompletedQuestions++;
      }
    }
    if (numCompletedQuestions === 0) {
      return "N/A";
    }
    return (Math.round(10 * totalScore/numCompletedQuestions))/10;
  };
  
  const renderAverageScore = (score) => {
    return <td className={style.gradeDisplayCell}>{score}{score === "N/A" ? '' : '%'}</td>
  };

  const renderSticker = (score) => {
    const side = 90;
    if (score === "N/A") {
      return <td className={style.gradeDisplayCell}>{score}</td>
    } else if (score >= 90) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Aplus} alt='A+' width={side} height={side}/></td>
    } else if (score >= 85) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Anorm} alt='A' width={side} height={side}/></td>
    } else if (score >= 80) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Aminus} alt='A-' width={side} height={side}/></td>
    } else if (score >= 76) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Bplus} alt='B+' width={side} height={side}/></td>
    } else if (score >= 72) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Bnorm} alt='B' width={side} height={side}/></td>
    } else if (score >= 68) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Bminus} alt='B-' width={side} height={side}/></td>
    } else if (score >= 64) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Cplus} alt='C+' width={side} height={side}/></td>
    } else if (score >= 60) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Cnorm} alt='C' width={side} height={side}/></td>
    } else if (score >= 55) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Cminus} alt='C-' width={side} height={side}/></td>
    } else if (score >= 50) {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Dnorm} alt='D' width={side} height={side}/></td>
    } else {
      return <td className={style.gradeDisplayCell}><img className={style.stickers} src={Fnorm} alt='F' width={side} height={side}/></td>
    }
  };

  return (
    <div className={style.mainContainer}>
      <div className={style_header.header}>
        <button title="Go To Home Page" className={style_header.homeButton} onClick={onHomeButtonClicked}><span className={style_header.headerSpan}>Home</span></button>
        <h1 className={style_header.headerTitle}>{userInfo !== null ? userInfo.username : navigate("/")} Profile</h1>
        <button title="Go To Profile Page" className={style_header.profileButton} onClick={onProfileButtonClicked}><span className={style_header.headerSpan}>Profile</span></button>
      </div>
      <br/><br/>
      <div className={style.gradeDisplay}>
        <table className={style.gradeDisplayTable}>
          <tr>
            {grades.map((ques) => {return <th className={style.gradeDisplayCell}>Question #{ques.questionId}</th>})}
            <th className={style.gradeDisplayCell}>Student Average</th>
          </tr>
          <tr>
            {grades.map((ques) => {
              if (ques.testCorrect === -1) {
                return <td className={style.gradeDisplayCell}>N/A</td>
              } else {
                return <td className={style.gradeDisplayCell}>{Math.round(10 * 100 * (ques.testCorrect/ques.testTotal))/10}%</td>
              }
            })}
            {renderAverageScore(getAverageScore(grades))}
          </tr>
          <tr>
            {grades.map((ques) => {
              if (ques.testCorrect === -1) {
                return <td className={style.gradeDisplayCell}>N/A</td>
              } else {
                const score = Math.round(10 * 100 * (ques.testCorrect/ques.testTotal))/10;
                return renderSticker(score)
              }
            })}
            {renderSticker(getAverageScore(grades))}
          </tr>
        </table>
      </div>

      <div className={style.buttonContainer}>
        <button title="Logout" className={style.logoutButton} onClick={onLogoutButtonClicked}>Logout</button>
      </div>

      <div className={style.changePassword} style={{ display: researcher ? "none" : "block" }}>
        <div className = {style_auth.title}>
          <div>Change Password</div>
        </div>
        <br/>
        <div className = {style_auth.input}>
          <input
            value={oldPassword}
            placeholder="Old Password"
            onChange={(ev) => setOldPassword(ev.target.value)}
            className = {style_auth.inputBox}
            type={showOldPassword ? 'text' : 'password'}
            maxLength="20"
            id = {style.oldPassword}
          />
          <label>
              <input
              value={showOldPassword}
              className = {style_auth.inputBox}
              type = "checkbox"
              onChange={() => setShowOldPassword(!showOldPassword)}
              id = {style_auth.showPass}
              />
              <label>Show Old Password</label>
          </label>
        </div>

        <div className = {style_auth.input}>
          <input
            value={newPassword}
            placeholder="New Password"
            onChange={(ev) => setNewPassword(ev.target.value)}
            className = {style_auth.inputBox}
            type={showNewPassword ? 'text' : 'password'}
            maxLength="20"
            id = {style.newPassword}
          />
          <label>
              <input
              value={showNewPassword}
              className = {style_auth.inputBox}
              type = "checkbox"
              onChange={() => setShowNewPassword(!showNewPassword)}
              id = {style_auth.showPass}
              />
              <label>Show New Password</label>
          </label>
        </div>

        <div className = {style_auth.input}>
          <input
            value={confirmNewPassword}
            placeholder="Confirm New Password"
            onChange={(ev) => setConfirmNewPassword(ev.target.value)}
            className = {style_auth.inputBox}
            type={showConfirmNewPassword ? 'text' : 'password'}
            maxLength="20"
            id = {style.confirmNewPassword}
          />
          <label>
              <input
              value={showConfirmNewPassword}
              className = {style_auth.inputBox}
              type = "checkbox"
              onChange={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              id = {style_auth.showPass}
              />
              <label>Show Confirm New Password</label>
          </label>
        </div>
        <br/>
        <div className={style.errorLabel}>
          <label>{error}</label>
        </div>
        <div className = {style_auth.input}>
          <input className = {style_auth.inputButton} type="button" onClick={onButtonClick} value={'Change Password'} />
        </div>
      </div>
      <div className={style.buttonContainer} style={{ display: researcher ? "none" : "block" }}>
        <button title="Delete Account" disabled={enabled} className={style.deleteButton} onClick={onDeleteButtonClicked}>Delete Account</button>
      </div>
      <label id = {style.enabled} style={{ display: researcher ? "none" : "block" }}>
        <input
        value={enabled}
        className = {style_auth.inputBox}
        type = "checkbox"
        onChange={() => setEnabled(!enabled)}
        />
        <label>Are you sure you'd like to delete your account and all of its related data?</label>
      </label>
    </div>
  )
}

export default Profile
