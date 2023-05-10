import * as mysql from 'mysql2/promise'
import { BOPREFIX, HOPREFIX, TABLENAME, COLUMNLIST, EXCHANGE_NAME, MESSAGE_QUEUE_NAME, CACHE_TABLENAME, ACK_QUEUE_NAME, MAX_WAITING_TIME, DATA_QUEUE_NAME, ACK_EXCHANGE_NAME } from './constants'
import { RabbitMqManagementService } from './RabbitMQManagement.service'
import { emptyTable, insertDataintoBO } from './utils'
import { exit } from 'process'

// first get the branch name from the command line and throw an error if it's not 1 or 2
const branchName = process.argv[2]
if (branchName !== '1' && branchName !== '2') throw new Error('branch name must be 1 or 2')

// functions
const connectDB = async () => {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: `${BOPREFIX}${branchName}`
    })
}


var connectedToBackend = false;
var dataSent = false;
async function run() {
    try {
        const DBconnection = await connectDB()
        const RabbitMQ = new RabbitMqManagementService();
        await RabbitMQ.connect();

        const channel = await RabbitMQ.getChannel();


        await channel.exchangeDeclare(ACK_EXCHANGE_NAME, 'topic', { autoDelete: false, durable: true });
        await channel.queueDeclare(ACK_QUEUE_NAME + branchName, { autoDelete: false, durable: true });
        await channel.queueBind(ACK_QUEUE_NAME + branchName, ACK_EXCHANGE_NAME, ACK_QUEUE_NAME + branchName);

        await channel.queuePurge(ACK_QUEUE_NAME + branchName);



        const [rows, fields] = await DBconnection.execute(`SELECT * FROM ${CACHE_TABLENAME}`);
        const data = JSON.stringify(rows);
        if ((rows as any).length === 0) {
            console.log("no data to send");
            await channel.close();
            exit(0);
        }
        //send message to central to verify if its online
        await channel.basicPublish(EXCHANGE_NAME, MESSAGE_QUEUE_NAME, `${branchName}`);
        const consumer = await channel.basicConsume(ACK_QUEUE_NAME + branchName, {}, async (msg) => {
            console.log("message received from central")
            if (dataSent) {
                console.log("ack received from central");
                emptyTable(DBconnection, CACHE_TABLENAME);
                consumer.cancel();
                await channel.close();
                exit(0);
            } else {
                connectedToBackend = true;
                console.log("connected to backend");
                //send data to central
                try {
                    await channel.basicPublish(EXCHANGE_NAME, DATA_QUEUE_NAME, data, { headers: { branch: `${branchName}` } });
                    console.log("data sent to central");
                    dataSent = true;
                }
                catch (err) {
                    console.log(err);
                }
            }

        });
        console.log("waiting for backend to respond");
        setTimeout(async () => {
            if (!connectedToBackend) {
                consumer.cancel();
                console.log("backend not responding", "aborting ...");
                await channel.close();
                exit(1);
            }
        }, MAX_WAITING_TIME);
    } catch (err) {
        console.log(err)
    }
}
run()
