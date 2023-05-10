import { BOPREFIX, TABLENAME } from "./constants";
import { generateData } from "./generateData";
import * as mysql from 'mysql2/promise'
import { exit } from "process";

const branchName = process.argv[2]
if (branchName !== '1' && branchName !== '2') throw new Error('branch name must be 1 or 2')



async function run() {
    const connectionBO = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: BOPREFIX + branchName
    })
    const data = generateData(20)
    const query = `INSERT INTO ${TABLENAME} (article, quantite, prix, date) VALUES ${data.map(row => `("${row.article}", ${row.quantite}, ${row.prix}, "${row.date}")`).join(', ')}`
    await connectionBO.query(query);
    console.log("data inserted into BO");
    exit(0);
}

run();