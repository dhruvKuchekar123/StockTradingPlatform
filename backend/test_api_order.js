const axios = require("axios");

async function testApi() {
    try {
        const loginRes = await axios.post("http://localhost:3002/login", {
            email: "dummyuser@gmail.com",
            password: "password123"
        });
        
        const cookie = loginRes.headers['set-cookie'][0];
        console.log("Logged in successfully");

        const orderRes = await axios.post("http://localhost:3002/api/payments/create-order", {
            symbol: "INFY",
            qty: 1
        }, {
            headers: { Cookie: cookie }
        });

        console.log("Order Success:", orderRes.data);
    } catch(err) {
        console.error("Request Failed!");
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}
testApi();
