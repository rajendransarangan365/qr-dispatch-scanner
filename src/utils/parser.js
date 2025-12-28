export const parseQRData = (csvString) => {
    if (!csvString) return null;
    // Expected format: TN05423869,DISP000004268324,ERDN0051,31-10-2025 09:09,450kms,9hrs ,Gravel(25MT),TN36 AY0948,ERODE

    const parts = csvString.split(',').map(s => s.trim());

    if (parts.length < 5) return null; // Basic validation

    return {
        serialNo: parts[0] || "N/A",
        dispatchNo: parts[1] || "N/A",
        mineCode: parts[2] || "N/A",
        dateTime: parts[3] || "N/A",
        distance: parts[4] || "N/A",
        duration: parts[5] || "N/A",
        material: parts[6] || "N/A",
        vehicleNo: parts[7] || "N/A",
        destination: parts[8] || "N/A",
        raw: csvString
    };
};
