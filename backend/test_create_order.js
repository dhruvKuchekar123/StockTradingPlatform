const axios = require('axios');
(async () => {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post("http://localhost:3002/login", {
            email: "dummyuser@gmail.com", password: "password123"
        });
        const cookie = loginRes.headers['set-cookie'];
        
        console.log("Starting request...");
        const res = await axios.post("http://localhost:3002/api/payments/create-order", {
            symbol: "RELIANCE", qty: 1
        }, { headers: { Cookie: cookie } });
        console.log(res.data);
    } catch(e) {
        console.error(e.response?.data || e.message);
    }
})();
