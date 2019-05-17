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
    const readInterface = readline.createInterface({
        input: fs.createReadStream("84167xxx9999.txt"),
        output: process.stdout,
        console: false
    });
    let listUID = [];
    readInterface.on('line', async function (line) {
        let uid = line.split("\t")[1];
        listUID.push(uid);
        if (listUID.length === 200) {
            let token = await getToken();
            console.log("Running with token: ", token);
            if (!token) {
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
                    await fs.appendFile(RESULT_FILE, abcd, err => {
                        if (err) throw err;
                    });
                }
            }
            console.log("Ghi xong file");
            console.log("Cho list uid ve 0");
            listUID = [];
            console.log(listUID.length)
        }
    });
});


