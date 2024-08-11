import * as chai from 'chai'; 
/**
 * Run the provided code and tests
 * @param {string} code - The code to evaluate
 * @param {Array} tests - The array of tests to run
 * @returns {Object} The result of the test run
 */
// check the questionCode whether is valid
function isValidFunction(x) {
    let result;
    try {
        result = eval(x);
        return true;
    } catch (e) {
        return false; 
    }
}
// check the questionCode can pass all tests or not
export function runTests(code, tests) {
    const failedTests = [];
    try {
        if (!isValidFunction(code)){
            throw error("not a valid function");
        }
        eval("global.foo = " + code);

        tests.forEach(test => {
            try {
                eval(test.assertion);
            } catch (assertionError) {
                failedTests.push({
                    title: test.title,
                    assertion: test.assertion,
                    error: assertionError.message
                });
            }
        });

        if (failedTests.length > 0) {
            throw new Error("Some tests failed");
        }
        
        return { success: true };

    } catch (err) {
        return { 
            success: false, 
            error: err.message,
            details: failedTests.length > 0 ? failedTests : err.message 
        };
    }
}