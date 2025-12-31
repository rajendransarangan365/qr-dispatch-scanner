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

mongoose.connection.on('connected', () => console.log('Mongoose connected to DB cluster'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

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

    // New Fields for Bulk Trip Sheets
    lesseeId: String,
    deliveredTo: String, // New field
    unknown1: String, // Master field (e.g. ERDN0051)

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
        const { startSerialNo, count, templateData, qrFields } = req.body;

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

            // Format Vehicle Number (e.g. TN55BP3438 -> TN55 BP3438)
            // Heuristic: If it starts with 2 letters + 2 digits, insert space.
            const rawVeh = templateData.vehicleNo || '';
            const fmtVeh = rawVeh.replace(/^([A-Z]{2}\d{2})([A-Z]+)(\d{4})$/, '$1 $2$3') // TN36AY0948 -> TN36 AY0948 (Standard)
                .replace(/^([A-Z]{2}\d{2})([A-Z0-9]+)$/, '$1 $2'); // Fallback insert space after district code

            // Format Material with Quantity
            const mat = templateData.material || '';
            const qtyStr = templateData.quantity ? `(${templateData.quantity}MT)` : '';
            const matQty = `${mat}${qtyStr}`; // e.g. Gravel(25MT)

            // Destination Uppercase
            const dest = (templateData.destination || '').toUpperCase(); // e.g. ERODE

            // Date Format: "28-12-2025 08:00 am" (User input usually "DD-MM-YYYY HH:mm" or similar? The template follows what's enabled)
            // User requested: "Travelling Date : 28-12-2025 08:00 am"
            // We assume templateData.dateTime holds this.

            // Required Time: "12hrs (28-12-2025 08:00 pm)" note only hours -> "12hrs"
            // If the user inputs "12hrs", we use "12hrs".
            const duration = templateData.duration || ''; // Expecting just the duration part if user enters just duration.
            // But if the user wants "12hrs" in the QR, we should ensure we extract just that if it's complex.
            // For now, assume templateData.duration is clean or we use it as is.

            // 1. Create a map of all available values
            const valuesMap = {
                serialNo: newSerial,
                lesseeId: templateData.lesseeId || '',
                dispatchNo: templateData.dispatchNo || '',
                mineCode: templateData.token || templateData.mineCode || '',
                dateTime: templateData.dateTime || '',
                distance: templateData.distance || '',
                duration: templateData.duration || '',
                material: matQty,
                vehicleNo: fmtVeh,
                destination: dest,
                deliveredTo: templateData.deliveredTo || ''
            };

            // 2. Determine field order (Dynamic or Default fallback)
            // Default order: 1.Serial 2.Dispatch 3.MineCode 4.Date 5.Dist 6.Time 7.Mat 8.Veh 9.Dest 10.DeliveredTo
            const defaultOrder = [
                'serialNo', 'dispatchNo', 'mineCode', 'dateTime',
                'distance', 'duration', 'material', 'vehicleNo', 'destination', 'deliveredTo'
            ];

            // If qrFields provided (from frontend settings), filter enabled ones. Else use default.
            const fieldsToUse = (qrFields && Array.isArray(qrFields))
                ? qrFields.filter(f => f.enabled).map(f => f.id)
                : defaultOrder;

            // 3. Construct CSV
            const rawString = fieldsToUse.map(id => valuesMap[id] || '').join(',');

            scansToInsert.push({
                ...templateData,
                serialNo: newSerial,
                parsedDate,
                scannedAt: new Date(Date.now() + i * 1000),
                tripSheetStatus: 'generated',
                raw: rawString
            });
        }

        const result = await Scan.insertMany(scansToInsert);
        res.status(201).json({ message: `Successfully generated ${result.length} trip sheets`, count: result.length });

    } catch (err) {
        console.error("Bulk create error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Settings Schema
const settingsSchema = new mongoose.Schema({
    isGlobal: { type: Boolean, default: true, unique: true }, // Singleton marker
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now }
});
const Settings = mongoose.model('Settings', settingsSchema);

// Multer Setup for File Uploads
import multer from 'multer';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Always save as 'template.docx' to overwrite previous
        cb(null, 'template.docx');
    }
});
const upload = multer({ storage: storage });

// 2. Settings Routes
// GET /api/settings
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne({ isGlobal: true });
        if (!settings) {
            // Create default if not exists
            settings = await Settings.create({ isGlobal: true, data: {} });
        }
        res.json(settings.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/settings
app.put('/api/settings', async (req, res) => {
    try {
        const newData = req.body;
        const settings = await Settings.findOneAndUpdate(
            { isGlobal: true },
            { $set: { data: newData, updatedAt: Date.now() } },
            { new: true, upsert: true }
        );
        res.json(settings.data);
    } catch (err) {
        console.error("Settings save error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/settings/template - Upload Template
app.post('/api/settings/template', upload.single('template'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ message: 'Template uploaded successfully', filename: req.file.filename });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/settings/template - Download/Check Template
app.get('/api/settings/template', (req, res) => {
    const filePath = path.join(uploadDir, 'template.docx');
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'dispatch_template.docx');
    } else {
        res.status(404).json({ error: 'No template found' });
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
        console.error('Error in GET /api/scans:', err);
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
