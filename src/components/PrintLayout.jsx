import React from 'react';
import QRCode from 'react-qr-code';
import { splitMineralQty } from '../utils/parser';

const SingleSlip = ({ data, getField, mineralName, quantity }) => {
    return (
        <div className="sheet">
            <div className="content-area">

                <div className="header-top">
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                        <div style={{ paddingTop: '35px', paddingRight: '10px', fontWeight: 'normal', fontSize: '14px' }}>{getField('permitNo')}</div>
                        {/* QR Code Placeholder replacement */}
                        <div className="qr-placeholder" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                            <QRCode value={data.raw || data.permitNo || "N/A"} size={60} style={{ width: '100%', height: '100%' }} />
                        </div>
                    </div>
                </div>

                <div className="header-meta">
                    <span>HSN Code : {getField('hsnCode', '0002271')}</span>
                    <span>Date & Time of Dispatch : {getField('dispatchDate', 'dateTime')}</span>
                </div>

                <table>
                    <colgroup>
                        <col className="c1" />
                        <col className="c2" />
                        <col className="c3" />
                        <col className="c4" />
                    </colgroup>

                    <tbody>
                        <tr>
                            <td>Lessee Id : {getField('lesseeId')}</td>
                            <td>Minecode : {getField('mineCode')}</td>
                            <td>Lease Area Details</td>
                            <td>Serial No : {getField('permitNo')}</td>
                        </tr>

                        <tr>
                            <td>Lease Name and Address :</td>
                            <td>{getField('lesseeName')}</td>
                            <td>District Name :</td>
                            <td>{getField('district')}</td>
                        </tr>

                        <tr>
                            <td colSpan="2" rowSpan="3" style={{ verticalAlign: 'top' }}>
                                {getField('lesseeAddress')}
                            </td>
                            <td>Taluk Name :</td>
                            <td>{getField('taluk')}</td>
                        </tr>

                        <tr>
                            <td>Village</td>
                            <td>{getField('village')}</td>
                        </tr>

                        <tr>
                            <td>SF.No / Extent :</td>
                            <td>{getField('sfNo')}</td>
                        </tr>

                        <tr>
                            <td>Mineral Name : {mineralName}</td>
                            <td>Bulk Permit No : {getField('bulkPermitNo')}</td>
                            <td>Classification :</td>
                            <td>{getField('mineralClassification')}</td>
                        </tr>

                        <tr>
                            <td>Order Ref :</td>
                            <td>{getField('orderRef')}</td>
                            <td>Lease Period :</td>
                            <td>{getField('leasePeriod')}</td>
                        </tr>

                        <tr>
                            <td>Dispatch Slip No :</td>
                            <td>{getField('dispatchSlipNo', 'dispatchNo')}</td>
                            <td>Within Tamil Nadu :</td>
                            <td>{getField('withinTN')}</td>
                        </tr>

                        <tr>
                            <td>Delivered To :</td>
                            <td colSpan="3">{getField('destinationAddress', 'destination')}</td>
                        </tr>

                        <tr>
                            <td>Vehicle No :</td>
                            <td>{getField('vehicleNo')}</td>
                            <td>Destination Address :</td>
                            <td rowSpan="2" style={{ verticalAlign: 'middle' }}>{getField('destinationAddress', 'destination')}</td>
                        </tr>

                        <tr>
                            <td>Vehicle type :</td>
                            <td>{getField('vehicleType', 'TIPPER')}</td>
                            {/* Destination Address spans here */}
                        </tr>

                        <tr>
                            <td>Total Distance (in kms) :</td>
                            <td>{getField('distance')}</td>
                            <td colSpan="2" rowSpan="2"></td>
                            {/* Note: User HTML had rowspan=2 for empty cell here? 
                                Row 11 in Source:
                                <tr> <td>Total Distance...</td> <td>120</td> <td colspan="2" rowspan="2"></td> </tr>
                                Then Row 12:
                                <tr> <td>Travelling Date...</td> <td>...</td> </tr>
                                Wait. Row 12 only has 2 cells in source?
                                Let's check source:
                                row 11: <td>Total Dist</td><td>120</td><td colspan="2" rowspan="2"></td>
                                row 12: <td>Travelling Date</td><td>Date</td>
                                Yes, that works. Columns match (1+1+2=4).
                            */}
                        </tr>

                        <tr>
                            <td>Travelling Date :</td>
                            <td>{getField('dispatchDate', 'dateTime')}</td>
                            {/* Covered by rowspan above */}
                        </tr>

                        <tr>
                            <td>Required Time :</td>
                            <td>{getField('duration')}</td>
                            <td colSpan="2"></td>
                        </tr>

                        <tr>
                            <td>Quantity (MT) :</td>
                            <td>{quantity}</td>
                            <td>Driver Name</td>
                            <td>{getField('driverName')}</td>
                        </tr>

                        <tr>
                            <td>Driver License No :</td>
                            <td>{getField('driverLicense')}</td>
                            <td>Via</td>
                            <td>{getField('routeVia')}</td>
                        </tr>

                        <tr>
                            <td>Driver Phone No :</td>
                            <td>{getField('driverPhone')}</td>
                            <td>Lessee / Authorized Person :</td>
                            <td>{getField('authPerson')}</td>
                        </tr>

                        <tr style={{ height: '50px' }}>
                            <td>Driver Signature :</td>
                            <td></td>
                            <td>Signature of AD/DD :</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'bottom', fontSize: '8px' }}> </td>
                        </tr>
                    </tbody>

                </table>

            </div>
        </div>
    );
};

const PrintLayout = React.forwardRef(({ settings, qrData, data }, ref) => {
    // Logic to merge data
    const finalData = data || { ...qrData, ...settings };
    if (!finalData) return null;

    const { name: mineralName, qty: quantity } = splitMineralQty(finalData.mineralQty || finalData.material || '');
    const getField = (key, altKey) => finalData[key] || finalData[altKey] || '';

    return (
        <div ref={ref} className="print-source">
            <style>{`
                /* A4 Page Setup */
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: white;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-source { width: 100%; height: 100%; }
                }

                .sheet {
                    width: 210mm;
                    height: 148mm; /* Slightly less than 148.5mm to ensure no bleed */
                    background: white;
                    box-sizing: border-box;
                    /* Precise Margins from User CSS */
                    padding-top: 1.45cm;
                    padding-bottom: 0.49cm;
                    padding-left: 1.75cm;
                    padding-right: 1.5cm;
                    
                    position: relative;
                    margin: 0 auto;
                    border-bottom: 1px dashed #ccc; /* Separator */
                    overflow: hidden; /* Prevent content from pushing bounds */
                }
                
                .sheet:last-child {
                    border-bottom: none;
                }

                /* Content Area */
                .content-area {
                    width: 100%;
                }

                /* Header */
                .header-top {
                    display: flex;
                    justify-content: flex-end;
                    align-items: flex-start;
                    margin-bottom: 2px;
                    font-size: 14pt;
                    // font-weight: bold;
                }

                .header-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 9pt;
                    // font-weight: bold;
                    margin-bottom: 2px;
                }

                .qr-placeholder {
                    width: 60px;
                    height: 60px;
                    margin-left: 10px;
                }
                
                /* Table Styling */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9pt;
                    table-layout: fixed;
                    line-height: 1.1;
                }

                td {
                    border: 1px solid black;
                    padding: 2px 4px;
                    vertical-align: middle;
                    word-wrap: break-word;
                }

                /* Column Widths */
                col.c1 { width: 25%; }
                col.c2 { width: 25%; }
                col.c3 { width: 25%; }
                col.c4 { width: 25%; }

                /* Row heights */
                tr { height: 18px; }
            `}</style>

            {/* Top Slip */}
            <SingleSlip data={finalData} getField={getField} mineralName={mineralName} quantity={quantity} />

            {/* Bottom Slip */}
            <SingleSlip data={finalData} getField={getField} mineralName={mineralName} quantity={quantity} />
        </div>
    );
});

export default PrintLayout;
