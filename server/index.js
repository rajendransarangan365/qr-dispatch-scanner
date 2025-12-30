import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (Netlify frontend)
    credentials: true
}));
app.use(express.json());

// Serve static files from the React dist directory
app.use(express.static(path.join(__dirname, '../dist')));

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

    // New Fields for Bulk Trip Sheet & Status Tracking
    tripSheetStatus: { type: String, enum: ['generated', 'printed', 'given'], default: 'generated' },
    tripSheetGivenAt: { type: Date, default: null },
    driverName: String,
    driverLicense: String,
    driverPhone: String,

    scannedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});

// Index for search
scanSchema.index({
    vehicleNo: 'text',
    material: 'text',
    destination: 'text',
    serialNo: 'text',
    driverName: 'text'
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

// 1.2 Bulk Create Scans
app.post('/api/scans/bulk', async (req, res) => {
    try {
        const { startSerialNo, count, templateData } = req.body;

        // Validation
        if (!startSerialNo || !count || !templateData) {
            return res.status(400).json({ error: "Missing required fields: startSerialNo, count, templateData" });
        }

        const scansToInsert = [];
        const baseSerialPrefix = startSerialNo.match(/^[A-Za-z]+/)?.[0] || ""; // Extract "TN"
        const baseSerialNumStr = startSerialNo.match(/\d+/)?.[0] || ""; // Extract "0330750"

        if (!baseSerialNumStr) {
            return res.status(400).json({ error: "Invalid Serial Number format (needs digits)" });
        }

        const baseSerialNum = parseInt(baseSerialNumStr, 10);

        // Date Parsing Logic (Reusable)
        let parsedDate = new Date();
        if (templateData.dateTime) {
            const parts = templateData.dateTime.split(/[- :]/);
            if (parts.length >= 5) {
                parsedDate = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
            }
        }

        for (let i = 0; i < count; i++) {
            const currentNum = baseSerialNum + i;
            // Pad with leading zeros if necessary to maintain length
            const currentNumStr = currentNum.toString().padStart(baseSerialNumStr.length, '0');
            const newSerial = `${baseSerialPrefix}${currentNumStr}`;

            scansToInsert.push({
                ...templateData,
                serialNo: newSerial,
                parsedDate,
                scannedAt: new Date(Date.now() + i * 1000), // Stagger slightly for sort order
                tripSheetStatus: 'generated'
            });
        }

        const result = await Scan.insertMany(scansToInsert);
        res.status(201).json({ message: `Successfully generated ${result.length} trip sheets`, count: result.length });

    } catch (err) {
        console.error("Bulk create error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 1.5 Update Scan (PUT)
app.put('/api/scans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // If sorting by date, ensure parsedDate is updated if dateTime changes
        let parsedDate = undefined;
        if (data.dateTime) {
            const parts = data.dateTime.split(/[- :]/);
            if (parts.length >= 5) {
                parsedDate = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
            }
        }

        const updatePayload = { ...data };
        if (parsedDate) updatePayload.parsedDate = parsedDate;

        const updatedScan = await Scan.findByIdAndUpdate(id, updatePayload, { new: true });
        res.json(updatedScan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Scans (Search, Sort, Filter, Pagination)
app.get('/api/scans', async (req, res) => {
    try {
        const { q, sort = 'scannedAt', order = 'desc', page = 1, limit = 50 } = req.query;

        let query = { deletedAt: null }; // Only active items

        // Search Logic
        if (q) {
            query.$or = [
                { vehicleNo: { $regex: q, $options: 'i' } },
                { material: { $regex: q, $options: 'i' } },
                { destination: { $regex: q, $options: 'i' } },
                { serialNo: { $regex: q, $options: 'i' } },
                { driverName: { $regex: q, $options: 'i' } } // Added driver search
            ];
        }

        // Date Filter
        const { startDate, endDate } = req.query;
        if (startDate || endDate) {
            query.scannedAt = {};
            if (startDate) query.scannedAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.scannedAt.$lte = end;
            }
        }

        // Sort
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Scan.countDocuments(query);
        const scans = await Scan.find(query).sort(sortOptions).skip(skip).limit(limitNum);

        res.json({
            data: scans,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Recycle Bin Items (Auto-Cleanup > 30 Days)
app.get('/api/bin', async (req, res) => {
    try {
        // cleanup items older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await Scan.deleteMany({ deletedAt: { $lt: thirtyDaysAgo } });

        const binItems = await Scan.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 });
        res.json(binItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Soft Delete (Move to Bin)
app.put('/api/scans/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Scan.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Restore from Bin
app.put('/api/scans/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Scan.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Hard Delete (Permanent)
app.delete('/api/scans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Scan.findByIdAndDelete(id);
        res.json({ message: 'Deleted permanently' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all handler for any request that doesn't match an API route
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

export default app;
