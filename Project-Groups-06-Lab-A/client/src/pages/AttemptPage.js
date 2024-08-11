import attemptPage from '../css/AttemptPage.module.css';
import header from '../css/header.module.css';
import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from "axios";

// REFERENCE to grouping css files into styles:
// https://github.com/css-modules/css-modules/blob/master/docs/import-multiple-css-modules.md
let styles = {};
Object.assign(styles, attemptPage, header);


/*
    Props Required:
        - question_id (int): The ID of the question being viewed/attempted
        - attempt_num (int): The array position + 1 of the attempt being viewed/attempted (1-based indexing)
        - username (string): The user's username. Used to find and store attempt info
        - password (string): The user's password. Used for authentication purposes with the API calls.
 */

function AttemptPage() {
    // State
    const state = useLocation().state;
    const props = useLocation().state;
    const navigate = useNavigate();

    let question_id_check;
    let attemptId_check;
    let username_check;
    let password_check;

    try {
        question_id_check = state.question;
        attemptId_check = state.attempt;
        username_check = state.username;
        password_check = state.password;
    } catch (err) {
        navigate("/");
    }
    const question_id = question_id_check;
    const attemptId = attemptId_check;
    const username = username_check;
    const password = password_check;

    // Initializing states and state hooks.
    const [functionText, setFunctionText] = useState("");

    const [isInProgress, setInProgress] = useState(true);
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [passingTestCases, setPassingTestCases] = useState("");
    const [failingTestCases, setFailingTestCases] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");

    const [attemptNum, setAttemptNum] = useState(attemptId);
    const [testsCorrect, setTestsCorrect] = useState(0);
    const [testsTotal, setTestsTotal] = useState(0);
    const [duration, setDuration] = useState(0);

    // just for visual indicators that attempt is being saved/submitted
    // also useful to not bombard the server with many api calls from one user
    const [saveEnabled, setSaveEnabled] = useState(true);
    const [submitEnabled, setSubmitEnabled] = useState(true);
    const [retryEnabled, setRetryEnabled] = useState(true);

    // For button sound effect (from kenney.nl)
    const buttonClickSound = new Audio(process.env.PUBLIC_URL + '/buttonClickSound.ogg');
    buttonClickSound.volume = 0.25;

    // IMPORTANT: This is not the full endpoint.
    // You may need to concatenate /attempts/:attempt_number (attemptNum) at the end.
    // Attempt number can change (due to retry/redo) so it cannot be statically included.
    const endpoint = "http://localhost:5000/users/" + username + "/questions/" + question_id;
    // For refreshing the page, use reloadPage()
    const reloadPage = (newAttemptId) => {
        const update_state = {
            question: question_id,
            attempt: newAttemptId ? newAttemptId : attemptId,
            username: username,
            password: password
        };
        navigate(0, {state: update_state});
    };

    const textInstruction = "Explain the purpose of the following code.";
    const textDescription = "Input your description here";
    const textNotes = "Write your notes here (optional)";

    // State
    useEffect(() => {
        if (state === null) {
            navigate("/");
        }
    }, [state])

    // get the corresponding data from the question with given questionid
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.put(endpoint + "/attempts/" + attemptId, {password: props.password});
                const result = response.data;

                setInProgress(result.inProgress);
                setDescription(result.description);
                setNotes(result.notes);
                setGeneratedCode(result.generatedCode);
                setPassingTestCases(result.passingTestCases);
                setFailingTestCases(result.failingTestCases);
                setTestsCorrect(result.testCorrect);
                setTestsTotal(result.testTotal);
                setDuration(result.duration);
                setFunctionText(result.question);
            } catch (err) {

            }
        }
        fetchData();
    }, [state]);


    const handleDescription = (event) => {
        setDescription(event.target.value);
    }

    const handleNotes = (event) => {
        setNotes(event.target.value);
    }

    const handleSubmit = async () => {
        setSubmitEnabled(false);
        buttonClickSound.play();
        const input = {
            password: props.password, description: description, notes: notes, inProgress: false
        }

        try {
            await axios.put(endpoint, input);
        } catch (err) {

        } finally {
            setSubmitEnabled(true);
            reloadPage();
        }
    };

    const handleSave = async () => {
        setSaveEnabled(false);
        buttonClickSound.play();
        const input = {
            password: props.password, description: description, notes: notes, inProgress: true
        }
        try {
            await axios.put(endpoint, input);
        } catch (err) {

        } finally {
            setSaveEnabled(true);
        }
    }

    const handleRetry = async () => {
        setRetryEnabled(false);
        buttonClickSound.play();
        const input = {
            password: password
        }
        try {
            const response = await axios.post(endpoint, input);
            const data = response.data;

            state.attempt = data.attemptNum;
            navigate("/attempt", {state: state});
        } catch (err) {

        } finally {
            setRetryEnabled(true);
        }
    }

    // For return button
    const handleReturn = () => {
        delete state.question;
        delete state.attempt;
        navigate("/question_bank", {state: state});
    }

    const onHomeButtonClicked = () => {
        navigate("/home", {state: state});
    }

    const onProfileButtonClicked = () => {
        navigate("/profile", {state: state});
    }

    let scoreColour;
    if (testsCorrect / testsTotal === 1 || testsTotal === 0) {
        scoreColour = "mediumseagreen";
    } else if (testsCorrect / testsTotal > 1) {
        scoreColour = "blueviolet";
    } else if (testsCorrect / testsTotal > 0) {
        scoreColour = "orange";
    } else {
        scoreColour = "tomato";
    }

    const Header = () => {
        return (<div className={styles.header}>
            <button title="Go To Home Page"
                    className={styles.homeButton}
                    onClick={onHomeButtonClicked}>
                <span className={styles.headerSpan}>Home</span>
            </button>

            <button
                className={styles.returnButton}
                title="Back"
                onClick={handleReturn}>
                <span className={styles.headerSpan}>Return</span>
            </button>

            <h1 className={styles.headerTitleAttempt}>Question {question_id} (Attempt {attemptId})</h1>
            <button title="Go To Profile Page"
                    className={styles.profileButton}
                    onClick={onProfileButtonClicked}>
                <span className={styles.headerSpan}>Profile</span>
            </button>
        </div>);
    }

    const AttemptStatsHeader = () => {
        if (isInProgress) {
            return <h2 style={{color: "darkorchid"}}>Attempt In Progress</h2>
        } else {
            return <h2 style={{color: scoreColour}}>{testsCorrect}/{testsTotal}&emsp;&emsp;{duration}s</h2>
        }
    }

    const FunctionCode = () => {
        return <pre className={`${styles.gridItem} ${styles.functionText}`}>{functionText}</pre>
    }

    const GeneratedCode = () => {
        if (!isInProgress) {
            return <pre className={`${styles.gridItem} ${styles.functionText}`}
                        style={{color: 'mediumslateblue'}}>
                    {generatedCode}
                </pre>
        } else {
            return <pre className={`${styles.gridItem} ${styles.readOnlyText}`}>
                    Submit to see your LLM generated code!
                </pre>
        }
    }

    const PassingTestCases = () => {
        if (isInProgress) {
            return <pre className={`${styles.gridItem} ${styles.readOnlyText}`}>
                    Submit to see your passing test cases
                </pre>
        } else {
            return <pre className={`${styles.gridItem} ${styles.readOnlyText}`}
                        style={{color: 'mediumseagreen'}}>
                    {passingTestCases}
                </pre>
        }
    }

    const FailingTestCases = () => {
        if (isInProgress) {
            return <pre className={`${styles.gridItem} ${styles.readOnlyText}`}>
                    Submit to see your failing test cases
                </pre>
        } else {
            return <pre className={`${styles.gridItem} ${styles.readOnlyText}`}
                        style={{color: 'orangered'}}>
                    {failingTestCases}
                </pre>
        }
    }

    const DataControlButtons = () => {
        if (isInProgress) {
            return <div>
                {saveEnabled ?
                    <button className={styles.buttonEnabled} onClick={handleSave}>Save</button> :
                    <button className={styles.buttonDisabled} disabled>Saving...</button>}
                {submitEnabled ?
                    <button className={styles.buttonEnabled} onClick={handleSubmit}>Submit</button> :
                    <button className={styles.buttonDisabled} disabled>Submitting...</button>}
            </div>
        } else {
            return <div>
                {retryEnabled ?
                    <button className={styles.buttonEnabled} onClick={handleRetry}>Retry</button> :
                    <button className={styles.buttonDisabled} disabled>Initializing new attempt...</button>}
            </div>
        }
    }

    return (<div className={styles.AttemptPage}>
        <Header/>

        <AttemptStatsHeader/>

        <h2>{textInstruction}</h2>

        <div className={styles.gridLayout}>
            <FunctionCode/>

            <GeneratedCode/>

            {/* Description textbox*/}
            <textarea
                className={`${styles.gridItem} ${!isInProgress && styles.readOnlyText}`}
                placeholder={textDescription}
                onChange={handleDescription}
                value={description}
                readOnly={!isInProgress}
            />

            <PassingTestCases/>

            {/* Notes textbox*/}
            <textarea
                className={`${styles.gridItem} ${!isInProgress && styles.readOnlyText}`}
                placeholder={textNotes}
                onChange={handleNotes}
                value={notes}
                readOnly={!isInProgress}
            />

            <FailingTestCases/>
        </div>

        <DataControlButtons/>

        {isInProgress && <h5>Please allow some time for submission, generating code can take a while.</h5>}
    </div>);
}

export default AttemptPage;