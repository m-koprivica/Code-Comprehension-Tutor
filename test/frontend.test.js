import { expect } from "chai";

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