// REFERENCE: https://clerk.com/blog/building-a-react-login-page-template
// REFERENCE: https://www.geeksforgeeks.org/how-to-show-and-hide-password-in-reactjs/
// REFERENCE: https://stackoverflow.com/questions/69714423/how-do-you-pass-data-when-using-the-navigate-function-in-react-router-v6

import React, { useState } from 'react';
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/authentication.module.css'

const Login = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();


  const onRegisterClick = () => {
    navigate("/register");
  }

  const onButtonClick = async () => {
    if (username === "") {
      setError("ERROR: Input a username");
      return;
    }

    if (password === "") {
      setError("ERROR: Input a password");
      return;
    }

    let valid = false;

    try {
      const res = await axios.put("http://localhost:5000/users/login", {
        username,
        password
      });
      
    
      valid = res.status === 204 ? true : false;
    } catch (err) {
      setError(err.response.data.message);
    } 
    if (valid) {
      navigate("/home", {
        state: {
          "username": username,
          "password": password
        }
      });
      return;
    } else {
      setError("ERROR: Username or password is incorrect");
      navigate("/", {
        state: null
      });
      return;
    }
  }

  // Username and password max of 20 characters

  return (
    <div className={styles.main}>
      <div className={styles.title}>
        <div>Login</div>
      </div>
      <br/>
      <div className={styles.input}>
        <input
          value={username}
          placeholder="Username"
          onChange={(ev) => setUsername(ev.target.value)}
          className={styles.inputBox}
          maxLength="20"
        />
      </div>
      <br/>
      <div className={styles.input}>
        <input
          value={password}
          placeholder="Password"
          onChange={(ev) => setPassword(ev.target.value)}
          className={styles.inputBox}
          type={showPassword ? 'text' : 'password'}
          maxLength="20"
          id = {styles.password}
        />
        <label>
            <input
            value={showPassword}
            className={styles.inputBox}
            type = "checkbox"
            onChange={() => setShowPassword(!showPassword)}
            id = {styles.showPass}
            />
            <label>Show Password</label>
        </label>
      </div>
      <br/>
      <div className={styles.errorLabel}>
        <label>{error}</label>
      </div>
      <div className={styles.input}>
        <input className={styles.registerButton} type="button" onClick={onRegisterClick} value={'Don’t have an account? Register here'} />
        <input className={styles.inputButton} type="button" onClick={onButtonClick} value={'Login'} />
      </div>
    </div>
  )
}

export default Login