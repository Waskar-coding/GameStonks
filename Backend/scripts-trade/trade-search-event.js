//Main function
module.exports = {
    filterEventOffers: (req, searchResults) => {
        //Unpacking query
        const {
            inner_sort, inner_order,
            filter_type_out, filter_type_in,
            search, is_auth
        } = req.query;

        //Filtering
        /*
        We start filtering by using the
        search parameter as a regex
        expression (non case sensitive)
        */
        let eventOffers = searchResults[0].event_offers.filter(offer =>
            RegExp(search).test(offer.offer_user_name.toLowerCase())
        );
        /*
        If the user is authenticated
        we do not want to send their
        own offer
        */
        if(is_auth === 'true'){
            eventOffers = eventOffers.filter(offer => offer.offer_user_id !== req.user.user.steamid);
        }
        /*
        Finally we filter the type of
        offers the user wants to see
        */
        if(filter_type_out !== ''){
            eventOffers = eventOffers.filter(offer => filter_type_out.includes(offer.offer_type_out));
        }
        if(filter_type_in !== ''){
            eventOffers = eventOffers.filter(offer => filter_type_in.includes(offer.offer_type_in));
        }

        //Sorting
        /*
        We continue by sorting the
        filtered values, the type of
        sorting is decided by the
        inner_sort parameter and the
        order parameter
        */
        if(inner_sort === 'date') return eventOffers.sort((a,b) =>
            Number(inner_order) * (new Date(b.offer_date) - new Date(a.offer_date)
        ))
        else return eventOffers.sort((a,b) =>
            Number(inner_order) * (b.offer_user_name.toLowerCase() > a.offer_user_name.toLowerCase()? 1 : -1)
        )
    },
    successEventOffers: (req, count, newSearchResults) => {
        return {
            current_n: count,
            items: newSearchResults
        }
    }
}