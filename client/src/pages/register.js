// STILL IN PROGRESS

// REFERENCE: 
// https://clerk.com/blog/building-a-react-login-page-template
// https://www.robinwieruch.de/react-checkbox/

import styles from "../css/authentication.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const textConsent = "By registering an account, you consent to having the following data be collected and analyzed. This includes your description, notes, generated code, failed tests, score, and duration for each question. Your data will be linked to your username.";
const textLogin = "Already have an account? Login";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const onLoginClick = () => {
    navigate("/");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    setIsLoading(true);
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmpassword");
   
    if ((username === "") || (username.length < 5)) {
      setError("ERROR: Input a username that is at least 5 characters long to register");
      setIsLoading(false);
      return;
    }
    if ((password === "") || (password.length < 5)) {
      setError("ERROR: Input a password that is at least 5 characters long to register");
      setIsLoading(false);
      return;
    }
    if (password!==confirmPassword){
      setError("ERROR: Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (!consent){
      setError("ERROR: Consent is required to register");
      setIsLoading(false);
      return;
    }

    let valid = false;
    try {
      const res = await axios.post("http://localhost:5000/users/register", {
        username,
        password
      });
      
      valid = res.status === 201 ? true : false;
    } catch (err) {
      setError(err.response.data.message);
    } 
    if (!valid) {
      setError("ERROR: Username is already taken");
      setIsLoading(false);
      return;
    } else {
      navigate("/");
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.title}>
        <div>Register</div>
      </div>
      <br/>
      <form onSubmit={handleSubmit}>
        <div className={styles.input}>
          <input name="username" type="text" placeholder="Username" />
        </div>
        <br/>
        <div className={styles.input}>
          <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" id={styles.password} />
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
        <div className={styles.input}>
          <input name="confirmpassword" type= {showPasswordConfirmation ? 'text' : 'password'} placeholder="Confirm Password" id={styles.passwordConfirmation} />
          <label>
              <input
              value={showPasswordConfirmation}
              className={styles.inputBox}
              type = "checkbox"
              onChange={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              id = {styles.showPass}
              />
              <label>Show Password Confirmation</label>
          </label>
        </div>
        <br/>
        <div className={`${styles.input} ${styles.consent}`}>
            <div className={styles.consentText}>
              <label>{textConsent}</label>
            </div>
            <input
            value={consent}
            className={styles.inputBox}
            type = "checkbox"
            onChange={() => setConsent(!consent)}
            />
            <span className={styles.consentText}>Agree</span>
        </div>
        <br/>
        <div className={styles.errorLabel}>
          <label>{error}</label>
        </div>
        <div className={styles.input}>
          <input className={styles.loginButton} type="button" onClick={onLoginClick} value={textLogin} />
          <input className={styles.inputButton} disabled={isLoading} type="submit" value={'Register'} />
        </div>
      </form>
    </div>
  );
}

export default Register;