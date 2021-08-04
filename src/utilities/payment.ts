/**
key_id,key_secret
rzp_test_zY9gDFNL9g0aOl,TcJ79BDAJkFBhpbyJRUMe798
*/
const Razorpay = require('razorpay')
async function makePayment (amount: number) {
    try {
        const rzp = new Razorpay({
            key_id: "rzp_test_zY9gDFNL9g0aOl",
            key_secret: "TcJ79BDAJkFBhpbyJRUMe798",
        })
    
        const rzpOrder = await rzp.orders.create({
            amount: amount * 100, // rzp format with paise
            currency: 'INR',
            receipt: "receipt#1" ,//Receipt no that corresponds to this Order,
            payment_capture: true,
            notes: {
             orderType: "Pre"
            } //Key-value pair used to store additional information
        })
        console.log('rzpOrder', rzpOrder)
        return rzpOrder;
    } catch (error) {
        console.log('error',error)
        return error
    }

}

export const payment = makePayment


