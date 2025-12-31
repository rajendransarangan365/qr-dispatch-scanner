export const parseQRData = (csvString) => {
    if (!csvString || typeof csvString !== 'string') {
        console.warn("Invalid QR Data:", csvString);
        return null;
    }
    // Expected format: TN05423869,DISP000004268324,ERDN0051,31-10-2025 09:09,450kms,9hrs ,Gravel(25MT),TN36 AY0948,ERODE

    // Dynamic Fields for Print:
    // Permit No        → TN05423869        (parts[0])
    // Dispatch Slip No → DISP000004268324  (parts[1])
    // Mine Code        → ERDN0051          (parts[2])
    // Dispatch Date    → 31-10-2025 09:09  (parts[3])
    // Distance         → 450 kms           (parts[4])
    // Required Time    → 9 hrs             (parts[5])
    // Mineral & Qty    → Gravel (25 MT)    (parts[6])
    // Vehicle No       → TN36 AY0948       (parts[7])
    // District / Place → ERODE             (parts[8])

    const parts = csvString.split(',').map(s => s.trim());

    if (parts.length < 5) return null; // Basic validation

    // Heuristic to detect Format
    // Old Format: parts[1] is DispatchNo (starts with DISP)
    // New Format: parts[1] is LesseeId (e.g. TNJ...), parts[2] is DispatchNo
    const isOldFormat = parts[1] && parts[1].toUpperCase().startsWith('DISP');

    if (isOldFormat) {
        return {
            permitNo: parts[0] || "N/A",
            lesseeId: "", // Not present in old
            dispatchSlipNo: parts[1] || "N/A",
            mineCode: parts[2] || "N/A",
            dispatchDate: parts[3] || "N/A",
            distance: parts[4] || "N/A",
            duration: parts[5] || "N/A",
            mineralQty: parts[6] || "N/A",
            vehicleNo: parts[7] || "N/A",
            district: parts[8] || "N/A",
            raw: csvString
        };
    } else {
        // New Format
        // 0. Serial 1. LesseeId 2. Dispatch 3. Unknown1 4. Date 5. Dist 6. Time 7. Mat 8. Veh 9. Dist
        return {
            permitNo: parts[0] || "N/A",
            lesseeId: parts[1] || "N/A",
            dispatchSlipNo: parts[2] || "N/A",
            mineCode: parts[3] || "N/A", // Unknown 1 maps to Mine Code slot
            unknown1: parts[3] || "N/A",
            dispatchDate: parts[4] || "N/A",
            distance: parts[5] || "N/A",
            duration: parts[6] || "N/A",
            mineralQty: parts[7] || "N/A",
            vehicleNo: parts[8] || "N/A",
            district: parts[9] || "N/A",
            raw: csvString
        };
    }
};

// Helper to split Mineral & Qty if possible
// Input: "Gravel (25 MT)" or "Gravel(25MT)"
export const splitMineralQty = (str) => {
    // Regex to capture "Name" and "Qty"
    // Looks for text followed by (number...)
    const match = str.match(/^(.*?)\s*\((\d+)\s*MT\)/i);
    if (match) {
        return { name: match[1].trim(), qty: match[2].trim() };
    }
    // Fallback if format differs
    return { name: str, qty: "" };
}
