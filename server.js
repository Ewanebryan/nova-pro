const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// 1. DATABASE CONNECTION
// REPLACE THE LINE BELOW WITH YOUR ACTUAL CONNECTION STRING FROM ATLAS
const DB_URI = "mongodb+srv://bryanehabe2006_db_user:2006@cluster0.ydddmlp.mongodb.net/";

mongoose.connect(DB_URI)
    .then(() => console.log("✅ Cloud MongoDB Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

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
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

// 4. CAMEROON PAYMENT ROUTE
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
                'Authorization': 'Token YOUR_CAMPAY_TOKEN_HERE', 
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// 5. START SERVER (The "Render" Way)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
