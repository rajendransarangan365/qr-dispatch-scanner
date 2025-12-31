import { parseQRData } from './src/utils/parser.js';

// Mock specific time for consistency if needed, but we want to check dynamic assignment
console.log("--- TEST START ---");

const testEmptyDate = "TN04676190,DISP000005619950,PDKN0012,,202kms,6hrs,(3MT),TN63 CT2225,SIVAGANGAI";
const result = parseQRData(testEmptyDate);

console.log("Input:", testEmptyDate);
console.log("Result Date:", result.dispatchDate);

if (result.dispatchDate && result.dispatchDate !== "N/A" && result.dispatchDate.includes(":")) {
    console.log("PASS: Date was assigned automatically.");
} else {
    console.log("FAIL: Date was NOT assigned.");
}

const testExistingDate = "TN05423869,DISP000004268324,ERDN0051,31-10-2025 09:09,450kms,9hrs ,Gravel(25MT),TN36 AY0948,ERODE";
const result2 = parseQRData(testExistingDate);
console.log("Input 2:", testExistingDate);
console.log("Result Date 2:", result2.dispatchDate);

if (result2.dispatchDate === "31-10-2025 09:09") {
    console.log("PASS: Existing date preserved.");
} else {
    console.log("FAIL: Existing date overwritten.");
}
