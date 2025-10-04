import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

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
    { width: 0.5 }, // A - border
    { width: 2.5 },    // B
    { width: 5 },    // C
    { width: 15 },   // D
    { width: 12 },   // E
    { width: 12 },   // F
    { width: 12 },   // G
    { width: 12 },   // H
    { width: 22 },   // I
    { width: 12 },   // J
    { width: 12 },   // K
    { width: 15 },   // L
    { width: 12 },   // M
    { width: 2.5 },   // N
    { width: 0.5 }, // O - border
  ];

  // Set first row height and fill
  const firstRow = sheet.getRow(1);
  firstRow.height = 2.25;
  firstRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= 15) { // A=1 → O=15
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9D9D9" }, // light gray (Excel default gray)
      };
    }
  });

  // Merge rows 2 and 3 from A to O
  sheet.mergeCells("A2:O3");

  // --- HEADER SECTION (Starting at Row 6) ---
  // Row 6: Company name in Arabic
  sheet.mergeCells("C6:M6");
  const companyRow = sheet.getRow(6);
  companyRow.getCell("C").value = "الشركة العالمية التخصصية للأغذية";
  companyRow.getCell("C").font = { name: "Calibri", size: 16, bold: true };
  companyRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  companyRow.height = 28;

  // Row 7: Quotation title
  sheet.mergeCells("C7:M7");
  const titleRow = sheet.getRow(7);
  titleRow.getCell("C").value = "Quotation - عرض سعر";
  titleRow.getCell("C").font = { name: "Calibri", size: 14, bold: true };
  titleRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 25;

  // Row 8: Intro text
  sheet.mergeCells("C8:M8");
  const introRow = sheet.getRow(8);
  introRow.getCell("C").value = "Peace Be Upon You ,, Upon your kind request ,,, We are providing you a quotation for your event ,, Hoping it pleases you ,,";
  introRow.getCell("C").font = { name: "Calibri", size: 11, italic: true };
  introRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  introRow.height = 20;

  // Row 9: Spacer row
  sheet.mergeCells("C9:N9");
  sheet.getRow(9).height = 10;

  // --- CLIENT / EVENT DETAILS BLOCK ---
  // Left block (Client info) - rows 10-14
  // Row 10: "To:"
  const row10 = sheet.getRow(10);
  sheet.mergeCells("C10:M10");
  row10.getCell("C").value = "To:";
  row10.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  row10.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  row10.height = 18;

  // Row 11: Client name
  const row11 = sheet.getRow(11);
  sheet.mergeCells("C11:M11");
  row11.getCell("C").value = clientInfo?.clientName || "";
  row11.getCell("C").font = { name: "Calibri", size: 11 };
  row11.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  row11.height = 18;

  // Row 12: Address (left) + Quotation Date (right)
  const row12 = sheet.getRow(12);
  row12.getCell("C").value = "A:";
  row12.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  row12.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("D12:E12");
  row12.getCell("D").value = clientInfo?.location || "";
  row12.getCell("D").font = { name: "Calibri", size: 11 };
  row12.getCell("D").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Quotation Date
  row12.getCell("I").value = "Quotation Date:";
  row12.getCell("I").font = { name: "Calibri", size: 11, bold: true };
  row12.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  row12.getCell("J").value = formattedDate;
  row12.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row12.height = 18;

  // Row 13: Phone (left) + Due Date (right)
  const row13 = sheet.getRow(13);
  row13.getCell("C").value = "P:";
  row13.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  row13.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("D13:E13");
  row13.getCell("D").value = clientInfo?.mobileNumber || "";
  row13.getCell("D").font = { name: "Calibri", size: 11 };
  row13.getCell("D").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Due Date (can be calculated or left empty)
  row13.getCell("I").value = "Due Date:";
  row13.getCell("I").font = { name: "Calibri", size: 11, bold: true };
  row13.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  row13.getCell("J").value = "";
  row13.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row13.height = 18;

  // Row 14: Spacer row
  sheet.getRow(14).height = 5;

  // --- EVENT DETAILS (Rows 15-17) ---
  // Row 15: Event Organizer
  const row15 = sheet.getRow(15);
  sheet.mergeCells("C15:D15");
  row15.getCell("C").value = "Event Organizer:";
  row15.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  row15.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("E15:F15");
  row15.getCell("E").value = clientInfo?.eventOrganizer || "";
  row15.getCell("E").font = { name: "Calibri", size: 11 };
  row15.getCell("E").alignment = { horizontal: "left", vertical: "middle" };
  row15.height = 18;

  // Row 16: Number of People (left) + Location of Event (right)
  const row16 = sheet.getRow(16);
  sheet.mergeCells("C16:D16");
  row16.getCell("C").value = "Number of People:";
  row16.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  row16.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("E16:F16");
  row16.getCell("E").value = clientInfo?.numberOfPeople || "";
  row16.getCell("E").font = { name: "Calibri", size: 11 };
  row16.getCell("E").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Location of Event
  row16.getCell("I").value = "Location of Event:";
  row16.getCell("I").font = { name: "Calibri", size: 11, bold: true };
  row16.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("J16:K16");
  row16.getCell("J").value = clientInfo?.location || "";
  row16.getCell("J").font = { name: "Calibri", size: 11 };
  row16.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row16.height = 18;

  // Row 17: Date of Event (left) + Pickup Time (right)
  const row17 = sheet.getRow(17);
  sheet.mergeCells("C17:D17");
  row17.getCell("C").value = "Date of Event:";
  row17.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  row17.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("E17:F17");
  row17.getCell("E").value = clientInfo?.eventDate || "";
  row17.getCell("E").font = { name: "Calibri", size: 11 };
  row17.getCell("E").alignment = { horizontal: "left", vertical: "middle" };
  // Right side: Pickup Time
  row17.getCell("I").value = "Pickup Time:";
  row17.getCell("I").font = { name: "Calibri", size: 11, bold: true };
  row17.getCell("I").alignment = { horizontal: "left", vertical: "middle" };
  sheet.mergeCells("J17:K17");
  row17.getCell("J").value = clientInfo?.pickupTime || "";
  row17.getCell("J").font = { name: "Calibri", size: 11 };
  row17.getCell("J").alignment = { horizontal: "left", vertical: "middle" };
  row17.height = 18;

  // Row 18: Empty spacer
  sheet.getRow(18).height = 10;

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
  headerRow.font = { name: "Calibri", size: 11, bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  headerRow.height = 25;

  // Apply borders and fill to header cells (C to M)
  for (const col of ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]) {
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }

  // --- DYNAMIC PRODUCT ROWS (Starting Row 20) ---
  let currentRow = 20;

  // --- Table data rows ---
  items.forEach((item, idx) => {
    const r = sheet.getRow(currentRow);
    
    // Column C: Item No
    r.getCell("C").value = idx + 1;
    r.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column D:E: Product (English) - merged
    sheet.mergeCells(`D${currentRow}:E${currentRow}`);
    r.getCell("D").value = item.item;
    r.getCell("D").alignment = { horizontal: "left", vertical: "middle" };
    
    // Column F:G: Product (Arabic) - merged
    sheet.mergeCells(`F${currentRow}:G${currentRow}`);
    r.getCell("F").value = item.arabicName;
    r.getCell("F").alignment = { horizontal: "right", vertical: "middle" };
    
    // Column H: Unit
    r.getCell("H").value = item.unit;
    r.getCell("H").alignment = { horizontal: "center", vertical: "middle" };
    
    // Column I: Price per unit
    r.getCell("I").value = item.pricePerUnit;
    r.getCell("I").numFmt = '#,##0.00';
    r.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
    
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
    r.getCell("L").alignment = { horizontal: "right", vertical: "middle" };

    // Font & heights
    r.height = 20;
    r.font = { name: "Calibri", size: 11 };

    // Apply borders to all cells C to M
    for (const colName of ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]) {
      const cell = r.getCell(colName);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    currentRow++;
  });



  // --- Buffet - Banquet Details section ---
  // Spacer row
  sheet.getRow(currentRow).height = 15;
  currentRow++;

  // Header row for Buffet - Banquet Details
  sheet.mergeCells(`C${currentRow}:M${currentRow}`);
  const buffetHeaderRow = sheet.getRow(currentRow);
  buffetHeaderRow.getCell("C").value = "Buffets - Banquet Details - التفاصيل";
  buffetHeaderRow.getCell("C").font = { name: "Calibri", size: 12, bold: true };
  buffetHeaderRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  buffetHeaderRow.getCell("C").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  buffetHeaderRow.height = 25;
  currentRow++;

  // Buffet details rows - filter items that have buffet details
  const buffetItems = items.filter(item => item.arabicName && item.arabicName.trim() !== "");
  
  buffetItems.forEach((item) => {
    const buffetRow = sheet.getRow(currentRow);
    
    // Item name in column C-D-E (merged)
    sheet.mergeCells(`C${currentRow}:E${currentRow}`);
    buffetRow.getCell("C").value = item.item;
    buffetRow.getCell("C").font = { name: "Calibri", size: 11, bold: true };
    buffetRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
    
    // Arabic description in columns F-M (merged)
    sheet.mergeCells(`F${currentRow}:M${currentRow}`);
    buffetRow.getCell("F").value = item.arabicName;
    buffetRow.getCell("F").font = { name: "Calibri", size: 11 };
    buffetRow.getCell("F").alignment = { horizontal: "left", vertical: "middle" };
    
    buffetRow.height = 20;
    currentRow++;
  });

  // --- Invoice Details section ---
  // Spacer row
  sheet.getRow(currentRow).height = 15;
  currentRow++;

  // Header row with two sections: Invoice Details and Status of Quotation
  const invoiceHeaderRow = sheet.getRow(currentRow);
  
  // Invoice Details (left side - C to I merged)
  sheet.mergeCells(`C${currentRow}:I${currentRow}`);
  invoiceHeaderRow.getCell("C").value = "Invoice Details";
  invoiceHeaderRow.getCell("C").font = { name: "Calibri", size: 12, bold: true };
  invoiceHeaderRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  invoiceHeaderRow.getCell("C").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  
  // Status of Quotation (right side - J to M merged)
  sheet.mergeCells(`J${currentRow}:M${currentRow}`);
  invoiceHeaderRow.getCell("J").value = "Status of Quotation- حاله العرض";
  invoiceHeaderRow.getCell("J").font = { name: "Calibri", size: 12, bold: true };
  invoiceHeaderRow.getCell("J").alignment = { horizontal: "center", vertical: "middle" };
  invoiceHeaderRow.getCell("J").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  
  invoiceHeaderRow.height = 25;
  currentRow++;

  // Empty row
  sheet.getRow(currentRow).height = 18;
  currentRow++;

  // Store the starting row for the vertical merge
  const invoiceDetailsStartRow = currentRow;

  // Total Exclude VAT row
  const totalExcVATRow = sheet.getRow(currentRow);
  totalExcVATRow.getCell("C").value = "Total Exclude VAT";
  totalExcVATRow.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  totalExcVATRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  totalExcVATRow.getCell("I").value = totals.totalExcludeVAT;
  totalExcVATRow.getCell("I").numFmt = '#,##0.00';
  totalExcVATRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  totalExcVATRow.height = 20;
  currentRow++;

  // VAT 15% row
  const vatRow = sheet.getRow(currentRow);
  vatRow.getCell("C").value = "VAT 15%";
  vatRow.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  vatRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  vatRow.getCell("I").value = totals.vat;
  vatRow.getCell("I").numFmt = '#,##0.00';
  vatRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  vatRow.height = 20;
  currentRow++;

  // Total Amount row
  const totalAmtRow = sheet.getRow(currentRow);
  totalAmtRow.getCell("C").value = "Total Amount";
  totalAmtRow.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  totalAmtRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  totalAmtRow.getCell("I").value = totals.totalAmount;
  totalAmtRow.getCell("I").numFmt = '#,##0.00';
  totalAmtRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  totalAmtRow.height = 20;
  currentRow++;

  // Paid Amount row
  const paidAmtRow = sheet.getRow(currentRow);
  paidAmtRow.getCell("C").value = "Paid Amount";
  paidAmtRow.getCell("C").font = { name: "Calibri", size: 11, bold: true };
  paidAmtRow.getCell("C").alignment = { horizontal: "left", vertical: "middle" };
  paidAmtRow.getCell("I").value = "";
  paidAmtRow.getCell("I").alignment = { horizontal: "right", vertical: "middle" };
  paidAmtRow.height = 20;
  currentRow++;

  // Remaining Amount (Balance) row
  const remainingAmtRow = sheet.getRow(currentRow);
  remainingAmtRow.getCell("C").value = "Remaining Amount (Balance)";
  remainingAmtRow.getCell("C").font = { name: "Calibri", size: 11, bold: true };
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
  sheet.getCell(`J${invoiceDetailsStartRow}`).font = { name: "Calibri", size: 11 };
  sheet.getCell(`J${invoiceDetailsStartRow}`).alignment = { horizontal: "center", vertical: "middle" };
  
  currentRow++;

  // Empty row
  sheet.getRow(currentRow).height = 18;
  currentRow++;

  // --- Terms & Conditions block ---
  // Spacer row
  sheet.getRow(currentRow).height = 15;
  currentRow++;

  sheet.mergeCells(`C${currentRow}:M${currentRow}`);
  const termsHeaderRow = sheet.getRow(currentRow);
  termsHeaderRow.getCell("C").value = "Terms & Conditions - الشروط والاحكام";
  termsHeaderRow.getCell("C").font = { name: "Calibri", size: 12, bold: true };
  termsHeaderRow.getCell("C").alignment = { horizontal: "center", vertical: "middle" };
  termsHeaderRow.getCell("C").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  termsHeaderRow.height = 25;
  currentRow++;

  // Terms text - English (merged into one row with line breaks)
  sheet.mergeCells(`C${currentRow}:M${currentRow}`);
  const termsTextRow = sheet.getRow(currentRow);
  termsTextRow.getCell("C").value =
    "This quotation is valid for 3 days from the date of sending the quotation, once approved 100% of the quotation total amount should be paid 3 days before the event.\nOnce booking is confirmed, the payment will not be refunded for any reason.\nPlease send a copy of transfers by E-mail";
  termsTextRow.getCell("C").font = { name: "Calibri", size: 10 };
  termsTextRow.getCell("C").alignment = { horizontal: "left", vertical: "top", wrapText: true };
  termsTextRow.height = 60;
  currentRow++;

  // Empty row separator
  sheet.getRow(currentRow).height = 10;
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

  // Signature space (optional)
  sheet.getRow(currentRow).height = 30;

  return workbook;
}
