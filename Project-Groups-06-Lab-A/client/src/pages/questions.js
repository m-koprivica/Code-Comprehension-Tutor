import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import style_header from '../css/header.module.css'
import style from '../css/questions.module.css'
import axios from 'axios';

let state;
let navigate;

const ButtonHome = () => {
  const onClick = () => {navigate("/home", {state: state});}
  return <button title="Go To Home Page" className={style_header.homeButton} onClick={onClick}><span className={style_header.headerSpan}>Home</span></button>;
}

const ButtonProfile = () => {
  const onClick = () => {navigate("/profile", {state: state});}
  return <button title="Go To Profile Page" className={style_header.profileButton} onClick={onClick}><span className={style_header.headerSpan}>Profile</span></button>;
}

function getBestAttempt (attempts) {
	let attemptBest = null;
	let scoreBest = 0;
	let timeBest = Infinity;

	for (let i = 0; i < attempts.length; i++) {
		let attemptNew = attempts[i];
		let scoreNew = attemptNew.testCorrect;
		let timeNew = attemptNew.duration;
		if (attemptNew.inProgress == false) {
		if (scoreBest < scoreNew || scoreBest == scoreNew && timeNew < timeBest) {
			attemptBest = attemptNew;
			scoreBest = attemptBest.testCorrect;
			timeBest = timeNew;
		}
		}
	}

	return attemptBest;
}

// Start Button
const ButtonStart = (props) => {
  const startAttempt = async () => {
    try {
      let request = {"password":state.password};
      let response = await axios.post(`http://localhost:5000/users/${state.username}/questions/${props.question}`, request);
      state.question = props.question;
      state.attempt = response.data.attemptNum;
      navigate("/attempt", {state: state});
    } catch (error) {
      console.error('Start Attempt', error);
    }
  };

  const onClick = () => {
    let attempts = props.attempts;
    let inProgress = false;

    for (let i = 0; i < attempts.length; i++) {
      if (attempts[i].inProgress) {
        inProgress = true;
        break;
      }
    }

    if (inProgress) {
      alert("You cannot start an attempt when there is already an attempt in-progress.");
    } else {
      startAttempt();
    }
  };

  return <button title='Start' className={`${style.button} ${style.start}`} onClick={onClick}></button>;
}

// View Button
const ButtonView = (props) => {
  const onClick = () => {
    state.question = props.question;
    state.attempt = props.attempt;
    navigate("/attempt", {state: state});
  }

  return <button title='View' className={`${style.button} ${style.view}`} onClick={onClick}></button>;
}

// Attempt
const Attempt = (name, id, attempt) => {
  let date = null;
  let score = null;
  let duration = null;

  if (attempt != null) {
    if (attempt.endTime != null) {
      date = new Date(attempt.endTime);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      date = `${day}-${month}-${year}`;
    }

    if (attempt.testCorrect != null) {
      score = `${attempt.testCorrect}/${attempt.testTotal}`;
    }

    if (attempt.duration != null) {
      duration = `${attempt.duration}s`;
    }
  }

  return (
    <span>
      <span>{name} {id} {date} {score} {duration}</span>
    </span>
  );
}

// Question
const Question = (question) => {
  const id = question.questionId;
  const attempts = question.attempts;
  const [stateExpand, setStateExpand] = useState(false);

  // Expand Button
  const ButtonExpand = () => {
    const onClick = () => {
      setStateExpand(!stateExpand);
    }

    return (
      <input
        title={ stateExpand ? "Hide Attempts" : "Show Attempts" }
        className={`${style.button} ${style.expand} ${ stateExpand ? style.on : style.off }`}
        type="button"
        onClick={onClick}
      />
    );
  }

  const Attempts = () => {
    if (stateExpand) {
      return (
        <ul className={style.attempts}>
          {attempts.map((attempt, attemptID) =>
            <li className={style.attempt}>
              {Attempt("Attempt", attemptID+1, attempt)}
              <ButtonView question={id} attempt={attemptID+1} />
            </li>
          )}
        </ul>
      );
    }
  }
  
  // Return
  return (
    <div>
      <li className={`${style.attempt} ${style.question}`}>
        <span>
          <ButtonExpand />
          {Attempt ("Question", id, getBestAttempt(attempts))}
        </span>
        <ButtonStart question={id} attempts={attempts}/>
      </li>
      <Attempts />
    </div>
  );
}

const Questions = (props) => {
  let questions = props.questions;

  if (questions != null) {
    return (
      <ul className={style.questions}>
        {questions.map((question) =>
          <li>
            {Question(question)}
          </li>
        )}
      </ul>
    );
  }
}

const QuestionsPage = () => {
  state = useLocation().state;
  navigate = useNavigate();
  const [questions, setQuestions] = useState(null);

  useEffect(() => {
    if (state === null) {
      navigate("/");
    } 
  }, [state])

  useEffect(() => {
    const initialize = async () => {
      try {
        let request = {"username":state.username, "password":state.password};
        let response = await axios.put(`http://localhost:5000/users/${state.username}/questions`, request);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('View Questions', error);
      }
    };
    initialize();
  }, []);

  return (
    <div>
      <div className={style_header.header}>
        <ButtonHome />
        <h1 className={style_header.headerTitle}>Questions</h1>
        <ButtonProfile />
      </div>
      <Questions questions={questions}/>
    </div>
  );
}

export default QuestionsPage
