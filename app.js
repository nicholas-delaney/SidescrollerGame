// express boilerplate
const express = require('express');
let app = express();
// mongoDB boilerplate
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://nicholasdelaney:79130Hoe!@nickdb-vlvu9.mongodb.net/NickDB?retryWrites=true&w=majority";
const dbName = "NickDB";
const http = require('http').createServer(app);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
let port = process.env.PORT;
if (port == null || port == "") {
    port = 2000;
}
http.listen(port);

// check if level name is taken
async function isLevelNameTaken(data) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("levels").findOne({ name: data.name });
        // ask to overwrite level if name is taken
        if (result) {
            io.sockets.emit('nameTaken', {
                name: data.name,
                lvlData: data.levelData
            });
        }
        // save level if name not taken
        else {
            getLevelsFromDatabase();
            const result = await client.db(dbName).collection("levels").insertOne(data);
            io.sockets.emit('levelSaved', {
                name: data.name
            });
        }
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
}
// overwrite level data
async function updateLevel(data) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("levels").updateOne(
            { name: data.name },
            { $set: { "levelData": data.lvlData } });
        client.close();
        getLevelsFromDatabase();
        io.sockets.emit('levelSaved', {
            name: data.name
        });
    } catch (err) {
        console.log(err.stack);
    }
}
// find level to be loaded into level editor
async function findLevel(levelName) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("levels").findOne({ name: levelName });
        if (result) {
            io.sockets.emit('levelToBeLoaded', {
                lvlData: result,
                name: levelName,
            });
        }
        else {
            io.sockets.emit('levelNotFound', {
                name: levelName,
            })
        }
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
}
// delete level (not used in program)
async function deleteLevel(data) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("levels").deleteOne({ name: data.levelName });
        client.close();
    }
    catch (err) {
        console.log(err.stack);
    }
}
// add a new account to the database
async function addAccount(data) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("accounts").findOne({ username: data.username });
        if (result) {
            io.sockets.emit('signUpResponse', {
                success: false,
                msg: "Username Taken"
            });
        }
        else {
            const result = await client.db(dbName).collection("accounts").insertOne(data);
            io.sockets.emit('signUpResponse', {
                success: true,
                msg: "Account Created"
            });
        }
        client.close();
    } catch (err) {
        console.log(err.stack);
    }

}
// check if password is correct
async function isValidPassword(data) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("accounts").findOne({ username: data.username });
        if (result) {
            if (result.password === data.password) {
                io.sockets.emit('signInResponse', {
                    success: true
                });
            }
            else {
                io.sockets.emit('signInResponse', {
                    success: false,
                    msg: "Invalid Password"
                });
            }
        }
        else {
            io.sockets.emit('signInResponse', {
                success: false,
                msg: "Invalid Username"
            });
        }
    } catch (err) {
        console.log(err.stack);
    }
}
// return all levels from the database to the client
async function getLevelsFromDatabase() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const result = await client.db(dbName).collection("levels").find().toArray();
        io.sockets.emit('getLevels', {
            levels: result
        });
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
}
// when client connects to the server
const io = require('socket.io')(http);
io.sockets.on('connection', (socket) => {
    // send levels on database to client
    getLevelsFromDatabase();
    // save / load levels
    socket.on('newLevel', (data) => {
        isLevelNameTaken(data);
    });
    socket.on('overwriteLevel', (data) => {
        updateLevel(data);
    });
    socket.on('loadLevel', (data) => {
        findLevel(data.name);
    });
    // sign in / sign up
    socket.on('signIn', (data) => {
        isValidPassword(data);
    });
    socket.on('signUp', (data) => {
        addAccount(data);
    });
});

