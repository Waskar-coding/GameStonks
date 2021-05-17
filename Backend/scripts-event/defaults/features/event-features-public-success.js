module.exports = (newSearchResults) => {
    return new Promise(resolve => {resolve(
        newSearchResults.map(product => {
            return {
                productId: product.product_id, name: product.name,
                thumbnail: product.thumbnail, release: product.release
            }
        })
    )})
}