const EventEmitter = require('events');

class OrderEmitterClass extends EventEmitter {}
const OrderEmitter = new OrderEmitterClass();

module.exports = OrderEmitter;
