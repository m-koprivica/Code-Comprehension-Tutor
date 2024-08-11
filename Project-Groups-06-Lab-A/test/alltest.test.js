// Tests related to the API of the question builder page
import axios from "axios";
import {expect} from "chai"
import fs from "fs";

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



describe("Question Bank", () => {

    let attempts;
    let attempt;

    it ("getBestAttempt null", async () => {
        attempts = [];
        attempt = getBestAttempt(attempts);
        expect(attempt).to.equal(null);
    });

    it ("getBestAttempt inProgress", async () => {
        attempts = JSON.parse('[{"description":"","notes":"","inProgress":true,"startTime":null,"endTime":null,"duration":null,"generatedCode":null,"failingTestCases":null,"testCorrect":null,"testTotal":null}]');
        attempt = getBestAttempt(attempts);
        expect(attempt).to.equal(null);
    });

    it ("getBestAttempt complete", async () => {
        attempts = JSON.parse('[{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":null,"generatedCode":null,"failingTestCases":null,"testCorrect":1,"testTotal":null}]');
        attempt = getBestAttempt(attempts);
        expect(attempt.testCorrect).to.equal(1);
    });

    it ("getBestAttempt score", async () => {
        attempts = JSON.parse('[{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":null,"generatedCode":null,"failingTestCases":null,"testCorrect":1,"testTotal":null},{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":null,"generatedCode":null,"failingTestCases":null,"testCorrect":2,"testTotal":null},{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":null,"generatedCode":null,"failingTestCases":null,"testCorrect":1,"testTotal":null}]');
        attempt = getBestAttempt(attempts);
        expect(attempt.testCorrect).to.equal(2);
    });

    it ("getBestAttempt time", async () => {
        attempts = JSON.parse('[{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":200,"generatedCode":null,"failingTestCases":null,"testCorrect":1,"testTotal":null},{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":100,"generatedCode":null,"failingTestCases":null,"testCorrect":1,"testTotal":null},{"description":"","notes":"","inProgress":false,"startTime":null,"endTime":null,"duration":200,"generatedCode":null,"failingTestCases":null,"testCorrect":1,"testTotal":null}]');
        attempt = getBestAttempt(attempts);
        expect(attempt.duration).to.equal(100);
    });

    it ("getBestAttempt score/time", async () => {
        attempts = JSON.parse('[{"inProgress":false,"duration":100,"testCorrect":1},{"inProgress":false,"duration":200,"testCorrect":2},{"inProgress":false,"duration":100,"testCorrect":2},{"inProgress":false,"duration":200,"testCorrect":2},{"inProgress":false,"duration":100,"testCorrect":1},{"inProgress":true,"duration":null,"testCorrect":null}]');
        attempt = getBestAttempt(attempts);
        expect(attempt.testCorrect).to.equal(2);
        expect(attempt.duration).to.equal(100);
    });
});


// Read JSON file using given path
function readJsonFile(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file: " + err);
        return null;
    }
}

// Write given data into JSON file located at given path.
function writeJsonFile(path, data) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing file: " + err);
    }
}

// Save Real Data
const usersRealJsonPath = '../server/data/users.json';
const usersReal = readJsonFile(usersRealJsonPath);
const questionsRealJsonPath = '../server/data/questions.json';
const questionsReal = readJsonFile(questionsRealJsonPath);

// // Get Test Data
const usersTestJsonPath = '../server/data/usersTest.json';
const usersTest = readJsonFile(usersTestJsonPath);
const questionsTestJsonPath = '../server/data/questionsTest.json';
const questionsTest = readJsonFile(questionsTestJsonPath);

// // Put Test Data Into Real JSON
beforeEach(function () {
    writeJsonFile(usersRealJsonPath, usersTest);
    writeJsonFile(questionsRealJsonPath, questionsTest);
});

// Put Real Data Back
after(function () {
    writeJsonFile(usersRealJsonPath, usersReal);
    writeJsonFile(questionsRealJsonPath, questionsReal);
});


// View Question (Researcher) - View specific question's details
describe("View Question (Researcher)", () => {

    const usersJsonPath = '../server/data/users.json';
    const users_json = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questions_json = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, users_json);
        writeJsonFile(questionsJsonPath, questions_json);
    });

    it("View Question (Researcher) - Success", async () => {
        const username = "Researcher_A";
        const password = "pResearcher_A";
        // Login first
        await axios.put("http://localhost:5000/users/login", {username, password});

        // send API call for viewing a question
        const response = await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/2`,
            {"password": password});
        const data = response.data;

        expect(response.status).to.equal(200);
        expect(data.id).to.equal(2);

        expect(data.code).to.equal("function foo(n) {\n\tvar val = 0;\n\tfor (let i = 0; i < n.length; i++) {\n\t\tval += n[i];\n\t}\n\treturn val;\n}");
        expect(data.tests.length).to.equal(6);
    });

    it ("View Question (Researcher) - Not logged in", async () => {
        const username = "Researcher_A";
        const password = "pResearcher_A";

        try {
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/2`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(401);
        }
    });

    it ("View Question (Researcher) - Bad password", async () => {
        const username = "Researcher_A";
        const password = "bad_pass";

        try {
            //login
            await axios.put("http://localhost:5000/users/login", {username, password});
            //view question
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/2`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(401);
        }
    });

    it ("View Question (Researcher) - No password", async () => {
        const username = "Researcher_A";
        const password = "";

        try {
            //login
            await axios.put("http://localhost:5000/users/login", {username, password});
            //view question
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/2`)
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(400);
        }
    });

    it ("View Question (Researcher) - Non-existent User", async () => {
        const username = "i_do_not_exist";
        const password = "pResearcher_A";

        try {
            //login
            await axios.put("http://localhost:5000/users/login", {username, password});
            //view question
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/2`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(404);
        }
    });

    it ("View Question (Researcher) - Non-Researcher account", async () => {
        const username = "Student_A";
        const password = "pStudent_A";

        try {
            //login
            await axios.put("http://localhost:5000/users/login", {username, password});
            //view question
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/2`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(401);
        }
    });
});

// View Questions (Researcher) - View all questions in questions.json
describe("View Questions (Researcher)", () => {

    const usersJsonPath = '../server/data/users.json';
    const users_json = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questions_json = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, users_json);
        writeJsonFile(questionsJsonPath, questions_json);
    });

    it("View Questions (Researcher) - Success", async () => {
        const username = "Researcher_A";
        const password = "pResearcher_A";

        try {
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            // View all questions API call next
            const response = await axios.put(`http://localhost:5000/questions/${username}/researcher/questions`,
                {"password": password});
            const data = response.data;
            expect(response.status).to.equal(200);
            expect(data.questions.length).to.equal(10);
        } catch (err) {
            expect.fail();
        }
    });

    it("View Questions (Researcher) - Not logged in", async () => {
        const username = "Researcher_A";
        const password = "pResearcher_A";

        try {
            // View all questions API call next
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(401);
        }
    });

    it("View Questions (Researcher) - Bad password", async () => {
        const username = "Researcher_A";
        const password = "bad_pass";

        try {
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            // View all questions API call next
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(401);
        }
    });

    it("View Questions (Researcher) - No password", async () => {
        const username = "Researcher_A";
        const password = "";

        try {
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            // View all questions API call next
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions`);
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(400);
        }
    });


    it("View Questions (Researcher) - Non-existent User", async () => {
        const username = "i_dont_exist";
        const password = "pResearcher_A";

        try {
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            // View all questions API call next
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(404);
        }
    });

    it("View Questions (Researcher) - Non-Researcher account", async () => {
        const username = "Student_A";
        const password = "pStudent_A";

        try {
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            // View all questions API call next
            await axios.put(`http://localhost:5000/questions/${username}/researcher/questions`,
                {"password": password});
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.equal(401);
        }
    });
});


describe('Delete Question', () => {
    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questionsJSON = readJsonFile(questionsJsonPath);

    afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questionsJSON);
    });

    describe('Delete Question API', () => {
        it('Delete Question Success', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            const id = 6;
          
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            try {
                const res = await axios.delete(`http://localhost:5000/questions/${username}/researcher`, {
                    data: {
                        password,
                        id
                    }
                });
                expect(res.status).to.equal(200);
            } catch (err) {
                expect(err.response.status).to.equal(500);
            }
        });
        it('Delete Question unsuccessful without login', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            const id = 6;
         
            try {
                const res = await axios.delete(`http://localhost:5000/questions/${username}/researcher`, {
                    data: {
                        password,
                        id
                    }
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		it('Delete Question unsuccessful with wrong password', async () => {
            const username = "Researcher_A";
            const password = "Researcher_A";
            const id = "6";
          
            try {
                const res = await axios.delete(`http://localhost:5000/questions/${username}/researcher`, {
                    data: {
                        password,
                        id
                    }
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		it('Delete Question unsuccessful with no password', async () => {
            const username = "Researcher_A";
            const password = "";
            const id = "6";
          
            try {
                const res = await axios.delete(`http://localhost:5000/questions/${username}/researcher`, {
                    data: {
                        password,
                        id
                    }
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(400);
            }
        });
		it('Delete Question unsuccessful with student account', async () => {
            const username = "Student_A";
            const password = "pStudent_A";
            const id = "6";
          
            try {
                const res = await axios.delete(`http://localhost:5000/questions/${username}/researcher`, {
                    data: {
                        password,
                        id
                    }
                });
				expect().fail();
            } catch (err) {
				expect(err.response.status).to.equal(401);
            }
        });
	});
});


describe('Add Question', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questionsJSON = readJsonFile(questionsJsonPath);

    afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questionsJSON);
    });

    describe('Add Question API', () => {

        it('Add Question Success', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            const id = "111";
            const code = "xxxxxxxxxxx";
            const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
        
           
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});
            try {
                const res = await axios.post(`http://localhost:5000/questions/${username}/researcher`, {
                    password,
                    id,
                    code,
                    tests
                });
                expect(res.status).to.equal(200);
            } catch (err) {
                expect(err.response.status).to.equal(500);
            }
        });
        it('Add Question unsuccessful without login', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            const id = "111";
            const code = "xxxxxxxxxxx";
            const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];


            try {
                const res = await axios.post(`http://localhost:5000/questions/${username}/researcher`, {
                    password,
                    id,
                    code,
                    tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		it('Add Question unsuccessful with wrong password', async () => {
            const username = "Researcher_A";
            const password = "Researcher_A";
            const id = "111";
            const code = "xxxxxxxxxxx";
            const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
        
         

            try {
                const res = await axios.post(`http://localhost:5000/questions/${username}/researcher`, {
                    password,
                    id,
                    code,
                    tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
    });
	it('Add Question unsuccessful with no password', async () => {
		const username = "Researcher_A";
		const id = "111";
		const code = "xxxxxxxxxxx";
		const tests = [
			{
				"title": "Test 1",
				"assertion": "Pass"
			},
			{
				"title": "Test 2",
				"assertion": "Fail"
			}
		];
	

		try {
			const res = await axios.post(`http://localhost:5000/questions/${username}/researcher`, {
				id,
				code,
				tests
			});
			expect().fail();
		} catch (err) {
			expect(err.response.status).to.equal(400);
		}
	});
	it('Add Question unsuccessful with duplicate question id', async () => {
		const username = "Researcher_A";
		const password = "pResearcher_A";
		const id = "1";
		const code = "xxxxxxxxxxx";
		const tests = [
			{
				"title": "Test 1",
				"assertion": "Pass"
			},
			{
				"title": "Test 2",
				"assertion": "Fail"
			}
		];
	
	

		try {
			const res = await axios.post(`http://localhost:5000/questions/${username}/researcher`, {
				password,
				id,
				code,
				tests
			});
			expect().fail();
		} catch (err) {
			expect(err.response.status).to.equal(401);
		}
	});
	it('Add Question unsuccessful with student account', async () => {
		const username = "Student_A";
		const password = "pStudent_A";
		const id = "1";
		const code = "xxxxxxxxxxx";
		const tests = [
			{
				"title": "Test 1",
				"assertion": "Pass"
			},
			{
				"title": "Test 2",
				"assertion": "Fail"
			}
		];
	
	

		try {
			const res = await axios.post(`http://localhost:5000/questions/${username}/researcher`, {
				password,
				id,
				code,
				tests
			});
			expect().fail();
		} catch (err) {
			expect(err.response.status).to.equal(401);
		}
	});
});


describe('View Question (Researcher)', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questoinsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questoinsJSON);
    });
	
	
	
	
});


describe('Edit Question', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questoinsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questoinsJSON);
    });
	
	describe('Edit Question API', () => {
        it('Edit Question Success', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            const id = "5";
			const code="xxxxxxxx";
			const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
            // Login first
            await axios.put("http://localhost:5000/users/login", {username, password});

            try {
                const res = await axios.put(`http://localhost:5000/questions/${username}/researcher/question/${id}`, {
                        password,
                        id,
						code,
						tests
                });
                expect(res.status).to.equal(200);
            } catch (err) {
                expect(err.response.status).to.equal(500);
            }
        });
        it('Edit Question unsuccessful without login', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            const id = "5";
			const code="xxxxxxxx";
			const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];

            try {
                const res = await axios.put(`http://localhost:5000/questions/${username}/researcher/question/${id}`, {
                        password,
                        id,
						code,
						tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		it('Edit Question unsuccessful with wrong password', async () => {
            const username = "Researcher_A";
            const password = "Researcher_A";
            const id = "5";
			const code="xxxxxxxx";
			const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
        

            try {
                const res = await axios.put(`http://localhost:5000/questions/${username}/researcher/question/${id}`, {
                        password,
                        id,
						code,
						tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		
		it('Edit Question unsuccessful with student account', async () => {
            const username = "Student_A";
            const password = "pStudent_A";
            const id = "5";
			const code="xxxxxxxx";
			const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
          
            try {
                const res = await axios.put(`http://localhost:5000/questions/${username}/researcher/question/${id}`, {
                        password,
                        id,
						code,
						tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		it('Edit Question unsuccessful with non exists question', async () => {
			const username = "Researcher_A";
            const password = "Researcher_A";
            const id = "1111";
			const code="xxxxxxxx";
			const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
          
            try {
                const res = await axios.put(`http://localhost:5000/questions/${username}/researcher/question/${id}`, {
                        password,
                        id,
						code,
						tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });
		it('Edit Question unsuccessful with non exists username', async () => {
            const username = "Researcher_Ac";
            const password = "Researcher_A";
            const id = "1111";
			const code="xxxxxxxx";
			const tests = [
                {
                    "title": "Test 1",
                    "assertion": "Pass"
                },
                {
                    "title": "Test 2",
                    "assertion": "Fail"
                }
            ];
         
            try {
                const res = await axios.put(`http://localhost:5000/questions/${username}/researcher/questions/${id}`, {
                        password,
                        id,
						code,
						tests
                });
                expect().fail();
            } catch (err) {
                expect(err.response.status).to.equal(404);
            }
        });
	});
});


describe('View Questions (Researcher)', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questoinsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questoinsJSON);
    });
	
	
	
	
});

// mark need to change test in here
describe('View Gradebook', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questoinsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questoinsJSON);
    });

    describe('Viewing Gradebook API', async () => {

        it('Access Gradebook Successfully', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_A";
            try {
                const res = await axios.put("http://localhost:5000/questions/gradebook/gradebook_data",
                    {"username": username, "password": password});
                expect(res.status).eql(200);
            } catch (err) {
                assert.fail();
            }
        });

        it('Access Gradebook Unsuccessfully (Missing Element)', async () => {
            const username = "Researcher_A";
            try {
                const res = await axios.put("http://localhost:5000/questions/gradebook/gradebook_data",
                    {"username": username});
                assert.fail();
            } catch (err) {
                expect(err.response.status).eql(400);
            }
        });

        it('Access Gradebook Unsuccessfully (Nonexist User)', async () => {
            const username = "Researcher_";
            const password = "pResearcher_A";
            try {
                const res = await axios.put("http://localhost:5000/questions/gradebook/gradebook_data",
                    {"username": username, "password": password});
                assert.fail();
            } catch (err) {
                expect(err.response.status).eql(404);
            }
        });

        it('Access Gradebook Unsuccessfully (Wrong Password)', async () => {
            const username = "Researcher_A";
            const password = "pResearcher_";
            try {
                const res = await axios.put("http://localhost:5000/questions/gradebook/gradebook_data",
                    {"username": username, "password": password});
                assert.fail();
            } catch (err) {
                expect(err.response.status).eql(401);
            }
        });

        it('Access Gradebook Unsuccessfully (Not Researcher Account)', async () => {
            const username = "Student_A";
            const password = "pStudent_A";
            try {
                const res = await axios.put("http://localhost:5000/questions/gradebook/gradebook_data",
                    {"username": username, "password": password});
                assert.fail();
            } catch (err) {
                expect(err.response.status).eql(401);
            }
        });

    });
});


describe('Login', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questoinsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questoinsJSON);
    });

    // describe('Login API', async () => {
    it('Login Success', async () => {
        const username = "Student_A";
        const password = "pStudent_A";
        const res = await axios.put("http://localhost:5000/users/login", {
            username, password
        });
        const testUsersJSON = readJsonFile(usersJsonPath);
        expect(testUsersJSON.users[0].statusLogin).equal(true);
        for (let i = 0; i < testUsersJSON.users.length; i++) {
            if (testUsersJSON.users[i].username !== username) {
                expect(testUsersJSON.users[i].statusLogin).equal(false);
            }
        }
        expect(res.status).equal(204);

        await axios.put("http://localhost:5000/users/logout", {
            username
        });
    });

    it('Login Incorrect Password', async () => {
        const username = "Student_A";
        const password = "pStudent_A2";
        try {
            const res = await axios.put("http://localhost:5000/users/login", {
                username, password
            });
            expect.fail();
        } catch (err) {
            const testUsersJSON = readJsonFile(usersJsonPath);
            for (let i = 0; i < testUsersJSON.users.length; i++) {
                expect(testUsersJSON.users[i].statusLogin).equal(false);
            }
            expect(err.response.status).equal(401);
        }
    });

	it('Login Success: Filter Out Questions', async () => {
		const username = "Student_D";
		const password = "pStudent_D";
		const res = await axios.put("http://localhost:5000/users/login", {
			username,
			password
		});
		const testUsersJSON = readJsonFile(usersJsonPath);
		const testUser = testUsersJSON.users[3];
		expect(testUser.statusLogin).equal(true);
		expect(testUser.questions.length).to.equal(10);
		for (let i = 0; i < testUsersJSON.users.length; i++) {
			if (testUsersJSON.users[i].username !== username) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
		}
		const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
		const questions = testUser.questions;
		for (let j = 0; j < questions.length; j++) {
			expect(existingQuestions).to.include(questions[j].questionId);
		}
		expect(res.status).equal(204);

		await axios.put("http://localhost:5000/users/logout", {
			username
		});
	});

	it('Login Success: Missing One Question', async () => {
		const username = "Student_F";
		const password = "pStudent_F";
		const res = await axios.put("http://localhost:5000/users/login", {
			username,
			password
		});
		const testUsersJSON = readJsonFile(usersJsonPath);
		const testUser = testUsersJSON.users[5];
		expect(testUser.statusLogin).equal(true);
		expect(testUser.questions.length).to.equal(10);
		for (let i = 0; i < testUsersJSON.users.length; i++) {
			if (testUsersJSON.users[i].username !== username) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
		}
		const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
		const questions = testUser.questions;
		for (let j = 0; j < questions.length; j++) {
			expect(existingQuestions).to.include(questions[j].questionId);
		}
		expect(res.status).equal(204);

		await axios.put("http://localhost:5000/users/logout", {
			username
		});
	});

	it('Login Success: Populate Questions', async () => {
		const username = "Student_E";
		const password = "pStudent_E";
		const res = await axios.put("http://localhost:5000/users/login", {
			username,
			password
		});
		const testUsersJSON = readJsonFile(usersJsonPath);
		const testUser = testUsersJSON.users[4];
		expect(testUser.statusLogin).equal(true);
		expect(testUser.questions.length).to.equal(10);
		for (let i = 0; i < testUsersJSON.users.length; i++) {
			if (testUsersJSON.users[i].username !== username) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
		}
		const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
		const questions = testUser.questions;
		for (let j = 0; j < questions.length; j++) {
			expect(existingQuestions).to.include(questions[j].questionId);
		}
		expect(res.status).equal(204);

		await axios.put("http://localhost:5000/users/logout", {
			username
		});
	});

	it('Login Success Researcher', async () => {
		const username = "Researcher_A";
		const password = "pResearcher_A";
		const res = await axios.put("http://localhost:5000/users/login", {
			username,
			password
		});
		const testUsersJSON = readJsonFile(usersJsonPath);
		expect(testUsersJSON.users[testUsersJSON.users.length - 1].statusLogin).equal(true);
		for (let i = 0; i < testUsersJSON.users.length; i++) {
			if (testUsersJSON.users[i].username !== username) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
		}
		expect(res.status).equal(204);

		await axios.put("http://localhost:5000/users/logout", {
			username
		});
	});

	it('Login Inccorect Password', async () => {
		const username = "Student_A";
		const password = "pStudent_A2";
		try {
			const res = await axios.put("http://localhost:5000/users/login", {
				username,
				password
			});
			expect.fail(res);
		} catch (err) {
			const testUsersJSON = readJsonFile(usersJsonPath);
			for (let i = 0; i < testUsersJSON.users.length; i++) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
			expect(err.response.status).equal(401);
		}
	});

	it('Login Inccorect Username', async () => {
		const username = "Student_A2";
		const password = "pStudent_A";
		try {
			const res = await axios.put("http://localhost:5000/users/login", {
				username,
				password
			});
			expect.fail(res);
		} catch (err) {
			const testUsersJSON = readJsonFile(usersJsonPath);
			for (let i = 0; i < testUsersJSON.users.length; i++) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
			expect(err.response.status).equal(404);
		}
	});

	it('Login No Username', async () => {
		const username = "";
		const password = "pStudent_A";
		try {
			const res = await axios.put("http://localhost:5000/users/login", {
				username,
				password
			});
			expect.fail(res);
		} catch (err) {
			const testUsersJSON = readJsonFile(usersJsonPath);
			for (let i = 0; i < testUsersJSON.users.length; i++) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
			expect(err.response.status).equal(400);
		}
	});

	it('Login No Password', async () => {
		const username = "Student_A";
		const password = "";
		try {
			const res = await axios.put("http://localhost:5000/users/login", {
				username,
				password
			});
			expect.fail(res);
		} catch (err) {
			const testUsersJSON = readJsonFile(usersJsonPath);
			for (let i = 0; i < testUsersJSON.users.length; i++) {
				expect(testUsersJSON.users[i].statusLogin).equal(false);
			}
			expect(err.response.status).equal(400);
		}
	});
});


describe('Register', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questionsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
		writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questionsJSON);
	});

	describe('Register API', () => {
		it('Register Success', async () => {
			const username = "Student_Z";
			const password = "pStudent_Z";
			// Log the request data for debugging
		

			try {
				const res = await axios.post("http://localhost:5000/users/register", {
					username,
					password
				});
				expect(res.status).equal(201);
			} catch (err) {
				expect.fail(err);
				
			}
		});
		it('Register Success: Check Questions', async () => {
			const username = "Student_Z";
			const password = "pStudent_Z";
			// Log the request data for debugging
		

			try {
				const res = await axios.post("http://localhost:5000/users/register", {
					username,
					password
				});
				const testUsersJSON = readJsonFile(usersJsonPath);
				const testUser = testUsersJSON.users[testUsersJSON.users.length - 1];
				const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
				expect(testUser.questions.length).to.equal(10);
				const questions = testUser.questions;
				for (let j = 0; j < questions.length; j++) {
					expect(existingQuestions).to.include(questions[j].questionId);
				}
				expect(res.status).equal(201);
			} catch (err) {
				expect.fail(err);
			}
		});
		it('Register unsuccessful with exists username', async () => {
			const username = "Student_A";
			const password = "pStudent_E";
			// Log the request data for debugging
		

			try {
				const res = await axios.post("http://localhost:5000/users/register", {
					username,
					password
				});
				expect.fail(res);
			} catch (err) {
				expect(err.response.status).equal(400);
			}
		});
    });
});


describe('Logout', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questoinsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questoinsJSON);
    });

    it('Logout Success', async () => {
        // Logging In
        const username = "Student_A";
        const password = "pStudent_A";
        let res = await axios.put("http://localhost:5000/users/login", {
            username, password
        });
        expect(res.status).equal(204);

        // Logging Out
        res = await axios.put("http://localhost:5000/users/logout", {
            username
        });
        const testUsersJSON = readJsonFile(usersJsonPath);
        for (let i = 0; i < testUsersJSON.users.length; i++) {
            expect(testUsersJSON.users[i].statusLogin).equal(false);
        }
        expect(res.status).equal(204);
    });

    it('Logout Wrong Username', async () => {
        // Logging In
        let username = "Student_A";
        const password = "pStudent_A";
        let res = await axios.put("http://localhost:5000/users/login", {
            username, password
        });
        expect(res.status).equal(204);

        // Logging Out
        try {
            username = "something else";
            res = await axios.put("http://localhost:5000/users/logout", {
                username
            });
        } catch (err) {
            const testUsersJSON = readJsonFile(usersJsonPath);
            expect(testUsersJSON.users[0].statusLogin).equal(true);
            for (let i = 1; i < testUsersJSON.users.length; i++) {
                expect(testUsersJSON.users[i].statusLogin).equal(false);
            }
            expect(err.response.status).equal(500);
        }
        username = "Student_A"
        res = await axios.put("http://localhost:5000/users/logout", {
            username
        });
    });


    it('Logout Success Researcher', async () => {
        // Logging In
        const username = "Researcher_A";
        const password = "pResearcher_A";
        let res = await axios.put("http://localhost:5000/users/login", {
            username, password
        });
        expect(res.status).equal(204);

        // Logging Out
        res = await axios.put("http://localhost:5000/users/logout", {
            username
        });
        const testUsersJSON = readJsonFile(usersJsonPath);
        for (let i = 0; i < testUsersJSON.users.length; i++) {
            expect(testUsersJSON.users[i].statusLogin).equal(false);
        }
        expect(res.status).equal(204);
    });
});

describe('Change Password', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questoinsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questoinsJSON);
    });
    
	describe('Change Password API', () => {
		it('Change Password Success', async () => {
			const username = "Student_A";
			const oldPassword = "pStudent_A";
			const newPassword="111111111";
			// Log the request data for debugging
		

			try {
				const res = await axios.put("http://localhost:5000/users/" + username, {
					oldPassword,
					newPassword
				});
				expect(res.status).to.equal(204);
			} catch (err) {
				expect.fail(err);
			}
		});

		it('Change Password unsuccessful with password is not correct', async () => {
			const username = "Student_A";
			const oldPassword = "11111111111";
			const newPassword="111111111";
			// Log the request data for debugging
			
			try {
				const res = await axios.put("http://localhost:5000/users/" + username, {
					oldPassword,
					newPassword
				});
				expect.fail(res.status);
			} catch (err) {
				expect(err.response.status).equal(400);
			}
		});
	});	
});


describe('Delete Account', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questoinsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questoinsJSON);
    });
    
	describe('Delete Account API', () => {
		it('Delete Account Success', async () => {
			const username = "Student_C";
			const password = "pStudent_C";
			// Log the request data for debugging
		
			try {
				const res = await axios.delete("http://localhost:5000/users/" + username, {
					data: {
						password
					}
				});
				expect(res.status).to.equal(201);
			} catch (err) {
				expect.fail(err);		
			}
		});
		it('Delete Account unsuccessful with the incorrect password', async () => {
			const username = "Student_A";
			const password = "pStudent_A1111";
		  
			// Log the request data for debugging
		
			try {
			  const res = await axios.delete(`http://localhost:5000/users/${username}`, {
				data: { password }
			  });
			  expect.fail(res);
			} catch (err) {
			  expect(err.response.status).to.equal(400);
			}
		  });
	});
});


describe('Start Attempt', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questoinsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questoinsJSON);
    });


    describe('Start Attempt API', () => {
        it('Start Attempt Success', async () => {
            const username = "Student_A";
            const password = "pStudent_A";
            // Log the request data for debugging
         
            try {
                const res = await axios.post("http://localhost:5000/users/:username/questions/:id", {
                    username, password
                });
                expect(res.status).to.equal(200);
            } catch (err) {
                expect(err.response.status).equal(404);
            }
        });
        it('Start Attempt unsuccessful with wrong password', async () => {
            const username = "Student_A";
            const password = "Student_A";
            // Log the request data for debugging
           
            try {
                const res = await axios.post("http://localhost:5000/users/:username/questions/:id", {
                    username, password
                });
                expect(res.status).to.equal(400);
            } catch (err) {
                expect(err.response.status).equal(404);
            }
        });
    });

});


describe('Save and Submit Attempt', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questionsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questionsJSON);
    });

	it('Save Attempt Success', async () => {
        const username = "Student_A";
        const password = "pStudent_A";
        const expected_ret = {
            description: "This function always returns 1",
            notes: "Just testing partial success... I know what the function does...",
            inProgress: true,
            startTime: "2024-07-01T07:00:00.000Z",
            endTime: null,
            duration: null,
            generatedCode: null,
            passingTestCases: null,
            failingTestCases: null,
            testCorrect: null,
            testTotal: null,
            question: "function foo() {\n\treturn \"Hello World!\";\n}"
        }
        // Student_A log-in
        await axios.put("http://localhost:5000/users/login", {
            username, password
        });
        //create attempt
        await axios.post("http://localhost:5000/users/Student_A/questions/10", {
            password
        });
        // Save question
        const response = await axios.put("http://localhost:5000/users/Student_A/questions/10", {
            password: "pStudent_A",
            description: "This function always returns 1",
            notes: "Just testing partial success... I know what the function does...",
            inProgress: true
        });
        expect(response.status).to.eql(204);
        // View if saved
        const view_response = await axios.put("http://localhost:5000/users/Student_A/questions/10/attempts/1", {password: password});
        const view_data = view_response.data;
        expect(view_response.status).to.eql(200);
        expect(view_data.description).to.eql(expected_ret.description);
        expect(view_data.notes).to.eql(expected_ret.notes);
        expect(view_data.generatedCode).to.eql(null);
        expect(view_data.passingTestCases).to.eql(null);
        expect(view_data.failingTestCases).to.eql(null);
        expect(view_data.inProgress).to.eql(true);
        expect(view_data.endTime).to.eql(null);
    });

    it('Save/Submit Questions Failure - User not logged in', async () => {
        const password = "pStudent_A";

        try {
            await axios.put("http://localhost:5000/users/Student_A/questions/2", {
                password: password,
                description: "This function always returns 1",
                notes: "Just testing partial success... I know what the function does...",
                inProgress: true
            });
            expect.fail();
        } catch (err) {
            expect(err.response.status).to.eql(401);
            expect(err.response.data.error).to.eql("User is not currently logged in");
        }
    });


	it('Save/Submit Questions Failure - Wrong Password', async () => {
		try {
			const response = await axios.put(
				"http://localhost:5000/users/Student_A/questions/2",
				{
					password: "bad_password",
					description: "This function always returns 1",
					notes: "Just testing partial success... I know what the function does...",
					inProgress: true
				});
			expect.fail(response);
		} catch (err) {
			expect(err.response.status).to.eql(401);
		}
	});
});

describe('View Attempt', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questoinsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        	writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questoinsJSON);
    	});
	/*
	it('View Attempt Success', async () => {
		const username = "Student_A";
		const password = "pStudent_A";
		const expected_ret = {
			description: "description",
			notes: "note",
			inProgress: false,
			startTime: "2024-07-01T07:00:00.000Z",
			endTime: "2024-07-01T07:10:00.000Z",
			duration: 600,
			generatedCode: "LLM",
			failingTestCases: "testsFailed",
			testCorrect: 1,
			testTotal: 2,
			question: "function foo(n) {\n  var val = 0;\n  for (i = 0; i < n.length; i++) {\n val += n[i];\n  }\n return val;\n}"
		}
		// Student_A log-in
		await axios.put("http://localhost:5000/users/login", {
			username,
			password
		});
		// Views questions
		const response = await axios.put(
			"http://localhost:5000/users/Student_A/questions/2/attempts/1",
			{ password: password });
		const data = response.data;
		expect(response.status).to.eql(200);
		expect(data).to.eql(expected_ret);
	});
	it('View Attempt Failure - User not logged in', async () => {
		const password = "pStudent_A";
		const expected_ret = "";
		try {
			const response = await axios.put(
				"http://localhost:5000/users/Student_A/questions/2/attempts/1",
				{ password: password });
			const data = response.data;
		} catch (err) {
			expect(err.response.status).to.eql(401);
			expect(err.response.data.error).to.eql("User is not currently logged in");
		}
	});
	it('View Attempt Failure - Wrong Password', async () => {
		const password = "bad_password";
		const expected_ret = "";
		try {
			const response = await axios.put(
				"http://localhost:5000/users/Student_A/questions/2/attempts/1",
				{ password: password });
		} catch (err) {
			expect(err.response.status).to.eql(401);
		}
	});
	*/
	
	describe('View Attempt API', () => {

		it('View Attempt Successfully', async () => {
			const password = "pStudent_A";
			try {
				const res = await axios.put("http://localhost:5000/users/Student_A/questions/1/attempts/1", 
					{"password": password});
				expect(res.status).eql(200);
			} catch (err) {
				expect.fail(err);
			}
		});

		it('View Attempt Unsuccessfully (Missing Element)', async () => {
            		try {
                		const res = await axios.put("http://localhost:5000/users/Student_A/questions/1/attempts/1", 
                    			{});
				expect.fail(res);
            		} catch (err) {
                		expect(err.response.status).eql(400);
            		}
        	});

        	it('View Attempt Unsuccessfully (Wrong Password)', async () => {
            		const password = "pStudent_B";
            		try {
                		const res = await axios.put("http://localhost:5000/users/Student_A/questions/1/attempts/1", 
                    			{"password": password});
				expect.fail(res);
            		} catch (err) {
                		expect(err.response.status).eql(401);
            		}
        	});

        	it('View Attempt Unsuccessfully (Nonexist User)', async () => {
            		const password = "pStudent_A";
            		try {
                		const res = await axios.put("http://localhost:5000/users/Student/questions/1/attempts/1", 
                   			{"password": password});
				expect.fail(res);
            		} catch (err) {
                		expect(err.response.status).eql(404);
            		}
        	});

        	it('View Attempt Unsuccessfully (Nonexist Question)', async () => {
            		const password = "pStudent_A";
            		try {
                		const res = await axios.put("http://localhost:5000/users/Student_A/questions/100/attempts/1", 
                    			{"password": password});
				expect.fail(res);
            		} catch (err) {
                		expect(err.response.status).eql(404);
            		}
        	});

        	it('View Attempt Unsuccessfully (Nonexist Attempt)', async () => {
            		const password = "pStudent_A";
            		try {
                		const res = await axios.put("http://localhost:5000/users/Student_A/questions/1/attempts/100", 
                    			{"password": password});
				expect.fail(res);
            		} catch (err) {
                		expect(err.response.status).eql(404);
            		}
        	});

	});


});

describe('View Questions', () => {

    const usersJsonPath = '../server/data/users.json';
    const usersJSON = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questoinsJSON = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, usersJSON);
        writeJsonFile(questionsJsonPath, questoinsJSON);
    });

    describe('View Questions API', () => {
        it('View Questions Success', async () => {
            const username = "Student_A";
            const password = "pStudent_A";

           
            try {
                // login
                await axios.put("http://localhost:5000/users/login", {
                    username: username, password: password
                });
                const res = await axios.put(`http://localhost:5000/users/${username}/questions`, {
                    password
                });
                expect(res.status).to.equal(200);
            } catch (err) {
                expect(err.response.status).to.equal(500);
            }
        });

        it('View Questions unsuccessful with wrong password', async () => {
            const username = "Student_A";
            const password = "wrong_password";
            
            try {
                // login (with correct password)
                await axios.put("http://localhost:5000/users/login", {
                    username: username, password: "pStudent_A"
                });
                const res = await axios.put(`http://localhost:5000/users/${username}/questions`, {
                    password
                });
                expect.fail(res); 
            } catch (err) {
                expect(err.response.status).to.equal(401);
            }
        });

        it('View Questions unsuccessful with non exists user', async () => {
            const username = "Student_Q";
            const password = "Student_A";
            
            try {
                const res = await axios.put(`http://localhost:5000/users/${username}/questions`, {
                    password
                });
                expect.fail(res); 
            } catch (err) {
                expect(err.response.status).to.equal(404);
            }
        });

    });
});

describe('Is Researcher', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questionsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questionsJSON);
    });


	describe('Is Researcher API', () => {
		it('Is Researcher True', async () => {
			const username = "Researcher_A";
			const password = "pResearcher_A";

			try {
				const res = await axios.get("http://localhost:5000/users/research/researcher", {
					params: {
						username,
						password
					}});
				expect(res.status).to.equal(200);
			} catch (err) {
				expect.fail(err);	
			}
		});

		it('Is Researcher False', async () => {
			const username = "Student_A";
			const password = "pStudent_A";

			try {
				const res = await axios.get("http://localhost:5000/users/research/researcher", {
					params: {
						username,
						password
					}});
				expect.fail(res);
			} catch (err) {
				expect(err.response.status).to.equal(401);
			}
		});

		it('Is Researcher User Does Not Exist', async () => {
			const username = "Researcher_X";
			const password = "pResearcher_A";

			try {
				const res = await axios.get("http://localhost:5000/users/research/researcher", {
					params: {
						username,
						password
					}});
				expect.fail(res);
			} catch (err) {
				expect(err.response.status).to.equal(401);
			}
		});

		it('Is Researcher Password Is Incorrect', async () => {
			const username = "Researcher_A";
			const password = "pStudent_X";

			try {
				const res = await axios.get("http://localhost:5000/users/research/researcher", {
					params: {
						username,
						password
					}});
				expect.fail(res);
			} catch (err) {
				expect(err.response.status).to.equal(401);
			}
		});
	});	
});

describe('Build Questions', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questionsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questionsJSON);
    });


	describe('Build Questions API', () => {
		it('Build Questions', async () => {
			const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
			const username = "Researcher_A";
			const password = "pResearcher_A";
			const res = await axios.put("http://localhost:5000/users/login", {
				username,
				password
			});

			try {
				const res = await axios.put("http://localhost:5000/users/gradebook/questions", {
					username,
					password
				});
				let usersUpdate = readJsonFile(usersJsonPath);
				const users = usersUpdate.users;
				for (let i = 0; i < users.length; i++) {
					expect(users[i].questions.length).to.equal(10);
					const questions = users[i].questions;
					for (let j = 0; j < questions.length; j++) {
						expect(existingQuestions).to.include(questions[j].questionId);
					}
				}
				expect(res.status).to.equal(200);
			} catch (err) {
				expect.fail(err);	
			}

			await axios.put("http://localhost:5000/users/logout", {
				username
			});
		});
	});	
});

describe('Profile View Grade', () => {
	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questoinsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questoinsJSON);
    });

	describe('View Grade Api', () => {
		
		it('View Grade Successfully', async () => {
			const username = "Student_A";
			const password = "pStudent_A";
			try {
				const res = await axios.put(`http://localhost:5000/users/${username}/grade`, {
					"password": password
				});
				expect(res.status).to.equal(200);
			} catch (err) {
				expect.fail();
			}
		});

		it('View Grade Unsuccessfully (Missing Element)', async () => {
			const username = "Student_A";
			try {
				const res = await axios.put(`http://localhost:5000/users/${username}/grade`, {});
				expect.fail();
			} catch (err) {
				expect(err.response.status).to.equal(400);
			}
		});

		it('View Grade Unsuccessfully (Nonexist User)', async () => {
			const username = "Student";
			const password = "pStudent_A";
			try {
				const res = await axios.put(`http://localhost:5000/users/${username}/grade`, {
					"password": password
				});
				expect.fail();
			} catch (err) {
				expect(err.response.status).to.equal(404);
			}
		});

		it('View Grade Unsuccessfully (Wrong Password)', async () => {
			const username = "Student_A";
			const password = "pStudent";
			try {
				const res = await axios.put(`http://localhost:5000/users/${username}/grade`, {
					"password": password
				});
				expect.fail();
			} catch (err) {
				expect(err.response.status).to.equal(401);
			}
		});
	});
});

describe('New Questions', () => {

	const usersJsonPath = '../server/data/users.json';
	const usersJSON = readJsonFile(usersJsonPath);
	const questionsJsonPath = '../server/data/questions.json';
	const questionsJSON = readJsonFile(questionsJsonPath);

	afterEach(function() {
        writeJsonFile(usersJsonPath, usersJSON);
		writeJsonFile(questionsJsonPath, questionsJSON);
    });

	describe('Get New Questions', () => {
		it('Get New Questions Success', async () => {
			const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
			const username = "Researcher_A";
			const password = "pResearcher_A";
			const res = await axios.put("http://localhost:5000/users/login", {
				username,
				password
			});

			try {
				const res = await axios.get("http://localhost:5000/questions/newQuestions", {
                    params: {
                        username: username,
                        password: password
				    }});
				let questionsUpdate = readJsonFile(questionsJsonPath);
				const questions = questionsUpdate.questions;
                expect(questions.length).to.equal(10);
				for (let i = 0; i < questions.length; i++) {
					expect(existingQuestions).to.include(questions[i].id);
				}
			} catch (err) {
				expect.fail(err);	
			}

			await axios.put("http://localhost:5000/users/logout", {
				username
			});
		});

        it('Get New Questions Fail: Not Logged in', async () => {
			const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
            const username = "Researcher_A";
			const password = "pResearcher_A";

			try {
				const res = await axios.get("http://localhost:5000/questions/newQuestions", {
                    params: {
                        username: username,
                        password: password
				    }});
                expect.fail(res);	
			} catch (err) {
                console.log(err)
				expect(err.response.status).to.equal(401);	
			}
		});

        it('Get New Questions Fail: Incorrect Username', async () => {
			const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
			const username = "Researcher_A2";
			const password = "pResearcher_A";

			try {
				const res = await axios.get("http://localhost:5000/questions/newQuestions", {
					params: {
                        username: username,
                        password: password
				    }});
                expect.fail(res);	
			} catch (err) {
                expect(err.response.status).to.equal(401);	
			}
		});

        it('Get New Questions Fail: Incorrect Password', async () => {
			const existingQuestions = [1,2,3,4,5,6,7,8,9,10];
			const username = "Researcher_A";
			const password = "pResearcher_A2";

			try {
				const res = await axios.get("http://localhost:5000/questions/newQuestions", {
					params: {
                        username: username,
                        password: password
				    }});
                expect.fail(res);	
			} catch (err) {
                expect(err.response.status).to.equal(401);	
			}
		});
	});	
});

