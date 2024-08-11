import React, { useEffect,useState } from 'react'
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom'
import styles from '../css/header.module.css'
import stylesB from '../css/gradebook.module.css'

const Gradebook = (props) => {
  const [data, setData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate()
  const userInfo = useLocation().state;
  const [averageScores, setAverageScores] = useState([0]);

  const onHomeButtonClicked = () => {
    navigate("/home", {state: userInfo});
  }

  const onProfileButtonClicked = () => {
    navigate("/profile", {state: userInfo});
  }

  const getGrades = async () => {
    try {
        const res = await axios.put("http://localhost:5000/questions/gradebook/gradebook_data", {
          username: userInfo.username,
          password: userInfo.password
        });
        setData(res.data.users);
      } catch (err) {
       
      } 
  }

  const getQuestions = async () => {
    try {
        const res = await axios.get("http://localhost:5000/questions/newQuestions", {
          params: {
            username: userInfo.username,
            password: userInfo.password
          }
        });
        setQuestions(res.data);
      } catch (err) {
      
      } 
  }

  const getAverageScore = (scores) => {
    if ((scores.length - 1) !== 0) {
      return Math.round(10 * scores.reduce((x,y) => (x+y))/(scores.length - 1))/10 + "%";
    } else {
      return "N/A";
    }
  }

  const questionAverages = (ques) => {
    let totalScore = 0;
    let totalStudents = 0;
    for (let i = 0; i < data.length; i++) {
      let questions = data[i].questions;
      let question = questions.find((q) => (q.questionId === ques.id));
      if (question !== undefined) {
        if (question.testCorrect !== -1) {
     
          totalScore += (question.testCorrect/question.testTotal) * 100;
          totalStudents++;
        }
      }
    }
    if (totalStudents === 0) {
      return "N/A";
    }
    const result = Math.round(10 * totalScore/totalStudents)/10;
    averageScores.push(result);
    return result + "%";
  }

  const studentAverage = (student) => {
    let totalScore = 0
    let numCompletedQuestions = 0;
    const questions = student.questions;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].testCorrect !== -1) {
        totalScore += 100 * (questions[i].testCorrect/questions[i].testTotal);
        numCompletedQuestions++;
      }
    }
    if (numCompletedQuestions === 0) {
      return "N/A";
    }
    return (Math.round(10 * totalScore/numCompletedQuestions))/10 + "%";
  }

  const isResearcher = async () => {
    await axios.get("http://localhost:5000/users/research/researcher", {
      params: {
        username: userInfo.username,
        password: userInfo.password
      }
    }).then(data => {
      if (data.status !== 200) { 
        navigate("/");
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
      navigate("/")
    } 
    updateQuestions();
    getQuestions();
    getGrades();
    isResearcher();
  }, [])

  return (
    <div className={stylesB.mainContainer}>
      <div className={styles.header}>
        <button title="Go To Home Page" className={styles.homeButton} onClick={onHomeButtonClicked}><span className={styles.headerSpan}>Home</span></button>
        <h1 className={styles.headerTitle}>Gradebook</h1>
        <button title="Go To Profile Page" className={styles.profileButton} onClick={onProfileButtonClicked}><span className={styles.headerSpan}>Profile</span></button>
      </div>
      <table>
        <tr>
          <th>Students</th>
          {questions.map((ques) => {
            return <th>Question #{ques.id}</th>
          })}
          <th>Student Average</th>
        </tr>
        {data.map((stu) => {
          return <tr>
                  <td>{stu.username}</td>
                  {stu.questions.map((ques) => {
                    if (ques.testCorrect === -1) {
                      return <td>N/A</td>
                    } else {
                      return <td>{Math.round(10 * 100 * (ques.testCorrect/ques.testTotal))/10}%</td>
                    }
                  })}
                  <td>{studentAverage(stu)}</td>
                </tr>
        })}
        <tr>
        <td className={stylesB.averages}>Question Average</td>
        {questions.map((ques) => {
          return <td className={stylesB.averages}>
                    {questionAverages(ques)}
                  </td>
        })}
        <td className={stylesB.averages}>{getAverageScore(averageScores)}</td>
        </tr>
      </table>
    </div>
  )
}

export default Gradebook