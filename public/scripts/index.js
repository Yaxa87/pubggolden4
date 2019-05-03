
let playerNameList = [];

let season = 'division.bro.official.pc-2018-02';

const playerList = new Vue({
    el: '#player-list',
    data: {
        playerList: playerNameList,
        season: 'division.bro.official.pc-2018-02'
    }
})

function calcTotalGames(item) {
    return item.FPPStats.DuoGames + item.FPPStats.SquadGames;
}

function calcTrueKD(item, totalGames) {
    let average = ((item.FPPStats.Duo * item.FPPStats.DuoGames) + (item.FPPStats.Squad * item.FPPStats.SquadGames)) / totalGames;
    return average && totalGames > 3 ? Math.round(average * 100) / 100 : 0;
}

function calcRanking() {
    playerNameList.sort((a, b) => {
        return b.FPPStats.AverageKD - a.FPPStats.AverageKD;
    });

    playerNameList.forEach((player, index) => {
        player.Rank = index+1;
    });
}

function calcBadgeStats() {
    // getting rounded stats for badges
    playerNameList.forEach(player => {
        player.FPPStats.AverageAssists = (Math.round((player.FPPStats.Assists / player.FPPStats.TotalGames) * 100) / 100) || 0;
        player.FPPStats.AverageDamageDealt = (Math.round(player.FPPStats.DamageDealt / player.FPPStats.TotalGames)) || 0;
        player.FPPStats.AverageHeadshotKills = (Math.round((player.FPPStats.HeadshotKills / player.FPPStats.TotalGames) * 100) / 100) || 0;
        player.FPPStats.LongestKill = Math.round(player.FPPStats.LongestKill);
        player.FPPStats.AverageRevives = (Math.round((player.FPPStats.Revives / player.FPPStats.TotalGames) * 100) / 100) || 0;
    });

    // assigning badges to players
    playerNameList.forEach(player => {
        player.FPPStats.AssistsChamp = player.FPPStats.TotalGames > 3 && playerNameList.filter(chap => chap.FPPStats.TotalGames > 3).every(opponent => player.FPPStats.AverageAssists >= opponent.FPPStats.AverageAssists );
        player.FPPStats.DamageDealtChamp = player.FPPStats.TotalGames > 3 && playerNameList.filter(chap => chap.FPPStats.TotalGames > 3).every(opponent => player.FPPStats.AverageDamageDealt >= opponent.FPPStats.AverageDamageDealt );
        player.FPPStats.HeadshotKillsChamp = player.FPPStats.TotalGames > 3 && playerNameList.filter(chap => chap.FPPStats.TotalGames > 3).every(opponent => player.FPPStats.AverageHeadshotKills >= opponent.FPPStats.AverageHeadshotKills );
        player.FPPStats.LongestKillChamp = playerNameList.every(opponent => player.FPPStats.LongestKill >= opponent.FPPStats.LongestKill );
        player.FPPStats.RevivesChamp = player.FPPStats.TotalGames > 3 && playerNameList.filter(chap => chap.FPPStats.TotalGames > 3).every(opponent => player.FPPStats.AverageRevives >= opponent.FPPStats.AverageRevives );
        player.FPPStats.MostSoloGamesChamp = playerNameList.every(opponent => player.FPPStats.SoloGames >= opponent.FPPStats.SoloGames );
    });
}

function getPlayersStats(players, season) {

    function playersLoop() {
        players.forEach(player => {
            getPUBGPlayerStats(player, season);
        });

        setTimeout(playersLoop, 60000);
    };
    playersLoop();

    function getPUBGPlayerStats(player, season) {
        axios({
            url: `https://api.pubg.com/shards/steam/players/${player.AccountId}/seasons/${season}`,
            method: 'get',
            headers: {
                "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNDExM2QzMC03ZDEwLTAxMzYtMWI4NS00M2M4NGY0YzllNTEiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTMzNzE1Njc1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InlheGEifQ.roGtVqL6nqURMlR7TIKz5bab2z2vymCeAQhM83t8KpU",
                "Accept": "application/json"
            }
        })
            .then(res => {
                console.log('getPUBGPlayerStats successful')
                console.log(res.data);

                const stats = res.data.data.attributes

                playerNameList.forEach(item => {
                    if (item.Name === player.Name) {
                        item.FPPStats.Solo = stats.gameModeStats["solo-fpp"].roundsPlayed ? Math.round(stats.gameModeStats["solo-fpp"].kills / stats.gameModeStats["solo-fpp"].losses * 100) / 100 : 0;
                        item.FPPStats.SoloGames = stats.gameModeStats["solo-fpp"].roundsPlayed;
                        item.FPPStats.Duo = stats.gameModeStats["duo-fpp"].roundsPlayed ? Math.round(stats.gameModeStats["duo-fpp"].kills / stats.gameModeStats["duo-fpp"].losses * 100) / 100 : 0;
                        item.FPPStats.DuoGames = stats.gameModeStats["duo-fpp"].roundsPlayed;
                        item.FPPStats.Squad = stats.gameModeStats["squad-fpp"].roundsPlayed ? Math.round(stats.gameModeStats["squad-fpp"].kills / stats.gameModeStats["squad-fpp"].losses * 100) / 100 : 0;
                        item.FPPStats.SquadGames = stats.gameModeStats["squad-fpp"].roundsPlayed;
                        item.FPPStats.TotalGames = calcTotalGames(item);
                        item.FPPStats.AverageKD = calcTrueKD(item, item.FPPStats.TotalGames);
                        item.FPPStats.Assists = stats.gameModeStats["duo-fpp"].assists + stats.gameModeStats["squad-fpp"].assists;
                        item.FPPStats.DamageDealt = stats.gameModeStats["duo-fpp"].damageDealt + stats.gameModeStats["squad-fpp"].damageDealt;
                        item.FPPStats.HeadshotKills = stats.gameModeStats["duo-fpp"].headshotKills + stats.gameModeStats["squad-fpp"].headshotKills;
                        item.FPPStats.LongestKill = Math.max(stats.gameModeStats["duo-fpp"].longestKill, stats.gameModeStats["squad-fpp"].longestKill) || 0;
                        item.FPPStats.Revives = stats.gameModeStats["duo-fpp"].revives + stats.gameModeStats["squad-fpp"].revives;
                    }
                });

                calcRanking();
                calcBadgeStats();
                saveGolden4DataToDB(playerNameList);
            })
            .catch(error => {
                console.log('getPUBGPlayerStats failed')
                console.log(error);
            });
    };
}


function initPlayerData(data) {
    data.forEach((player, index) => {
        let item = {
            Id: player.id,
            Name: player.name,
            AccountId: player.pubg_id,
            FPPStats: {
                Solo: player.solo,
                SoloGames: player.solo_games,
                Duo: player.duo,
                DuoGames: player.duo_games,
                Squad: player.squad,
                SquadGames: player.squad_games,
                AverageKD: player.average_kd,
                Assists: player.assists,
                DamageDealt: player.damage_dealt,
                HeadshotKills: player.headshot_kills,
                LongestKill: player.longest_kill,
                Revives: player.revives,
                TotalGames: player.total_games
            },
            Rank: index
        }

        playerNameList.push(item);
    });

    calcRanking();
    calcBadgeStats();

    getPlayersStats(playerNameList, season);
    checkSeasons();
}

function getGolden4DataFromDB() {
    axios({
        url: window.location.href + 'golden4data',
        method: 'get'
    })
        .then(res => {
            console.log('getGolden4DataFromDB successful')
            console.log(res.data);
            initPlayerData(res.data);
        })
        .catch(error => {
            console.log('saveGolden4DataToDB failed')
            console.log(error);
        });
}

getGolden4DataFromDB();

function saveGolden4DataToDB(data) {
    let dbData = data.map(item => {
        return {
            id: item.Id,
            name: item.Name,
            pubg_id: item.AccountId,
            solo: item.FPPStats.Solo,
            solo_games: item.FPPStats.SoloGames,
            duo: item.FPPStats.Duo,
            duo_games: item.FPPStats.DuoGames,
            squad: item.FPPStats.Squad,
            squad_games: item.FPPStats.SquadGames,
            average_kd: item.FPPStats.AverageKD,
            assists: item.FPPStats.Assists,
            damage_dealt: item.FPPStats.DamageDealt,
            headshot_kills: item.FPPStats.HeadshotKills,
            longest_kill: item.FPPStats.LongestKill,
            revives: item.FPPStats.Revives,
            total_games: item.FPPStats.TotalGames
        }
    })

    axios({
        url: window.location.href + 'savegolden4data',
        method: 'post',
        data: dbData
    })
        .then(res => {
            console.log('saveGolden4DataToDB successful')
            console.log(res.data);
        })
        .catch(error => {
            console.log('saveGolden4DataToDB failed')
            console.log(error);
        });
}


// checking seasons
function checkSeasons() {
    axios({
        url: 'https://api.pubg.com/shards/steam/seasons',
        method: 'get',
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNDExM2QzMC03ZDEwLTAxMzYtMWI4NS00M2M4NGY0YzllNTEiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTMzNzE1Njc1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InlheGEifQ.roGtVqL6nqURMlR7TIKz5bab2z2vymCeAQhM83t8KpU",
            "Accept": "application/json"
        }
    })
        .then(res => {
            console.log('get seasons successful')
            console.log(res.data);
            getCurrentSeason(res.data.data);
        })
        .catch(error => {
            console.log('get seasons failed')
            console.log(error);
        });
}

function getCurrentSeason(seasons) {
    let currentSeason = seasons.find(season => {
        return season.attributes.isCurrentSeason;
    }).id;

    // TODO: finish current season functionality

}