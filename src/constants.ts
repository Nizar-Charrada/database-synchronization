const BOPREFIX = 'bo_'
const HOPREFIX = 'ho'

const TABLENAME = 'achat'
const CACHE_TABLENAME = 'cache'
const COLUMNLIST = [{ name: 'article', type: 'VARCHAR(255)' },
{ name: 'quantite', type: 'INT' },
{ name: 'prix', type: 'INT' },
{ name: 'date', type: 'DATE' }]


const EXCHANGE_NAME = 'synchronize';
const MESSAGE_QUEUE_NAME = 'message_queue';
const DATA_QUEUE_NAME = 'data_queue';
const ACK_QUEUE_NAME = 'ack_queue';
const ACK_EXCHANGE_NAME = 'ack_exchange';

const MAX_WAITING_TIME = 10000;

export { BOPREFIX, HOPREFIX, TABLENAME, COLUMNLIST, EXCHANGE_NAME, MESSAGE_QUEUE_NAME, CACHE_TABLENAME, DATA_QUEUE_NAME, ACK_QUEUE_NAME, MAX_WAITING_TIME, ACK_EXCHANGE_NAME }

