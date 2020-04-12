const express = require('express');
const bodyParser = require('body-parser');
var timeout = require('connect-timeout')

const subseqRouter = express.Router();

subseqRouter.use(bodyParser.json());

subseqRouter.route('/:word')
    .get(timeout('5s'), haltOnTimedout, function (req, res, next) {
        //console.log(req.params.word);
        var word = req.params.word;
        if (!word) {
            return res.send({
                remainingLength: -1,
                data: "req body cannot be empty."
            });
        }

        if(word == "") {
            return res.send({
                remainingLength: 0,
                data: []
            });
        } else {

            var countSub = function(str) {
                let last = []; 
                for(let i = 0; i < 256; i++) {
                    last.push(-1);
                }
                let n = str.length; 
                let dp = []; 
                dp.push(1); 
                for (let i = 1; i <= n; i++) { 
                    dp.push(2 * dp[i - 1]); 
                    if (last[str.charCodeAt(i - 1)] != -1) {
                        dp[i] = dp[i] - dp[last[str.charCodeAt(i - 1)]];
                    }  
                    last[str.charCodeAt(i - 1)] = (i - 1); 
                } 
                return dp[n]; 
            } 

            var thresholdLength = 1;
            var totalSequences = countSub(word);
            if(word.length == 6) {
                thresholdLength = 2;
            } else if(word.length > 6 && word.length < 10) {
                thresholdLength = word.length - 3;
            } else if(word.length > 9) {
                thresholdLength = word.length - 2;
            } else if(word.length >= 49) {
                thresholdLength = word.length - 1;
            }
            try {
                var calculateSubSeq = function(active, rest, set) {
                    if (!active && !rest)
                        return;
                    if (!rest) {
                        if(active.length >= thresholdLength) {
                            set.add(active);
                        }
                    } else {
                        calculateSubSeq(active + rest[0], rest.slice(1), set);
                        calculateSubSeq(active, rest.slice(1), set);
                    }
                    return set;
                }    
            } catch (err) {
                return res.send({
                    remainingLength: -1,
                    data: "An error occured while computing your request."
                });
            }

            var set = new Set();
            calculateSubSeq("", word, set);
            var arr = [...set]; 
            arr.sort((a, b) => b.length - a.length);
            //console.log(arr);
            var remainingLen = 0;
            if(totalSequences > 50) {
                remainingLen = totalSequences - 50; 
                arr = arr.slice(0, 50);
            }

            res.statusCode = 200;
            return res.send({
                remainingLength: remainingLen,
                data: arr
            });
        }

    }); 
    
function haltOnTimedout (req, res, next) {
    if (!req.timedout) {
        next();
    } else {
        return res.send({
            remainingLength: -1,
            data: "Please enter a small string."
        });
    }    
}    

module.exports = subseqRouter;