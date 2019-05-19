const fs = require('fs');
const readline = require('readline');
const db = require("./database/database"),
    { getInfoListUid, getInfoUid } = require("./services/get-uids"),
    { getToken } = require("./utils/get-token-live-utils"),
    RESULT_FILE = "result.json",
    ERROR_FILE = "error.txt",
    ERROR_UID_FILE ="error-uid.txt",
    MAX_UID_LENGTH = 200;


db.connect("mongodb://127.0.0.1:27017/datagrin").then(async msg => {
    console.log(msg);

    var LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader('/home/huuhoa/WebstormProjects/BookStore/Data/uidphone.txt');
    let listUID = [];
    let countLine = 0;
    let errorLine ="";
    lr.on('line',async function (line) {
        // pause emitting of lines...
        lr.pause();
        countLine ++;
        //console.log("Đang chạy line: ", countLine);
        if (countLine > 0) {
            await fs.writeFile("abc.txt","Line: " + countLine, err => {
                if (err) throw err;
            });
        }
        let uid = line.split("\t")[1];
        listUID.push(uid);
        errorLine = errorLine+ line+"\n";
        if (listUID.length === MAX_UID_LENGTH) {
            let token = await getToken();
            console.log("Running with token: ", token);
            if (!token) {
                await fs.writeFile(ERROR_FILE, countLine - MAX_UID_LENGTH, err => {
                    if (err) throw err;
                });
            }
            let info = await getInfoListUid(JSON.stringify(listUID), token);
            if (info.error) {
                await fs.appendFile(ERROR_UID_FILE, errorLine, err => {
                    console.log("Error get 500. Appended to error file");
                    if (err) throw err;
                    errorLine="";
                });
                /* Promise.all(
                     listUID.map(async uid => {
                         let a = await getInfoUid(uid, token);
                         if (!a.error) {
                             let infoJSON = JSON.stringify(a) + "\n";
                             // File muốn write vào
                             await fs.appendFile(RESULT_FILE, infoJSON, err => {
                                 if (err) throw err;
                             });
                         }
                     })
                 );*/
            }
            console.log("Get FB OK");
            for (let property in info) {
                if (info.hasOwnProperty(property)) {
                    let abc = info[property];
                    if (!abc.hasOwnProperty("message")) {
                        let abcd = JSON.stringify(abc) + "\n";
                        // File muốn write vào
                        fs.appendFile(RESULT_FILE, abcd, err => {
                            if (err) throw err;
                        });
                    }

                }
            }
            listUID = [];
        }
        setTimeout(function () {

            // ...and continue emitting lines.
            lr.resume();
        }, 1);
    });

    lr.on('end', function () {
        // All lines are read, file is closed now.
    });

});
