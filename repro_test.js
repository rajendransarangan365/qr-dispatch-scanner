import { parseQRData } from './src/utils/parser.js';

console.log("--- REPRO TEST START ---");

const testEmptyDate = "TN04676190,DISP000005619950,PDKN0012,,202kms,6hrs,(3MT),TN63 CT2225,SIVAGANGAI";
const result = parseQRData(testEmptyDate);

console.log("Raw QR:", testEmptyDate);
console.log("Parsed dispatchDate:", result.dispatchDate);

// Simulate EditPrintModal logic
const toInputDate = (dateStr) => {
    if (!dateStr) return 'EMPTY_INPUT';
    const parts = dateStr.split(/[- :]/);
    if (parts.length >= 5) {
        const d = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
        if (!isNaN(d)) {
            const pad = n => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
    }
    return 'INVALID_FORMAT';
};

console.log("EditPrintModal toInputDate result:", toInputDate(result.dispatchDate));
