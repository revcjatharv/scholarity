"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = void 0;
/**
key_id,key_secret
rzp_test_zY9gDFNL9g0aOl,TcJ79BDAJkFBhpbyJRUMe798
*/
const Razorpay = require('razorpay');
async function makePayment(amount) {
    try {
        const rzp = new Razorpay({
            key_id: "rzp_test_zY9gDFNL9g0aOl",
            key_secret: "TcJ79BDAJkFBhpbyJRUMe798",
        });
        const rzpOrder = await rzp.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: "receipt#1",
            payment_capture: true,
            notes: {
                orderType: "Pre"
            } //Key-value pair used to store additional information
        });
        console.log('rzpOrder', rzpOrder);
        return rzpOrder;
    }
    catch (error) {
        console.log('error', error);
        return error;
    }
}
exports.payment = makePayment;
//# sourceMappingURL=payment.js.map