const { generateRandomString, getUserByEmail } = require('../helpers');
const assert = require('chai').assert;

describe("#generateRandomString", () => {
  it("should return a string", () => {
    assert.isString(generateRandomString());
  });
});


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('#getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(getUserByEmail(expectedOutput, user));
  });

  it('if incorrect email should return undefined', function () {
    const user = getUserByEmail("invalid@email.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(getUserByEmail(expectedOutput, user));
  });
});


