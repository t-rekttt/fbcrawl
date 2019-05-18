const fs = require('fs');
const readline = require('readline');
const db = require("./database/database"),
    { getInfoListUid, getInfoUid } = require("./services/get-uids"),
    { getToken } = require("./utils/get-token-live-utils"),
    RESULT_FILE = "result.json",
    ERROR_FILE = "error.txt",
    MAX_UID_LENGTH = 200;


db.connect("mongodb://127.0.0.1:27017/datagrin").then(async msg => {
    console.log(msg);

    var LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader('/home/huuhoa/WebstormProjects/BookStore/Data/uidphone.txt');
    let listUID = [];
    let countLine = 0;
    lr.on('line',async function (line) {
        // pause emitting of lines...
        lr.pause();

        countLine ++;
        console.log("Đang chạy line: ", countLine);
        let uid = line.split("\t")[1];
        listUID.push(uid);47500
        if (listUID.length === 500) {
            let token = await getToken();
            console.log("Running with token: ", token);
            if (!token) {
                await fs.writeFile(ERROR_FILE, countLine - 500, err => {
                    if (err) throw err;
                });
                return 0;
            }
            let info = await getInfoListUid(JSON.stringify(listUID), token);
            if (info.error) {
                Promise.all(
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
                );
            }
            console.log("Get FB OK");
            for (let property in info) {
                if (info.hasOwnProperty(property)) {
                    let abc = info[property];
                    let abcd = JSON.stringify(abc) + "\n";
                    // File muốn write vào
                     fs.appendFile(RESULT_FILE, abcd, err => {
                        if (err) throw err;
                    });
                }
            }
            console.log("Ghi xong file");
            console.log("Cho list uid ve 0");
            listUID = [];
            console.log(listUID.length)
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


