import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

interface MenuRow {
  Item: string;
  Arabic?: string;
  Unit?: string;
  Price: number;
}

interface OrderRow {
  Item: string;
  Quantity: number;
  Days?: number;
}

interface ProcessedItem {
  item: string;
  arabicName: string;
  unit: string;
  pricePerUnit: number;
  qty: number;
  days: number;
  total: number;
}

interface ClientInfo {
  clientName?: string;
  mobileNumber?: string;
  eventOrganizer?: string;
  numberOfPeople?: string;
  eventDate?: string;
  location?: string;
  pickupTime?: string;
  serialNumber?: string;
}

export async function POST(req: Request) {
  try {
    const { menuData, orderData, clientInfo } = await req.json();

    if (!menuData || !orderData) {
      return NextResponse.json(
        { error: "Menu and order data required" },
        { status: 400 }
      );
    }

    // Match order with menu (preserve business logic exactly: qty * price * days)
    const items: ProcessedItem[] = orderData.map((row: OrderRow) => {
      const itemName = row.Item;
      const quantity = row.Quantity;
      const days = row.Days || 1;

      const menuEntry: MenuRow | undefined = menuData.find(
        (m: MenuRow) => m.Item === itemName
      );

      const price = menuEntry?.Price || 0;
      const arabicName = menuEntry?.Arabic || "";
      const unit = menuEntry?.Unit || "";

      return {
        item: itemName,
        arabicName,
        unit,
        pricePerUnit: price,
        qty: quantity,
        days,
        total: price * quantity * days,
      };
    });

    console.log('Received orderData:', orderData);
    console.log('Processed items:', items);

    // Compute totals (unchanged logic): subtotal, VAT (15%), grand total
    const totalExcludeVAT = items.reduce((sum, r) => sum + r.total, 0);
    const vat = totalExcludeVAT * 0.15;
    const totalAmount = totalExcludeVAT + vat;

    // Create workbook via the single centralized function (accepts totals object)
    const workbook = createWorkbook(
      items,
      menuData,
      clientInfo || {},
      {
        totalExcludeVAT,
        vat,
        totalAmount,
      }
    );

    // Write buffer and return as attachment (preserve headers)
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="quotation.xlsx"',
      },
    });
  } catch (err: unknown) {
    console.error('Error details:', err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to generate quotation" },
      { status: 500 }
    );
  }
}

/**
 * Creates a 3-row divider with alternating gray-white-gray colors.
 * @param sheet - The worksheet to add the divider to
 * @param currentRow - The row number where the divider starts
 * @returns The next row number after the divider
 */
function divider(sheet: ExcelJS.Worksheet, currentRow: number): number {
  const colors = ["D9D9D9", "FFFFFF", "D9D9D9"]; // gray, white, gray
  const columnLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  
  for (let i = 0; i < 3; i++) {
    const row = sheet.getRow(currentRow);
    row.height = 5;
    
    // Apply fill color to cells A through O
    for (const col of columnLetters) {
      const cell = row.getCell(col);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors[i] },
      };
    }
    
    currentRow++;
  }
  
  return currentRow;
}

/**
 * Centralized workbook creation.
 * signature:
 * (items, menuData, clientInfo, totals) => ExcelJS.Workbook
 */
function createWorkbook(
  items: ProcessedItem[],
  menuData: MenuRow[],
  clientInfo: ClientInfo,
  totals: { totalExcludeVAT: number; vat: number; totalAmount: number }
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();

  // Main worksheet — exact name required
  const sheet = workbook.addWorksheet("Sheet1 (2)");

  // Ensure left-to-right view
  sheet.views = [{ rightToLeft: false }];

  // Set column widths as per spec (A to O)
  sheet.columns = [
    { width: 0.43 }, // A - border
    { width: 1.14 }, // B
    { width: 3.57 }, // C
    { width: 11.00 }, // D
    { width: 13 },   // E
    { width: 15 },   // F
    { width: 13 },   // G
    { width: 8.57 }, // H
    { width: 15.29 }, // I
    { width: 8.86 }, // J
    { width: 9.29 }, // K
    { width: 10.00 }, // L
    { width: 6.57 }, // M
    { width: 1.14 }, // N
    { width: 0.43 }, // O - border
  ];

  // Set first row height and fill
  const firstRow = sheet.getRow(1);
  firstRow.height = 2.25;
  
  // Apply gray fill to all columns A to O in row 1
  const row1Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  for (const col of row1Columns) {
    const cell = firstRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" }, // light gray (Excel default gray)
    };
  }

  // Merge rows 2 and 3 from B to N
  sheet.mergeCells("B2:N3");
  
  // Set row height for row 2 (increase by 10 from default ~15 to 25)
  sheet.getRow(2).height = 30;

  // Add ISFC logo to the merged cell
  const logoPath = path.join(process.cwd(), "public", "images", "isfc-logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString("base64");
  const logoId = workbook.addImage({
    base64: logoBase64,
    extension: "png",
  });
  
  // Add image to the worksheet (centered in the merged B2:N3 area)
  // Using tl (top-left) and ext (extent) to maintain aspect ratio
  // B2:N3 spans columns 1-13 (B to N), rows 1-2 (2 to 3)
  // Center horizontally: start at column ~6.5 (middle of B to N range)
  // Center vertically: start at row ~1.3 (middle of 2 rows)
  sheet.addImage(logoId, {
    tl: { col: 6.9999, row: 1.2 }, // slightly left of center
    ext: { width: 110, height: 50 }, // explicit dimensions to maintain ratio (reduced by 20%)
    editAs: "oneCell",
  });

  // Row 4: Spacer row
  sheet.mergeCells("B4:N4");
  sheet.getRow(4).height = 40;

  // Row 5: Gray spacer row
  const row5 = sheet.getRow(5);
  row5.height = 5;
  const row5Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  for (const col of row5Columns) {
    const cell = row5.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
  }

  // --- HEADER SECTION (Starting at Row 6) ---
  // Row 6: Company name in Arabic
  sheet.mergeCells("C6:M6");
  const companyRow = sheet.getRow(6);
  companyRow.getCell("C").value = "الشركة العالمية التخصصية للأغذية";
  companyRow.getCell("C").font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  companyRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  companyRow.height = 20.25;

  // Row 7: Quotation title
  sheet.mergeCells("C7:M7");
  const titleRow = sheet.getRow(7);
  titleRow.getCell("C").value = "Quotation - عرض سعر";
  titleRow.getCell("C").font = { name: "Calibri", size: 10, bold: true };
  titleRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 25;

  // Row 8: Intro text
  sheet.mergeCells("C8:M8");
  const introRow = sheet.getRow(8);
  introRow.getCell("C").value = "Peace Be Upon You ,, Upon your kind request ,,, We are providing you a quotation for your event ,, Hoping it pleases you ,,";
  introRow.getCell("C").font = { name: "Calibri", size: 9, italic: true };
  introRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  introRow.height = 20;

  // Row 9: Spacer row
  const row9 = sheet.getRow(9);
  row9.height = 5;
  const row9Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  for (const col of row9Columns) {
    const cell = row9.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
  }

  // --- CLIENT / EVENT DETAILS BLOCK ---
  // Left block (Client info) - rows 10-14
  // Row 10: "To:"
  const row10 = sheet.getRow(10);
  sheet.mergeCells("C10:M10");
  row10.getCell("C").value = "To:";
  row10.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  row10.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  row10.height = 18;

  // Row 11: Client name
  const row11 = sheet.getRow(11);
  sheet.mergeCells("C11:M11");
  row11.getCell("C").value = clientInfo?.clientName || "";
  row11.getCell("C").font = { name: "Calibri", size: 9 };
  row11.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  row11.height = 18;

  // Row 12: Address (left) + Quotation Date (right)
  const row12 = sheet.getRow(12);
  row12.getCell("C").value = "A:";
  row12.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  row12.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("D12:H12");
  row12.getCell("D").value = clientInfo?.location || "";
  row12.getCell("D").font = { name: "Calibri", size: 9 };
  row12.getCell("D").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Quotation Date
  row12.getCell("I").value = "Quotation Date:";
  row12.getCell("I").font = { name: "Calibri", size: 9, bold: true };
  row12.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("J12:M12");
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  row12.getCell("J").value = formattedDate;
  row12.getCell("J").font = { name: "Calibri", size: 9 };
  row12.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row12.height = 18;

  // Row 13: Phone (left) + Due Date (right)
  const row13 = sheet.getRow(13);
  row13.getCell("C").value = "P:";
  row13.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  row13.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("D13:H13");
  row13.getCell("D").value = clientInfo?.mobileNumber || "";
  row13.getCell("D").font = { name: "Calibri", size: 9 };
  row13.getCell("D").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Due Date (can be calculated or left empty)
  row13.getCell("I").value = "Due Date:";
  row13.getCell("I").font = { name: "Calibri", size: 9, bold: true };
  row13.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("J13:M13");
  row13.getCell("J").value = "";
  row13.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row13.height = 18;

  // Row 14: Spacer row
  const row14 = sheet.getRow(14);
  row14.height = 5;
  const row14Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  for (const col of row14Columns) {
    const cell = row14.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
  }

  // --- EVENT DETAILS (Rows 15-17) ---
  // Row 15: Event Organizer
  const row15 = sheet.getRow(15);
  sheet.mergeCells("C15:D15");
  row15.getCell("C").value = "Event Organizer:";
  row15.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  row15.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("E15:F15");
  row15.getCell("E").value = clientInfo?.eventOrganizer || "";
  row15.getCell("E").font = { name: "Calibri", size: 9 };
  row15.getCell("E").alignment = { horizontal: "left", vertical: "middle" };
  row15.height = 18;

  // Row 16: Number of People (left) + Location of Event (right)
  const row16 = sheet.getRow(16);
  sheet.mergeCells("C16:D16");
  row16.getCell("C").value = "Number of People:";
  row16.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  row16.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("E16:F16");
  row16.getCell("E").value = clientInfo?.numberOfPeople || "";
  row16.getCell("E").font = { name: "Calibri", size: 9 };
  row16.getCell("E").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Location of Event
  row16.getCell("I").value = "Location of Event:";
  row16.getCell("I").font = { name: "Calibri", size: 9, bold: true };
  row16.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("J16:K16");
  row16.getCell("J").value = clientInfo?.location || "";
  row16.getCell("J").font = { name: "Calibri", size: 9 };
  row16.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row16.height = 18;

  // Row 17: Date of Event (left) + Pickup Time (right)
  const row17 = sheet.getRow(17);
  sheet.mergeCells("C17:D17");
  row17.getCell("C").value = "Date of Event:";
  row17.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  row17.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("E17:F17");
  row17.getCell("E").value = clientInfo?.eventDate || "";
  row17.getCell("E").font = { name: "Calibri", size: 9 };
  row17.getCell("E").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Pickup Time
  row17.getCell("I").value = "Pickup Time:";
  row17.getCell("I").font = { name: "Calibri", size: 9, bold: true };
  row17.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("J17:K17");
  row17.getCell("J").value = clientInfo?.pickupTime || "";
  row17.getCell("J").font = { name: "Calibri", size: 9 };
  row17.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row17.height = 18;

  // Row 18: Empty spacer
  const row18 = sheet.getRow(18);
  row18.height = 10;
  const row18Columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  for (const col of row18Columns) {
    const cell = row18.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
  }

  // --- TABLE HEADER (Row 19) ---
  const headerRow = sheet.getRow(19);
  headerRow.getCell("C").value = "#";
  sheet.mergeCells("D19:E19");
  headerRow.getCell("D").value = "Product";
  sheet.mergeCells("F19:G19");
  headerRow.getCell("F").value = "Product (arb)";
  headerRow.getCell("H").value = "Unit";
  headerRow.getCell("I").value = "Price per unit";
  headerRow.getCell("J").value = "QTY";
  headerRow.getCell("K").value = "#DAYS";
  sheet.mergeCells("L19:M19");
  headerRow.getCell("L").value = "Total Price";

  // Style header row
  headerRow.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  headerRow.height = 25;

  // Apply fill and white font to header cells (B to N)
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FFFFFFFF" } };
  }

  // Add divider after header
  let currentRow = divider(sheet, 20);

  // --- DYNAMIC PRODUCT ROWS ---

  // --- Table data rows ---
  items.forEach((item, idx) => {
    const r = sheet.getRow(currentRow);
    
    // Column C: Item No
    r.getCell("C").value = idx + 1;
    r.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column D:E: Product (English) - merged
    sheet.mergeCells(`D${currentRow}:E${currentRow}`);
    r.getCell("D").value = item.item;
    r.getCell("D").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column F:G: Product (Arabic) - merged
    sheet.mergeCells(`F${currentRow}:G${currentRow}`);
    r.getCell("F").value = item.arabicName;
    r.getCell("F").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column H: Unit
    r.getCell("H").value = item.unit;
    r.getCell("H").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column I: Price per unit
    r.getCell("I").value = item.pricePerUnit;
    r.getCell("I").numFmt = '#,##0.00';
    r.getCell("I").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column J: Quantity
    r.getCell("J").value = item.qty;
    r.getCell("J").numFmt = '0';
    r.getCell("J").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column K: Days
    r.getCell("K").value = item.days;
    r.getCell("K").numFmt = '0';
    r.getCell("K").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column L:M: Total price - merged
    sheet.mergeCells(`L${currentRow}:M${currentRow}`);
    r.getCell("L").value = item.total;
    r.getCell("L").numFmt = '#,##0.00';
    r.getCell("L").alignment = { horizontal: "center", vertical: "middle" };

    // Font & heights
    r.height = 20;
    r.font = { name: "Calibri", size: 9 };

    currentRow++;
    
    // Add divider between items
    currentRow = divider(sheet, currentRow);
  });

  // --- Buffet - Banquet Details section ---
  // Header row for Buffet - Banquet Details
  sheet.mergeCells(`B${currentRow}:N${currentRow}`);
  const buffetHeaderRow = sheet.getRow(currentRow);
  buffetHeaderRow.getCell("B").value = "Buffets - Banquet Details - التفاصيل";
  buffetHeaderRow.getCell("B").alignment = { horizontal: "center", vertical: "middle" };
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    buffetHeaderRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    buffetHeaderRow.getCell(col).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  }
  buffetHeaderRow.height = 25;
  currentRow++;

  // Add divider after buffet header
  currentRow = divider(sheet, currentRow);

  // Buffet details rows - filter items that have buffet details
  const buffetItems = items.filter(item => item.arabicName && item.arabicName.trim() !== "");
  
  buffetItems.forEach((item) => {
    const buffetRow = sheet.getRow(currentRow);
    
    // Item name in column C-D-E (merged)
    sheet.mergeCells(`C${currentRow}:E${currentRow}`);
    buffetRow.getCell("C").value = item.item;
    buffetRow.getCell("C").font = { name: "Calibri", size: 9, bold: true };
    buffetRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
    
    // Arabic description in columns F-M (merged)
    sheet.mergeCells(`F${currentRow}:M${currentRow}`);
    buffetRow.getCell("F").value = item.arabicName;
    buffetRow.getCell("F").font = { name: "Calibri", size: 9 };
    buffetRow.getCell("F").alignment = { horizontal: "center", vertical: "middle" };
    
    buffetRow.height = 40;
    currentRow++;
    
    // Add divider after each buffet entry
    currentRow = divider(sheet, currentRow);
  });

  // --- Invoice Details section ---
  // Header row with two sections: Invoice Details and Status of Quotation
  const invoiceHeaderRow = sheet.getRow(currentRow);
  
  // Invoice Details (left side - C to I merged)
  sheet.mergeCells(`C${currentRow}:I${currentRow}`);
  invoiceHeaderRow.getCell("C").value = "Invoice Details";
  invoiceHeaderRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  
  // Status of Quotation (right side - J to M merged)
  sheet.mergeCells(`J${currentRow}:M${currentRow}`);
  invoiceHeaderRow.getCell("J").value = "Status of Quotation- حاله العرض";
  invoiceHeaderRow.getCell("J").alignment = { horizontal: "center", vertical: "middle" };
  
  // Apply fill and white font to all header cells (B to N)
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    invoiceHeaderRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    invoiceHeaderRow.getCell(col).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  }
  
  invoiceHeaderRow.height = 25;
  currentRow++;

  // Add divider after invoice header
  currentRow = divider(sheet, currentRow);

  // Store the starting row for the vertical merge
  const invoiceDetailsStartRow = currentRow;

  // Total Exclude VAT row
  const totalExcVATRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  totalExcVATRow.getCell("C").value = "Total Exclude VAT";
  totalExcVATRow.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  totalExcVATRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  totalExcVATRow.getCell("I").value = totals.totalExcludeVAT;
  totalExcVATRow.getCell("I").numFmt = '#,##0.00';
  totalExcVATRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  totalExcVATRow.height = 20;
  currentRow++;

  // VAT 15% row
  const vatRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  vatRow.getCell("C").value = "VAT 15%";
  vatRow.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  vatRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  vatRow.getCell("I").value = totals.vat;
  vatRow.getCell("I").numFmt = '#,##0.00';
  vatRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  vatRow.height = 20;
  currentRow++;

  // Total Amount row
  const totalAmtRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  totalAmtRow.getCell("C").value = "Total Amount";
  totalAmtRow.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  totalAmtRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  totalAmtRow.getCell("I").value = totals.totalAmount;
  totalAmtRow.getCell("I").numFmt = '#,##0.00';
  totalAmtRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  totalAmtRow.height = 20;
  currentRow++;

  // Paid Amount row
  const paidAmtRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  paidAmtRow.getCell("C").value = "Paid Amount";
  paidAmtRow.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  paidAmtRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  paidAmtRow.getCell("I").value = "";
  paidAmtRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  paidAmtRow.height = 20;
  currentRow++;

  // Remaining Amount (Balance) row
  const remainingAmtRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  remainingAmtRow.getCell("C").value = "Remaining Amount (Balance)";
  remainingAmtRow.getCell("C").font = { name: "Calibri", size: 9, bold: true };
  remainingAmtRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  remainingAmtRow.getCell("I").value = "";
  remainingAmtRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  remainingAmtRow.height = 20;
  
  // Store the ending row for the vertical merge
  const invoiceDetailsEndRow = currentRow;
  
  // Merge J:M cells vertically spanning all invoice detail rows
  sheet.mergeCells(`J${invoiceDetailsStartRow}:M${invoiceDetailsEndRow}`);
  
  // Add "Open" text to the merged cell
  sheet.getCell(`J${invoiceDetailsStartRow}`).value = "Open";
  sheet.getCell(`J${invoiceDetailsStartRow}`).font = { name: "Calibri", size: 9 };
  sheet.getCell(`J${invoiceDetailsStartRow}`).alignment = { horizontal: "center", vertical: "middle" };
  
  currentRow++;

  // --- Terms & Conditions block ---
  // Add divider above terms header
  currentRow = divider(sheet, currentRow);

  sheet.mergeCells(`B${currentRow}:N${currentRow}`);
  const termsHeaderRow = sheet.getRow(currentRow);
  termsHeaderRow.getCell("B").value = "Terms & Conditions - الشروط والاحكام";
  termsHeaderRow.getCell("B").alignment = { horizontal: "center", vertical: "middle" };
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    termsHeaderRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    termsHeaderRow.getCell(col).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  }
  termsHeaderRow.height = 25;
  currentRow++;

  // Add divider below terms header
  currentRow = divider(sheet, currentRow);

  // Terms text - English (merged into one row with line breaks)
  sheet.mergeCells(`C${currentRow}:M${currentRow}`);
  const termsTextRow = sheet.getRow(currentRow);
  termsTextRow.getCell("C").value =
    "This quotation is valid for 3 days from the date of sending the quotation, once approved 100% of the quotation total amount should be paid 3 days before the event.\nOnce booking is confirmed, the payment will not be refunded for any reason.\nPlease send a copy of transfers by E-mail";
  termsTextRow.getCell("C").font = { name: "Calibri", size: 10 };
  termsTextRow.getCell("C").alignment = { horizontal: "left", vertical: "top", wrapText: true };
  termsTextRow.height = 60;
  currentRow++;

  // Arabic terms (merged into one row with line breaks)
  sheet.mergeCells(`C${currentRow}:M${currentRow}`);
  const arabicTermsRow = sheet.getRow(currentRow);
  arabicTermsRow.getCell("C").value =
    "العرض ساري لمدة 3 أيام من تاريخ الإرسال و عند حال القبول يتم تحويل 100% من قيمه العرض وبسداد المبلغ كامل قبل المناسبه ب 3 أيام\nي حالة تأكيد الحجز تكون الدفعه غير مستردة لأي سبب من الأسباب\nيتم إرسال صورة من التحويلات على البريد الالكتروني";
  arabicTermsRow.getCell("C").font = { name: "Calibri", size: 10 };
  arabicTermsRow.getCell("C").alignment = { horizontal: "right", vertical: "top", wrapText: true };
  arabicTermsRow.height = 60;
  currentRow++;

  // --- Company's Bank Account Details section ---
  // Add divider above bank header
  currentRow = divider(sheet, currentRow);

  // Header row with two sections: Bank Account Details and Comments
  const bankHeaderRow = sheet.getRow(currentRow);
  
  // Bank Account Details (left side - C to H merged)
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  bankHeaderRow.getCell("C").value = "Company's Bank Account Details - تفاصيل البنك";
  bankHeaderRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  
  // Comments (right side - I to M merged)
  sheet.mergeCells(`I${currentRow}:M${currentRow}`);
  bankHeaderRow.getCell("I").value = "Comments - ملاحظات";
  bankHeaderRow.getCell("I").alignment = { horizontal: "center", vertical: "middle" };
  
  // Apply fill to all header cells (B to N)
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    bankHeaderRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    bankHeaderRow.getCell(col).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  }
  
  bankHeaderRow.height = 25;
  currentRow++;

  // Add divider below bank header
  currentRow = divider(sheet, currentRow);

  // Save the starting row for merging comments later
  const bankDetailsStartRow = currentRow;

  // Name of Account row
  const nameOfAccountRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  nameOfAccountRow.getCell("C").value = "Name of Account: International Specialized Foods Co.";
  nameOfAccountRow.getCell("C").font = { name: "Calibri", size: 9 };
  nameOfAccountRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  nameOfAccountRow.height = 20;
  currentRow++;

  // Number of Account row
  const numberAccountRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  numberAccountRow.getCell("C").value = "Number of Account: #0108095304410014";
  numberAccountRow.getCell("C").font = { name: "Calibri", size: 9 };
  numberAccountRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  numberAccountRow.height = 20;
  currentRow++;

  // IBAN row
  const ibanRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  ibanRow.getCell("C").value = "IBAN Bank of Account: #SA1230400108095304410014";
  ibanRow.getCell("C").font = { name: "Calibri", size: 9 };
  ibanRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  ibanRow.height = 20;
  currentRow++;

  // Name of Bank row
  const nameOfBankRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  nameOfBankRow.getCell("C").value = "Name of Bank: Arab National Bank";
  nameOfBankRow.getCell("C").font = { name: "Calibri", size: 9 };
  nameOfBankRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  nameOfBankRow.height = 20;
  currentRow++;

  // Country row
  const countryRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:H${currentRow}`);
  countryRow.getCell("C").value = "Country: KSA- Riyadh";
  countryRow.getCell("C").font = { name: "Calibri", size: 9 };
  countryRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  countryRow.height = 20;
  currentRow++;

  // Merge all comment cells (I to M) across all 5 bank detail rows into one cell
  const bankDetailsEndRow = currentRow - 1;
  sheet.mergeCells(`I${bankDetailsStartRow}:M${bankDetailsEndRow}`);
  sheet.getCell(`I${bankDetailsStartRow}`).value = "";
  sheet.getCell(`I${bankDetailsStartRow}`).alignment = { horizontal: "center", vertical: "middle" };

  // --- Client's Accreditation section ---
  // Add divider above client accreditation header
  currentRow = divider(sheet, currentRow);

  sheet.mergeCells(`B${currentRow}:N${currentRow}`);
  const clientAccreditationHeaderRow = sheet.getRow(currentRow);
  clientAccreditationHeaderRow.getCell("B").value = "Client's Accreditation - تصديق العميل";
  clientAccreditationHeaderRow.getCell("B").alignment = { horizontal: "center", vertical: "middle" };
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    clientAccreditationHeaderRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    clientAccreditationHeaderRow.getCell(col).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  }
  clientAccreditationHeaderRow.height = 25;
  currentRow++;

  // Add divider below client accreditation header
  currentRow = divider(sheet, currentRow);

  // Save the starting row for Name and Signature headers
  const clientAccreditationStartRow = currentRow;

  // Name and Signature row
  const nameSignatureRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:G${currentRow}`);
  nameSignatureRow.getCell("C").value = "Name";
  nameSignatureRow.getCell("C").font = { name: "Calibri", size: 9 };
  nameSignatureRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  sheet.mergeCells(`H${currentRow}:M${currentRow}`);
  nameSignatureRow.getCell("H").value = "Signature";
  nameSignatureRow.getCell("H").font = { name: "Calibri", size: 9 };
  nameSignatureRow.getCell("H").alignment = { horizontal: "center", vertical: "middle" };
  nameSignatureRow.height = 20;
  currentRow++;

  // Empty signature space (3 rows)
  for (let i = 0; i < 3; i++) {
    sheet.getRow(currentRow).height = 25;
    currentRow++;
  }

  // Merge all cells under Name (C:G) and Signature (H:M) across all rows
  const clientAccreditationEndRow = currentRow - 1;
  sheet.mergeCells(`C${clientAccreditationStartRow + 1}:G${clientAccreditationEndRow}`);
  sheet.mergeCells(`H${clientAccreditationStartRow + 1}:M${clientAccreditationEndRow}`);
  sheet.getCell(`C${clientAccreditationStartRow + 1}`).alignment = { horizontal: "center", vertical: "middle" };
  sheet.getCell(`H${clientAccreditationStartRow + 1}`).alignment = { horizontal: "center", vertical: "middle" };

  // --- Accreditations section ---
  // Add divider above accreditations header
  currentRow = divider(sheet, currentRow);

  sheet.mergeCells(`B${currentRow}:N${currentRow}`);
  const accreditationsHeaderRow = sheet.getRow(currentRow);
  accreditationsHeaderRow.getCell("B").value = "Accreditations - الاعتماد";
  accreditationsHeaderRow.getCell("B").alignment = { horizontal: "center", vertical: "middle" };
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    accreditationsHeaderRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFBFBF" },
    };
    accreditationsHeaderRow.getCell(col).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  }
  accreditationsHeaderRow.height = 25;
  currentRow++;

  // Add divider below accreditations header
  currentRow = divider(sheet, currentRow);

  // Accreditations positions row
  const accreditationsRow = sheet.getRow(currentRow);
  sheet.mergeCells(`C${currentRow}:F${currentRow}`);
  accreditationsRow.getCell("C").value = "Vice Executive President";
  accreditationsRow.getCell("C").font = { name: "Calibri", size: 9 };
  accreditationsRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  
  sheet.mergeCells(`G${currentRow}:I${currentRow}`);
  accreditationsRow.getCell("G").value = "Chief Finance Officer";
  accreditationsRow.getCell("G").font = { name: "Calibri", size: 9 };
  accreditationsRow.getCell("G").alignment = { horizontal: "center", vertical: "middle" };
  
  sheet.mergeCells(`J${currentRow}:M${currentRow}`);
  accreditationsRow.getCell("J").value = "Chief Executive Officer";
  accreditationsRow.getCell("J").font = { name: "Calibri", size: 9 };
  accreditationsRow.getCell("J").alignment = { horizontal: "center", vertical: "middle" };
  accreditationsRow.height = 20;
  currentRow++;

  // Store the starting row for signature space
  const signatureStartRow = currentRow;

  // Empty signature space (3 rows of gap + 1 border row = 4 rows total)
  for (let i = 0; i < 4; i++) {
    if (i === 3) {
      // Fourth row (3 rows below Vice Executive President) - bottom border with light grey fill
      const bottomBorderRow = sheet.getRow(currentRow);
      bottomBorderRow.height = 5;
      // Apply light grey fill to cells B through N
      for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
        const cell = bottomBorderRow.getCell(col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D9D9D9" },
        };
      }
    } else {
      sheet.getRow(currentRow).height = 25;
    }
    currentRow++;
  }

  // Merge signature cells vertically for each position (3 rows)
  const signatureEndRow = currentRow - 2; // Exclude the border row
  sheet.mergeCells(`C${signatureStartRow}:F${signatureEndRow}`); // Vice Executive President
  sheet.mergeCells(`G${signatureStartRow}:I${signatureEndRow}`); // Chief Finance Officer
  sheet.mergeCells(`J${signatureStartRow}:M${signatureEndRow}`); // Chief Executive Officer

  // Store the final row number (the gray bottom border row)
  const finalRow = currentRow - 1;

  // Apply light gray fill to columns A and O from row 1 to final row
  for (let rowNum = 1; rowNum <= finalRow; rowNum++) {
    const row = sheet.getRow(rowNum);
    
    // Column A
    const cellA = row.getCell("A");
    cellA.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
    
    // Column O
    const cellO = row.getCell("O");
    cellO.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
  }

  return workbook;
}
