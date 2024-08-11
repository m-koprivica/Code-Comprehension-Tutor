// Tests related to the API of the question builder page
import axios from "axios";
import {expect} from "chai"
import fs from "fs";

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

// Tests

// Template test that you may use.
describe("Example test", () => {

    const usersJsonPath = '../server/data/users.json';
    const users_json = readJsonFile(usersJsonPath);
    const questionsJsonPath = '../server/data/questions.json';
    const questions_json = readJsonFile(questionsJsonPath);

    afterEach(function () {
        writeJsonFile(usersJsonPath, users_json);
        writeJsonFile(questionsJsonPath, questions_json);
    });

    it("Testing", async () => {
       // make api call and assertions here
    });
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
