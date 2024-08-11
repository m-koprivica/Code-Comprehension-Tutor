import express from "express";

const router = express.Router();

// Data
import {readJsonFile, writeJsonFile} from "../functions/fileSystemFunctions.js";

const usersJsonPath = './data/users.json';
const questionsJsonPath = './data/questions.json';
// using let instead of const so that it can be reloaded after changes
let users_json = readJsonFile(usersJsonPath);
let users = users_json.users;
let questions_json = readJsonFile(questionsJsonPath);
let questions = questions_json.questions;

// Save & Submit Functions
import {save, submit} from "../functions/dataPersistence.js";

// Reloads the data variables to reflect the current state of the
// users and questions JSON files.
function reloadDataVars() {
    users_json = readJsonFile(usersJsonPath);
    users = users_json.users;
    questions_json = readJsonFile(questionsJsonPath);
    questions = questions_json.questions;
}


/*
    Save/Submit Attempt

    Description:
        - Saves the current attempt to the backend. If specified, it can also submit the attempt, which
        saves even more information and generates a function based on the user's description, passes this
        code to the question's tests, and evaluates the user's code comprehension

    Parameters:
        - Endpoint Parameters:
            - username (string): the username of the user who is saving/submitting their attempt
            - id (int): the question id of the question that the user is saving/submitting their attempt for
        - Request Body parameters:
            - password (string): the user's password (used for authentication)
            - description (string): the user's description of the question's function
            - notes (string): notes that the user wrote (use "" if there are no notes)
            - inProgress (boolean): whether the question is still in progress or not after this request.
                - If true  -> this attempt is saved and can be continued later
                - If false -> this attempt is submitted (generate code and evaluation) and
                    cannot be saved/submitted again

    Returns:
        - 401 code : Incorrect password or user is not currently logged in (statusLogin bool set to false)
        - 404 code : User with the given username could not be found
        - 204 code : Attempt successfully saved/submitted. Submitting may take a while to complete (due to generating
            code and evaluating it)

 */
router.put("/:username/questions/:id", async (req, res) => {
    reloadDataVars();

    const username = req.params.username;
    const question_id = req.params.id;

    const password = req.body.password;
    const description = req.body.description;
    const notes = req.body.notes;
    const inProgress = req.body.inProgress;

    for (let user of users) {
        if (user.username === username) {
            if (user.password !== password) {
                res.status(401).json({error: "Incorrect password"});
            } else if (!user.statusLogin) {
                res.status(401).json({error: "User is not currently logged in"});
            } else {
                // User confirmed to exist, correct password, and logged in
                // now try to save or submit
                try {
                    if (inProgress) {
                        save(username, question_id, description, notes);
                    } else {
                        await submit(username, question_id, description, notes);
                    }
                    res.status(204).send();
                } catch (e) {
                    res.status(400).json({error: e.message});
                }

                reloadDataVars();
            }
            return;
        }
    }
    res.status(404).json({error: "Could not find user: " + username});

});

// start attempt call here (Kate)
router.post("/:username/questions/:id", async (req, res) => {
    reloadDataVars();

    const {username, id: question_id} = req.params;
    const {password} = req.body;

    // Validate request body fields
    if (!password) {
        res.status(400).json({error: "Invalid or missing fields in request body"});
        return;
    }

    const startTime = new Date();

    // Create new attempt object
    const newAttempt = {
        "description": "",
        "notes": "",
        "inProgress": true,
        "startTime": startTime,
        "endTime": null,
        "duration": null,
        "generatedCode": null,
        "passingTestCases": null,
        "failingTestCases": null,
        "testCorrect": null,
        "testTotal": null
    };

    try {
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            const questionIndex = users[userIndex].questions.findIndex(q => q.questionId === parseInt(question_id));
            if (questionIndex !== -1) {
                // Check to ensure that only 1 inProgress attempt can exist per question
                const attempts = users[userIndex].questions[questionIndex].attempts;
                for (const attemptIndex in attempts) {
                    if (attempts[attemptIndex].inProgress) {
                        res.status(200).json({
                            message: "There already is an attempt in progress for this question",
                            attemptNum: (parseInt(attemptIndex) + 1)
                        });
                        // If this is code 400, then treated as "bad request" but I want it to be
                        // recoverable
                        return;
                    }
                }
                users[userIndex].questions[questionIndex].attempts.push(newAttempt);
                writeJsonFile(usersJsonPath, users_json);
                reloadDataVars();
                res.status(200).json({
                    message: 'New attempt added successfully.',
                    attemptNum: users[userIndex].questions[questionIndex].attempts.length
                });
                
            } else {
                res.status(404).json({error: `Question with questionId ${question_id} not found`});
            }
        } else {
            res.status(404).json({error: `User with username "${username}" not found`});
        }
    } catch (err) {
        console.error('Error adding new attempt:', err);
        res.status(500).json({error: "An error occurred while processing your request"});
    }
});

export default router;