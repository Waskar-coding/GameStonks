//Main function
module.exports = (start, stop, step) => {
    let result = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {result.push(i)}
    return result;
};