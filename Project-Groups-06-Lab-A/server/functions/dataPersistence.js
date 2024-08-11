// Data
import {readJsonFile, writeJsonFile} from "./fileSystemFunctions.js";

const usersJsonPath = "./data/users.json";
const questionsJsonPath = "./data/questions.json";
let users_json = readJsonFile(usersJsonPath);
let users = users_json.users;
let questions_json = readJsonFile(questionsJsonPath);
let questions = questions_json.questions;

// Generating & Evaluating code
import {generateCode} from "./generateCode.js";
import {evaluateCode} from "./evaluateCode.js";

// Reloads the data variables to reflect the current state of the
// users and questions JSON files.
function reloadDataVars() {
    users_json = readJsonFile(usersJsonPath);
    users = users_json.users;
    questions_json = readJsonFile(questionsJsonPath);
    questions = questions_json.questions;
}

// Helpers

// Returns the number of parameters that the given foo function has.
// May or may not actually be needed (depending if we want the LLM to know explicitly the name and number
// of parameters it must generated, which could reduce the number of errors when testing)
function countNumParameters(foo_code) {
    let parameter = foo_code.split("foo(")[1].split(")")[0];
    if (parameter.length === 0) {
        return 0;
    }
    return parameter.split(",").length;
}

// Returns the question's function based on the question id. If question could not be found,
// returns the empty string ("") instead.
function getQuestionFunction(question_id) {
    // DO NOT put reloadDataVars here.
    // It is already guaranteed to be up-to-date when this function is called, but
    // if you call it then the attempt info WILL NOT be saved.
    for (let question of questions) {
        if (question.id === question_id) {
            return question.code;
        }
    }
    return "";
}

// Persistence

// Submits the attempt. Generates and evaluates code based on user's description.
// Sets the attempts inProgress boolean to false & saves other data to the attempt.
async function submit(username, question_id, desc, notes) {
    reloadDataVars();

    for (let user of users) {
        if (user.username === username) {
            for (let i = 0; i < user.questions.length; i++) {
                if (user.questions[i].questionId === Number(question_id)) {
                    const attempt = user.questions[i].attempts[user.questions[i].attempts.length - 1];
                    if (attempt.inProgress) {
                        const endTime = new Date(); // generates endTime on submission -> endtime not affected by gen-time

                        const questionFunction = getQuestionFunction(Number(question_id));
                        const numParameters = countNumParameters(questionFunction);

                        try {
                            const generated_code = await generateCode(desc, numParameters);
                            const evaluatedAttempt = evaluateCode(question_id, generated_code);

                            // Create and save attempt object
                            attempt.inProgress = false;
                            attempt.description = desc;
                            attempt.notes = notes;
                            attempt.endTime = endTime;
                            const startTime = new Date(attempt.startTime);
                            attempt.duration = Math.round((endTime - startTime) / 1000);
                            attempt.generatedCode = generated_code;
                            attempt.testCorrect = evaluatedAttempt.testCorrect;
                            attempt.testTotal = evaluatedAttempt.testTotal;
                            attempt.passingTestCases = evaluatedAttempt.passingTestCases;
                            attempt.failingTestCases = evaluatedAttempt.failingTestCases;

                            writeJsonFile(usersJsonPath, users_json);
                            reloadDataVars();
                            return attempt;
                        } catch (error) {
                           
                        }
                    } 
                }
            }
            throw new Error("Could not find question to submit");
        }
    }
    // Likely will never occur, but just to be safe
    throw new Error("Could not find user (who submitted attempt), " + "but it was confirmed to exist before (in save/submit API");
}

// Saves the description and notes to the user with the provided username, under their latest, in progress
// attempt for the question with the given question_id.
// It is assumed that the attempt has inProgress === true and that the user with the given username exists.
function save(username, question_id, desc, notes) {
    reloadDataVars();

    for (let user of users) {
        if (user.username === username) {
            for (let i = 0; i < user.questions.length; i++) {
                if (user.questions[i].questionId === Number(question_id)) {
                    const attempt = user.questions[i].attempts[user.questions[i].attempts.length - 1];
                    if (attempt.inProgress) {
                        attempt.description = desc;
                        attempt.notes = notes;

                        writeJsonFile(usersJsonPath, users_json);
                        reloadDataVars();
                        return;
                    } 
                }
            }
            throw new Error("Could not find question to submit");
        }
    }
    // Likely will never occur, but just to be safe
    throw new Error("Could not find user (who submitted attempt), but it was confirmed to exist before (in save/submit API");
}

export {save, submit};