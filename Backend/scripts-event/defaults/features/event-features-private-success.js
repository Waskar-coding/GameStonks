module.exports = (userId, eventId, newSearchResults) => {
    return new Promise(resolve => {resolve(
        newSearchResults.map(product => {
            const currentRegister = product.registers.filter(register => {return register.event_id === eventId}).pop();
            return {
                productId: product.product_id, name: product.name, thumbnail: product.thumbnail,
                release: product.release, monitored: currentRegister.event_users.includes(userId)
            }
        })
    )})

}