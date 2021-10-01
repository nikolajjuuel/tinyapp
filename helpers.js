function generateRandomString() {
    const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const urlShort = [];
    for (let i = 0; i < 6; i++) {
      const random = Math.floor(Math.random() * options.length + 1);
      urlShort.push(options[random])
    }
    return urlShort.join('');
  }

  const getUserByEmail = function (email, database){
    for (const data in database) {
      const user = database[data];
      if (user.email === email) {
        return user
      }
    }
    return null
  };

module.exports = {
    getUserByEmail,
    generateRandomString
}
