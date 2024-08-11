# Project-Groups-06-Lab-A

**Project:** Code Comprehension Tutor  
**Group:** Daniel Lee, Matija Koprivica, Arshvir Bhandal, Mark Zhu, Chuyi Zheng  

**Description**

The project enables students to answer questions where they describe the purpose of a JavaScript function. To assess code comprehension, their description is used as a prompt in an LLM to generate a function. This function is evaluated against test cases to determine its functional equivalence to the original function. The function and test results are then shown to the student.

The project also includes a gradebook and tools related to question management. The gradebook enables a researcher to view the scores of each student for each question. The question management tools allow a researcher to add new questions and edit the code or tests of existing ones.

**Feature Core**

- Register
- Login
- Logout
- Question Bank
- Question

**Feature Unique**

- Tutorial (Minor)
- Change Password (Minor)
- Delete Account (Minor)
- Gradebook (Major)
- Question Management (Major)

**Student vs Researcher**

There are two types of accounts, students and researchers. The Gradebook and Question Management Tools are restricted to researchers. You cannot register a researcher account, but you can use the following account to login as a researcher.

Username: Researcher_A
<br>Password: pResearcher_A

**Model**

https://ollama.com/library/stable-code

We are using the stable-code model from Ollama. Please note that using an LLM to generate code from a description is not perfect. If there are syntax errors, we display the generated code in the frontend and all of the tests will fail.

**Citation**

- https://www.shutterstock.com/zh/image-vector/grading-system-f-set-grades-school-2212741195
- https://github.com/astrit/css.gg.git
- https://kenney.nl/assets/interface-sounds

# Setup

**Docker Compose**

1. Install "Docker Desktop"
2. Open "Docker Desktop"
3. In top-level of project folder, execute without quotes "docker compose up --build -d".
4. Open "http://localhost:5000/"

After building the project, you will need to wait 3 minutes before accessing http://localhost:5000/. This is necessary to retrieve the model from Ollama. If you do not want to wait this amount of time, then you can comment out “sleep 3m” in entrypointapp.sh. This may result in unexpected behaviour.

**Test Suite Unit**

There are over 80 unit tests in the project. However, considering most of the unit tests invoke the API, it is necessary to run the backend in order to run the tests. The backend will generate server/report.html based on test/alltest.test.js. Any changes made to test/alltest.test.js while the backend is running will automatically update report.html.

1. Install Axios
- In the test folder, execute without quotes "npm install axios".
2. Install Concurrently
- In the server folder, execute without quotes "npm install concurrently".
3. Backend Run
- In the server folder, execute without quotes “npm start”.
4. Open Test Suite
- In the server folder, open in your web browser “report.html”.

**Test Suite Manual**

https://docs.google.com/spreadsheets/d/1I9KqvwTJo8QG4nt4EdNd7mwhYY237tFcL0d9Uu3QKuE/edit?usp=sharing

A significant portion of testing was conducted manually in the frontend. A link to our manual test suite and their related test plans are included above.
