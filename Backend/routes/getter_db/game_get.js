//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Game = require('../object_db/game_db.js');

//Game search data for an event
router.get('/games/:eventId/find',function(req, res){
    /*
        Find all games included within an event
    */
    const search = new RegExp(req.query.search,'i');
    const gamesPerPage = 2;
    const offset = gamesPerPage * (req.query.page-1);
    Game.find({current_events: req.params.event_id})
        .collation({locale: "en"})
        .sort({[req.query.sort]: req.query.order})
        .then(games => {
            const filteredGames = games.filter(game => {return search.test(game.name)});
            const filteredGamesCount = filteredGames.length;
            const filteredGamesPage = filteredGames.slice(offset, offset + gamesPerPage);
            res.send({
                count: filteredGamesCount,
                games: filteredGamesPage.map(game => {
                    return {
                        appid: game.appid,
                        name: game.name,
                        release: game.release,
                        thumbnail: game.thumbnail
                    }
                })
            })
        })
        .catch(() => {
            res.send({Error: "Internal server error"})
        })
});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
