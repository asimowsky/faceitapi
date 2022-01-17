// const APIURL = "https://api.github.com/user";

// const main = document.getElementById("main");
// const search = document.getElementById("search");
// const form = document.getElementById("form");

// async function getUser(user) {

//     const resp = await fetch(APIURL + user);
//     const respData = await resp.json();

//     createUserCard(respData);
// }

// function createUserCard(user) {
//     const cardHTML = `

//         <img src="${user.avatar_url}"></img>

//     `;
//     main.innerHTML = cardHTML;
// }

// form.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const user = search.value;
//     if (user) {
//         getUser(user);

//         search.value = "";
//     }
// });
let players = [];
let singlePlayer;
let nickname;
let playerID;
let games;

let country;
let target = 100;



function getFaceitStats() {
    singlePlayer = [];
    nickname = '';
    playerID = '';
    games = [];
    

    nickname = $('#nnInput').val();

    let this_url = `https://open.faceit.com/data/v4/players?nickname=${nickname}`;
    $.ajax({
        url: this_url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer a33b2195-1f61-4528-bd7e-14def60f8864")
        },
        success: function (data) {
            playerID = data.player_id;
            getGamesOfPlayer(playerID);
        }
    });
}

function getGamesOfPlayer(playerID) {
    let this_url = `https://open.faceit.com/data/v4/players/${playerID}/history?game=csgo&from=1356994800&limit=100`;
    $.ajax({
        url: this_url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer a33b2195-1f61-4528-bd7e-14def60f8864")
        },
        success: function (data) {
            for (let i of data.items) {
                games.push({
                    "id": i.match_id,
                    "finishedAt": i.finished_at
                });
            }
            getStatsOfGame(games);
        }
    });
}

function getStatsOfGame(games) {
    let gameCounter = 0;
    let until = games.length;
    for (let v of games) {
        let this_url = `https://open.faceit.com/data/v4/matches/${v.id}/stats`;
        $.ajax({
            url: this_url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer a33b2195-1f61-4528-bd7e-14def60f8864")
            },
            success: function (data) {
                gameCounter++;
                let players_0 = data.rounds[0].teams[0].players;
                let players_1 = data.rounds[0].teams[1].players;
                let player;
                let found = false;
                for (let p of players_0) {
                    if (p.player_id == playerID) {
                        player = p;
                        found = true;
                    }
                }
                for (let p of players_1) {
                    if (p.player_id == playerID) {
                        player = p;
                        found = true;
                    }
                }
                if (!found) {
                    player = {};
                }
                if (player.hasOwnProperty('player_stats')) {
                    let a = {
                        matchID: v,
                        player: player
                    };
                    singlePlayer.push(a);
                }
                if (gameCounter == until) {
                    prepareData();
                }
            },
            error: function () {
                console.log("Error occured: No gamedata found");
                gameCounter++;
            }
        });
    }
}

function prepareData() {
    let unsorted = singlePlayer;
    let finNumbers = [];
    for (let e of unsorted) {
        finNumbers.push(e.matchID.finishedAt);
    }
    let sorted = bubbleSort(finNumbers);
    let statsSorted = [];
    for (let i = 0; i < sorted.length; i++) {
        let time = sorted[i];
        for (let j = 0; j < singlePlayer.length; j++) {
            if (time == singlePlayer[j].matchID.finishedAt) {
                statsSorted.push(singlePlayer[j]);
            }
        }
    }
    players.push({
        "nickname": nickname,
        "stats": statsSorted,
     
    });
    console.log(players);
    console.log(players.length - 1);
    $('#playersSelect').append($('<option>', {
        value: players.length - 1,
        text: nickname
    }));
     alert("Data arrived!");
    $('#nnInput').val('');

    addTableContent(players.length - 1);
}

function addTableContent(index) {
    let c = players[index];

    let playername = c.nickname;
    let kills = 0;
    let assists = 0;
    let deaths = 0;
    let headshots = 0;
    let kd = 0;
    let kr = 0;
    let mvps = 0;
    let triples = 0;
    let quadros = 0;
    let pentas = 0;

    console.log(c);
    console.log(c.stats.length);
    for (let i = 0; i < c.stats.length; i++) {
        kills += parseFloat(c.stats[i].player.player_stats.Kills);
        assists += parseFloat(c.stats[i].player.player_stats.Assists);
        deaths += parseFloat(c.stats[i].player.player_stats.Deaths);
        headshots += parseFloat(c.stats[i].player.player_stats["Headshots %"]);
        kd += parseFloat(c.stats[i].player.player_stats["K/D Ratio"]);
        kr += parseFloat(c.stats[i].player.player_stats["K/R Ratio"]);
        mvps += parseFloat(c.stats[i].player.player_stats.MVPs);
        triples += parseFloat(c.stats[i].player.player_stats["Triple Kills"]);
        quadros += parseFloat(c.stats[i].player.player_stats["Quadro Kills"]);
        pentas += parseFloat(c.stats[i].player.player_stats["Penta Kills"]);
    }
    let k = c.stats.length;
    $('#numberComparison').append(`<tr>
      
<td>${playername}</td>
<td>${Math.round((kills / k) * 100) / 100}</td>
<td>${Math.round((assists / k) * 100) / 100}</td>




</tr>`);
$('#numberComparison2').append(`<tr>

<td>${Math.round((deaths / k) * 100) / 100}</td>
<td>${Math.round((headshots / k) * 100) / 100}</td>
<td>${Math.round((kd / k) * 100) / 100}</td>



</tr>`);
}
 // <td>${Math.round((kr / k) * 100) / 100}</td>
 // <td>${Math.round((mvps / k) * 100) / 100}</td>
// <td>${Math.round((triples / k) * 100) / 100}</td>
// <td>${Math.round((quadros / k) * 100) / 100}</td>
// <td>${Math.round((pentas / k) * 100) / 100}</td>
  
// <td>${kills - deaths}</td>

function bubbleSort(array) {
    for (let n = array.length; n > 1; n--) {
        for (let i = 0; i < n - 1; i++) {
            if (array[i] > array[i + 1]) {
                let i1 = array[i + 1];
                array[i + 1] = array[i];
                array[i] = i1;
            }
        }
    }
    return array;
}

function prepareLabels(targetCount) {
    let result = [];
    for (let i = 1; i <= targetCount; i++) {
        result.push(i);
    }
    return result;
}