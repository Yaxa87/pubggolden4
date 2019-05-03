const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

// postgresql
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

client.connect();

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/pages/index.html'));
});

async function getGolden4Data() {
    let promise = new Promise((resolve, reject) => {
        client.query('SELECT * FROM golden4db;', (err, res) => {
            if (err) throw err;

            resolve(res.rows)
        });
    })

    let result = await promise;

    return result;
}

async function saveGolden4Data(data) {
    let promises = [];

    data.forEach(player => {
        let queryString = 'UPDATE golden4db SET ' 
                            + 'solo = ' + player.solo
                            + ', solo_games = ' + player.solo_games
                            + ', duo = ' + player.duo
                            + ', duo_games = ' + player.duo_games
                            + ', squad = ' + player.squad
                            + ', squad_games = ' + player.squad_games
                            + ', average_kd = ' + player.average_kd
                            + ', assists = ' + player.assists
                            + ', damage_dealt = ' + player.damage_dealt
                            + ', headshot_kills = ' + player.headshot_kills
                            + ', longest_kill = ' + player.longest_kill
                            + ', revives = ' + player.revives
                            + ', total_games = ' + player.total_games
                            + ' WHERE ID = ' + player.id + ';';

        let promise = new Promise((resolve, reject) => {
            client.query(queryString, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        })

        promises.push(promise)
    })

    let combinedPromise = await Promise.all(promises);

    return combinedPromise;
}

app.get('/golden4data', (req, res) => {
    getGolden4Data()
        .then((data) => {
            res.end(JSON.stringify(data));
        })
});

app.post('/savegolden4data', (req, res) => {
    saveGolden4Data(req.body)
        .then((data) => {
            res.send({status: 'Success'})
        })
})

app.post('/archivescores', (req, res) => {
    // save data to archive table
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))

app.use(express.static(path.join(__dirname, 'public')))



