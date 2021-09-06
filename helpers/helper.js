module.exports = {
    firstUpper: (username) => {
        const name = username.toLowerCase();
        return name.charAt(0).toLowerCase() + name.slice(1);
    },
    lowerCase: str => {
        return str.toLowerCase();
    }
}