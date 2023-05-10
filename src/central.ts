
import * as mysql from 'mysql2/promise'
import { BOPREFIX, HOPREFIX, TABLENAME, COLUMNLIST, EXCHANGE_NAME, MESSAGE_QUEUE_NAME, CACHE_TABLENAME, ACK_QUEUE_NAME, MAX_WAITING_TIME, DATA_QUEUE_NAME, ACK_EXCHANGE_NAME } from './constants'
import { RabbitMqManagementService } from './RabbitMQManagement.service'
import { exit } from 'process'

const connectDB = async () => {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: `${HOPREFIX}`
    })
}



async function run() {
    try {
        const DBconnection = await connectDB()
        const RabbitMQ = new RabbitMqManagementService();
        await RabbitMQ.connect();

        const channel = await RabbitMQ.getChannel();

        await channel.queueDeclare(MESSAGE_QUEUE_NAME, { autoDelete: false, durable: true });
        await channel.queueDeclare(DATA_QUEUE_NAME, { autoDelete: false, durable: true });
        await channel.exchangeDeclare(EXCHANGE_NAME, 'topic', { autoDelete: false, durable: true });
        await channel.queueBind(MESSAGE_QUEUE_NAME, EXCHANGE_NAME, MESSAGE_QUEUE_NAME);
        await channel.queueBind(DATA_QUEUE_NAME, EXCHANGE_NAME, DATA_QUEUE_NAME);

        await channel.exchangeDeclare(ACK_QUEUE_NAME, 'topic', { autoDelete: false, durable: true });


        await channel.queuePurge(MESSAGE_QUEUE_NAME);

        const consumer = await channel.basicConsume(MESSAGE_QUEUE_NAME, {}, async (msg) => {
            const branch = msg.bodyToString();
            console.log("message received from branch " + branch);
            console.log("sending ack to branch " + branch);
            await channel.basicPublish(ACK_EXCHANGE_NAME, ACK_QUEUE_NAME + branch, '');
        });

        const consumer2 = await channel.basicConsume(DATA_QUEUE_NAME, {}, async (msg) => {
            const data = msg.bodyToString();
            const branch = msg.properties.headers.branch;
            console.log("data received from branch " + branch);
            console.log("sending ack to branch " + branch);
            const dataJSON = JSON.parse(data);
            const query = `INSERT INTO ${TABLENAME} (source, article, quantite, prix, date) VALUES ${dataJSON.map(row => `("${branch}", "${row.article}", ${row.quantite}, ${row.prix}, "${row.date}")`).join(', ')}`
            await DBconnection.query(query
            )
            console.log("data inserted into HO");
            await channel.basicPublish(ACK_EXCHANGE_NAME, ACK_QUEUE_NAME + branch, '');
            console.log("ack sent to branch " + branch);
        });

    } catch (err) {
        console.log(err)
    }
}
run()
