const express = require('express');
const app = express();
const webSocket = require('ws');
const fs = require('fs');
const exporessPort = 9002;
const websocketPort = 8080;

//Data before landing on the page
let initialData = "Data is new";
let counter = 1;

// API to write the data from the file
app.get('/write', (req, res)=>{
    initialData = initialData + counter + "\n"
    fs.writeFile("log.txt", initialData, (err)=>{
        if(err) console.log('Error while writing the data into file');
        console.log('Data written successfully');
    });
    counter ++;
})

// API to read the data from the file
app.get('/getFileData', (req, res)=>{
    fs.readFile("log.txt", "utf-8", (err, data)=>{
        if(err) console.log('Error while reading the data from the file');
        console.log(data);
    });
})

// Websocket server creation
const ws = new webSocket.Server({ port: websocketPort });

// Connection for websocket
ws.on('connection', (wscon) => {
    //Message from the client will be log here
    wscon.on("message", (data) => {
        console.log(`Data received from client ${data}`);
        fs.readFile("log.txt", "utf-8", (err, data)=>{
            if(err) console.log('Error while reading the data from the file');
            wscon.send(data);
        });
    })

    fs.watch('log.txt', function(){
        var readStream = fs.createReadStream('log.txt', 'utf8');
        let data = ''
        readStream.on('data', function(chunk) {
            // data += chunk;
            wscon.send(chunk)
        }).on('end', function() {
            console.log(data);
        });
    })

    //On error will log here
    wscon.onerror = function () {
        console.log('Error found');
    }
})

// Server listerner on mentioned port
app.listen(exporessPort, ()=>{
    console.log(`Server is reading on this port ${exporessPort}`);
    console.log(`Websocket is reading on this port ${websocketPort}`);
})