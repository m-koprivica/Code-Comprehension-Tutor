import React, { useEffect,useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from "axios";
import styles_header from '../css/header.module.css'
import styles from '../css/home.module.css'

const Home = (props) => {
  const navigate = useNavigate()
  const userInfo = useLocation().state;
  const [showGradebook, setshowGradebook] = useState(false); 

  const isResearcher = async () => {
    await axios.get("http://localhost:5000/users/research/researcher", {
      params: {
        username: userInfo.username,
        password: userInfo.password
      }
    }).then(data => {
      if (data.status === 200) { 
        setshowGradebook(true);
      } else {
        setshowGradebook(false);
      }
    }).catch(err => {});
  }

  const updateQuestions = async () => {
    await axios.put("http://localhost:5000/users/gradebook/questions", {
      username: userInfo.username,
      password: userInfo.password
    }).catch(err => {});
  }

  useEffect(() => {
    if (userInfo === null) {
      navigate("/")
    } 
    isResearcher();
  }, [])

  const onHomeButtonClicked = () => {
    navigate("/home", {state: userInfo});
  }

  const onProfileButtonClicked = () => {
    navigate("/profile", {state: userInfo});
  }

  const onQuestionsButtonClicked = () => {
    updateQuestions();
    navigate("/question_bank", {state: userInfo});
  }

  const onQuestionsManagementButtonClicked = () => {
    navigate("/question_management", {state: userInfo});
  }

  const onGradebookButtonClicked = () => {
    navigate("/gradebook", {state: userInfo});
  }

  const onTutorialButtonClicked = () => {
    navigate("/tutorial", {state: userInfo});
  }

  const ResearcherButtons = () => {
    if (showGradebook) {
      return (
        <div>
          <div className={styles.buttonContainer}>
            <button title="Go To Question Management Page" className={styles.questionsButton} onClick={onQuestionsManagementButtonClicked}>Question Management</button>
            <button title="Go To Gradebook Page" className={styles.questionsButton} onClick={onGradebookButtonClicked}>Gradebook</button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles_header.header}>
        <button title="Go To Home Page" className={styles_header.homeButton} onClick={onHomeButtonClicked}><span className={styles_header.headerSpan}>Home</span></button>
        <h1 className={styles_header.headerTitle}>Code Comprehension Tutor</h1>
        <button title="Go To Profile Page" className={styles_header.profileButton} onClick={onProfileButtonClicked}><span className={styles_header.headerSpan}>Profile</span></button>
      </div>
      <div className={styles.buttonContainer}>
        <button title="Go To Questions Page" className={styles.questionsButton} onClick={onQuestionsButtonClicked}>Questions</button>
        <button title="Go To Tutorial Page" className={styles.questionsButton} onClick={onTutorialButtonClicked}>Tutorial</button>
      </div>
      <ResearcherButtons />
    </div>
  )
}

export default Home