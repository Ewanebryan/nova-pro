const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // Required for payments

const app = express();
app.use(express.json());
app.use(cors());

// 1. DATABASE CONNECTION (Your Cloud Atlas Link)
const DB_URI = "YOUR_MONGODB_ATLAS_CONNECTION_STRING"; 
mongoose.connect(DB_URI)
    .then(() => console.log("✅ Cloud MongoDB Connected"))
    .catch(err => console.log("❌ Connection Error:", err));

// 2. PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    cat: String,
    img: String,
    desc: String
});
const Product = mongoose.model('Product', productSchema);

// 3. ROUTES
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ success: true });
});

// 4. CAMEROON PAYMENT ROUTE (OM/MOMO)
app.post('/api/pay', async (req, res) => {
    const { amount, phoneNumber } = req.body;
    
    try {
        const response = await axios.post('https://www.campay.net/api/collect/', {
            amount: amount,
            currency: "XAF",
            from: phoneNumber,
            description: "Nova Pro Purchase",
            external_reference: "Nova_" + Date.now()
        }, {
            headers: {
                'Authorization': 'Token YOUR_CAMPAY_TOKEN_HERE', // Get from Campay.net
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error("Payment failed:", error.message);
        res.status(500).json({ success: false });
    }
});

// 5. START SERVER
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://172.20.10.5:${PORT}`);
});