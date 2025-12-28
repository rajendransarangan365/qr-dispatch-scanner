import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (Netlify frontend)
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qr-dispatch-scanner';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schema Definition
const scanSchema = new mongoose.Schema({
    serialNo: String,
    dispatchNo: String,
    mineCode: String,
    dateTime: String, // Stored as string from QR, but we might want a real Date for sorting
    parsedDate: Date, // Real date object for sorting
    distance: String,
    duration: String,
    material: String,
    vehicleNo: String,
    destination: String,
    raw: String,
    scannedAt: { type: Date, default: Date.now }
});

// Index for search
scanSchema.index({
    vehicleNo: 'text',
    material: 'text',
    destination: 'text',
    serialNo: 'text'
});

const Scan = mongoose.model('Scan', scanSchema);

// Routes

// 1. Create Scan
app.post('/api/scans', async (req, res) => {
    try {
        const data = req.body;

        // Attempt to parse the date string "31-10-2025 09:09" to a real Date object
        let parsedDate = new Date();
        if (data.dateTime) {
            const parts = data.dateTime.split(/[- :]/); // Split by - or : or space
            // parts: [31, 10, 2025, 09, 09] -> Date(year, month-1, day, ...)
            if (parts.length >= 5) {
                parsedDate = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
            }
        }

        const newScan = new Scan({ ...data, parsedDate });
        const savedScan = await newScan.save();
        res.status(201).json(savedScan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Scans (Search, Sort, Filter)
app.get('/api/scans', async (req, res) => {
    try {
        const { q, sort = 'scannedAt', order = 'desc' } = req.query;

        let query = {};

        // Search Logic (Regex for partial matches or Text Search)
        if (q) {
            query = {
                $or: [
                    { vehicleNo: { $regex: q, $options: 'i' } },
                    { material: { $regex: q, $options: 'i' } },
                    { destination: { $regex: q, $options: 'i' } },
                    { serialNo: { $regex: q, $options: 'i' } }
                ]
            };
        }

        // Sort Logic
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const scans = await Scan.find(query).sort(sortOptions).limit(100);
        res.json(scans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

export default app;
