//Main function
module.exports = (user,ban) => {
    const today = new Date();
    return today < ban.ban_end
}