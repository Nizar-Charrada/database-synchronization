import { AMQPClient } from "@cloudamqp/amqp-client";
import { AMQPBaseClient } from "@cloudamqp/amqp-client/types/amqp-base-client";

export class RabbitMqManagementService {
    constructor() {
        this.client = new AMQPClient('amqp://guest:guest@localhost');
        this.client.onerror = this.onError.bind(this);
        this.connected = false;
    }
    private client: AMQPClient;
    private connection: AMQPBaseClient;
    private retries = 5;
    private connected: boolean;

    async connect() {
        try {
            this.connection = await this.client.connect();
            this.connected = true;
            console.log('Connected to RabbitMQ');
        } catch (error) {
            this.onError(error);
        }
    }

    onError(error: any) {
        console.log(`this.retries `, this.retries);

        this.connected = false;
        console.log(error.message);
        if (this.retries > 0) {
            this.retries--;
            console.log(`Retrying connection to RabbitMQ in 1 seconds...`);
            setTimeout(() => {
                this.connect();
            }, 1000);
        } else {
            throw new Error("Can't connect to RabbitMQ");
        }
    }

    public async getChannel() {
        if (this.connected) return await this.connection.channel();
        else throw new Error('RabbitMQ is not connected');
    }

    public async createExchange(
        name: string,
        type: string,
        autodelete: boolean,
    ) {
        const channel = await this.getChannel();
        await channel.exchangeDeclare(name, type, {
            durable: false,
            autoDelete: autodelete,
        });
    }

    public async createQueue(name: string, autodelete = true) {
        const channel = await this.getChannel();
        return await channel.queue(name, { autoDelete: autodelete });
    }

    public async createQueueAndBindToExchange(
        exchangeName: string,
        queueName: string,
        exchangeType: 'fanout' | 'direct' | 'topic' | 'headers' = 'fanout',
    ) {
        this.createExchange(exchangeName, exchangeType, true);
        const queue = await this.createQueue(queueName);
        const channel = await this.getChannel();
        await channel.queueBind(queue.name, exchangeName, '');
    }
}