const express = require('express');
const bodyParser = require('body-parser');
const midtransClient = require('midtrans-client');
const cors = require('cors');

const app = express(); 
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:3002', // Domain frontend Anda
    methods: ['GET', 'POST'], // Metode yang diperbolehkan
    allowedHeaders: ['Content-Type'], // Header yang diperbolehkan
}));

// Midtrans server key
const serverKey = 'SB-Mid-server-mKJddKY_Q3Wq2mSKNyyyuc-B';
let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: serverKey,
});

// Tangani preflight request
app.options('/create-transaction', cors());

// Endpoint create-transaction
app.post('/create-transaction', (req, res) => {
    console.log('Received request data:', req.body);  // Log the incoming request data
    const orderId = `order-${new Date().getTime()}`;
    const grossAmount = req.body.grossAmount;

    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
        },
    };

    snap.createTransaction(parameter)
        .then((transaction) => {
            console.log('Transaction created successfully:', transaction);  // Log the transaction object
            res.json({
                token: transaction.token,
            });
        })
        .catch((err) => {
            console.error('Error creating transaction:', err);  // Log errors
            res.status(500).json({ error: err.message });
        });
});

app.post('/webhook-notification', (req, res) => {
    const notification = req.body;

    // Konfirmasi notifikasi ke Midtrans untuk memastikan keasliannya
    snap.transaction.notification(notification)
        .then((statusResponse) => {
            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            console.log(`Order ID: ${orderId}`);
            console.log(`Transaction Status: ${transactionStatus}`);
            console.log(`Fraud Status: ${fraudStatus}`);

            // Lakukan sesuatu berdasarkan status transaksi
            if (transactionStatus === 'capture') {
                if (fraudStatus === 'accept') {
                    console.log('Payment successful!');
                    // Update database bahwa pembayaran berhasil
                }
            } else if (transactionStatus === 'settlement') {
                console.log('Payment settled!');
                // Update database bahwa pembayaran telah selesai
            } else if (transactionStatus === 'deny') {
                console.log('Payment denied!');
                // Update database bahwa pembayaran ditolak
            } else if (transactionStatus === 'expire') {
                console.log('Payment expired!');
                // Update database bahwa pembayaran kedaluwarsa
            } else if (transactionStatus === 'cancel') {
                console.log('Payment canceled!');
                // Update database bahwa pembayaran dibatalkan
            }

            // Kirim respons ke Midtrans
            res.status(200).send('OK');
        })
        .catch((err) => {
            console.error('Error handling webhook notification:', err);
            res.status(500).send(err.message);
        });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running`);
});
