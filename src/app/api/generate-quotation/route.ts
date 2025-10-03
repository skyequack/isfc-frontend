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
  const sheet = workbook.addWorksheet("Quotation-عرض سعر");

  // Ensure left-to-right view (uploaded file is LTR with Arabic column)
  sheet.views = [{ rightToLeft: false }];

  // Set column widths precisely (floats provided in spec)
  sheet.columns = [
    { width: 5 }, // No.
    { width: 27.29 }, // Product
    { width: 17.0 },  // Arabic name
    { width: 10.71 }, // Unit
    { width: 16.71 }, // Price per unit
    { width: 6.86 },  // QTY
    { width: 10.71 }, // #DAYS
    { width: 14.71 }, // Total Price
  ];

  // --- Top header block ---
  sheet.mergeCells("A1:H1");
  const companyRow = sheet.getRow(1);
  companyRow.getCell(1).value = "الشركة العالمية التخصصية لألغذية";
  companyRow.getCell(1).font = { name: "Arial", size: 14, bold: true };
  companyRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  companyRow.height = 25;

  sheet.mergeCells("A2:H2");
  const titleRow = sheet.getRow(2);
  titleRow.getCell(1).value = "Quotation - عرض سعر";
  titleRow.getCell(1).font = { name: "Arial", size: 16, bold: true };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;


  // A4 spacer
  sheet.getRow(3).height = 10;

  // --- Client information (start at row 4) ---
  let currentRow = 4;
  const clientFields = [
    { label: "Serial Number:", value: clientInfo?.serialNumber || "" },
    { label: "Client Name:", value: clientInfo?.clientName || "" },
    { label: "Mobile Number:", value: clientInfo?.mobileNumber || "" },
    { label: "Event Organizer:", value: clientInfo?.eventOrganizer || "" },
    { label: "Number of People:", value: clientInfo?.numberOfPeople || "" },
    { label: "Date of event:", value: clientInfo?.eventDate || "" },
    { label: "Location:", value: clientInfo?.location || "After Approval" },
    { label: "Pickup Time:", value: clientInfo?.pickupTime || "" },
  ];

  clientFields.forEach((field) => {
    const r = sheet.getRow(currentRow);
    // Label in column B
    const lbl = r.getCell(2);
    lbl.value = field.label;
    lbl.font = { name: "Arial", size: 10, bold: true };
    lbl.alignment = { horizontal: "left", vertical: "middle" };

    // Value in column C
    const val = r.getCell(3);
    val.value = field.value;
    val.font = { name: "Arial", size: 10 };
    val.alignment = { horizontal: "left", vertical: "middle" };

    r.height = 18;
    currentRow++;
  });



  // empty spacer row after client block
  sheet.getRow(currentRow).height = 10;
  currentRow++;

  sheet.mergeCells("A22:H22");
  const subtitleRow = sheet.getRow(22);
  subtitleRow.getCell(1).value = "Buffets - Banquets";
  subtitleRow.getCell(1).font = { name: "Arial", size: 12, bold: true };
  subtitleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  subtitleRow.height = 20;

  // --- Table header row ---
  const headerRow = sheet.getRow(currentRow);
  headerRow.values = [
    "No.",
    "Product",
    "Arabic name",
    "Unit",
    "Price per unit",
    "QTY",
    "#DAYS",
    "Total Price",
  ];
  headerRow.font = { name: "Arial", size: 10, bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  headerRow.height = 30;

  // Style header cells: grey fill (ARGB), thin borders
  for (let c = 1; c <= 8; c++) {
    const cell = headerRow.getCell(c);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" }, // light grey
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }

  currentRow++;

  // --- Table data rows ---
  items.forEach((item, idx) => {
    const r = sheet.getRow(currentRow);
    // Put numeric values as numbers so Excel can format them
    r.getCell(1).value = idx + 1;
    r.getCell(2).value = item.item;
    r.getCell(3).value = item.arabicName;
    r.getCell(4).value = item.unit;
    r.getCell(5).value = item.pricePerUnit;
    r.getCell(6).value = item.qty;
    r.getCell(7).value = item.days;
    r.getCell(8).value = item.total;

    // Font & heights
    r.height = 25;
    for (let c = 1; c <= 8; c++) {
      const cell = r.getCell(c);
      cell.font = { name: "Arial", size: 10 };
      // Borders
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      // Alignment: numeric center for columns 1 and 5-8; text left for 2-4
      if (c === 1 || c >= 5) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    }

    // Number formatting for price/amount columns (5 and 8) and integer columns (6-7)
    const priceCell = r.getCell(5);
    priceCell.numFmt = '#,##0 "SAR"';
    const qtyCell = r.getCell(6);
    qtyCell.numFmt = '0';
    const daysCell = r.getCell(7);
    daysCell.numFmt = '0';
    const totalCell = r.getCell(8);
    totalCell.numFmt = '#,##0 "SAR"';

    currentRow++;
  });



  const r = sheet.getRow(currentRow - 1);
  for (let c = 1; c <= 8; c++) {
    const cell = r.getCell(c);
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    // empty numeric formatting for empties to be safe
    if (c === 8 && !cell.value) cell.numFmt = '#,##0 "SAR"';
  }
  currentRow++;

  // spacer row before summary
  sheet.getRow(currentRow).height = 8;
  currentRow++;

  // --- Summary block (labels merged A:G and amounts in H) ---
  // Helper to add a merged label at A:G and numeric in H
  function addSummaryLine(label: string, numericValue: number | null, labelFontSize = 11, labelBold = true, amountFontSize = 11, amountBold = true, amountFillARGB?: string, rowHeight = 25) {
    console.log('Debugging addSummaryLine:', { currentRow, label, numericValue });
    if (sheet.getCell(`A${currentRow}`).isMerged) {
      console.error(`Row ${currentRow} is already merged. Skipping mergeCells.`);
      return;
    }
    sheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const r = sheet.getRow(currentRow);
    const lblCell = r.getCell(1);
    lblCell.value = label;
    lblCell.font = { name: "Arial", size: labelFontSize, bold: labelBold };
    lblCell.alignment = { horizontal: "right", vertical: "middle" };

    const amtCell = r.getCell(8);
    if (numericValue !== null) {
      const rounded = Math.round(numericValue);
      amtCell.value = rounded;
      amtCell.numFmt = '#,##0 "SAR"';
    } else {
      amtCell.value = "";
    }
    amtCell.font = { name: "Arial", size: amountFontSize, bold: amountBold };
    amtCell.alignment = { horizontal: "center", vertical: "middle" };
    if (amountFillARGB) {
      amtCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: amountFillARGB },
      };
    }

    // borders on A:H for the row
    for (let c = 1; c <= 8; c++) {
      const cell = r.getCell(c);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    r.height = rowHeight;
    currentRow++;
  }

  addSummaryLine("Total Exclude VAT", totals.totalExcludeVAT, 11, true, 11, true, undefined, 25);
  addSummaryLine("VAT 15%", totals.vat, 11, true, 11, true, undefined, 25);
  // Total Amount: fill amount cell with yellow ARGB 'FFFFD966' and larger font
  addSummaryLine("Total Amount", totals.totalAmount, 11, true, 11, true, "FFFFD966", 30);

  // Paid / Remaining rows
  addSummaryLine("Paid Amount", null, 11, true, 11, true, undefined, 25);
  addSummaryLine("Remaining Amount (Balance)", null, 11, true, 11, false, undefined, 25);

  // --- Terms & Conditions block ---
  // spacer row
  currentRow += 1;

  sheet.mergeCells(`A${currentRow}:H${currentRow}`);
  const termsHeaderRow = sheet.getRow(currentRow);
  termsHeaderRow.getCell(1).value = "Terms & Conditions - الشروط والاحكام";
  termsHeaderRow.getCell(1).font = { name: "Arial", size: 11, bold: true };
  termsHeaderRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  termsHeaderRow.height = 25;
  currentRow++;

  // Terms text across two rows (merged A:H)
  sheet.mergeCells(`A${currentRow}:H${currentRow + 1}`);
  const termsTextRow = sheet.getRow(currentRow);
  termsTextRow.getCell(1).value =
    "This quotation is valid for 3 days from the date of sending the quotation, once approved 100% of the quotation total amount should be paid 3 days before the event.\nOnce booking is confirmed, the payment will not be refunded for any reason.";
  termsTextRow.getCell(1).font = { name: "Arial", size: 12 };
  termsTextRow.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: true };
  termsTextRow.getCell(1).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  termsTextRow.height = 40;
  currentRow += 2;

  // Ensure all columns A-H have explicit borders in the summary area / terms region (cosmetic)
  // (Optional) iterate a few rows down to make sure borders are present where needed
  // (No logo shapes attempted per extra notes)

  return workbook;
}
