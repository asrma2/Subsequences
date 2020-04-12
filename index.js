const express = require('express'),
     http = require('http');

const os = require("os");
const cluster = require("cluster") ;  

const clusterWorkerSize = os.cpus().length;

var path = require('path');

const bodyParser = require('body-parser');

const subseqRouter = require('./routes/subseqRouter');

const hostname = 'localhost';
const port = 3000;

const app = express();

// view engine setup
app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.use(bodyParser.json());

app.use('/getSubsequence', subseqRouter);

const server = http.createServer(app);

if (clusterWorkerSize > 1) {
    if (cluster.isMaster) {
        for (let i=0; i < clusterWorkerSize; i++) {
            cluster.fork()
        }
        cluster.on("exit", function(worker) {
            console.log("Worker", worker.id, " has exitted.")
        })
    } else {
        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/ and worker ${process.pid}`);
        });
      }
} else {
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/ with the single worker ${process.pid}`);
    });
}