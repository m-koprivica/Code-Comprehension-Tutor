import React, { useEffect,useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import style_header from '../css/header.module.css'
import style from '../css/tutorial.module.css'

const textCore = "The project enables students to answer questions where they describe the purpose of a JavaScript function. To assess code comprehension, their description is used as a prompt in an LLM to generate a function. This function is evaluated against test cases to determine its functional equivalence to the original function. The function and test results are then shown to the student.";
const textUnique = "The project also includes a gradebook and tools related to question management. The gradebook enables a researcher to view the scores of each student for each question. The question management tools allow a researcher to add new questions and edit the code or tests of existing ones.";
const textResearcher = "There are two types of accounts, students and researchers. The Gradebook and Question Management Tools are restricted to researchers. You cannot register a researcher account.";
const textModel = "We are using the stable-code model from Ollama. Please note that using an LLM to generate code from a description is not perfect. If there are syntax errors, we display the generated code in the frontend and all of the tests will fail.";

const Tutorial = (props) => {
  const navigate = useNavigate()
  const userInfo = useLocation().state;
  useEffect(() => {
    if (userInfo === null) {
      navigate("/")
    } 
  }, [])

  const onHomeButtonClicked = () => {
    navigate("/home", {state: userInfo});
  }

  const onProfileButtonClicked = () => {
    navigate("/profile", {state: userInfo});
  }

  return (
    <div className = {style.mainContainer}>
      <div className = {style_header.header}>
        <button title="Go To Home Page" className = {style_header.homeButton} onClick={onHomeButtonClicked}><span className = {style_header.headerSpan}>Home</span></button>
        <h1 className = {style_header.headerTitle}>Tutorial</h1>
        <button title="Go To Profile Page" className = {style_header.profileButton} onClick={onProfileButtonClicked}><span className = {style_header.headerSpan}>Profile</span></button>
      </div>
      <div className = {style.videoContainer}>
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/ZPjN-KYxsx8" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin" 
          allowfullscreen>
        </iframe>
      </div>
      <div className = {style.videoContainer}>
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/5MzMrbB01OM" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin" 
          allowfullscreen>
        </iframe>
      </div>
      <div className = {style.textContainer}>
        <p>{textCore}</p>
        <p>{textUnique}</p>
        <p>{textResearcher}</p>
        <p>{textModel}</p>
      </div>
    </div>
  )
}

export default Tutorial