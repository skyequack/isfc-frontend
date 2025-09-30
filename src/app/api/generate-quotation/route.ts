import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

interface MenuRow {
  Item: string;
  Arabic?: string;
  Unit?: string;
  Price: number;
}

interface OrderRow {
  Item: string;
  Quantity: number;
}

interface ProcessedItem {
  item: string;
  arabicName: string;
  unit: string;
  pricePerUnit: number;
  qty: number;
  total: number;
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

    // Match order with menu
    const items: ProcessedItem[] = orderData.map((row: OrderRow) => {
      const itemName = row.Item;
      const quantity = row.Quantity;

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
        total: price * quantity,
      };
    });

    // Compute totals
    const totalExcludeVAT = items.reduce((sum, r) => sum + r.total, 0);
    const vat = totalExcludeVAT * 0.15;
    const totalAmount = totalExcludeVAT + vat;

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare header rows with labels and values separated
    const headerRows = [
      ["QUOTATION"], // Title
      [],
      ["Client Name:", clientInfo?.clientName || ""],
      ["Mobile Number:", clientInfo?.mobileNumber || ""],
      ["Event Organizer:", clientInfo?.eventOrganizer || ""],
      ["Number of People:", clientInfo?.numberOfPeople || ""],
      ["Date of Event:", clientInfo?.eventDate || ""],
      ["Location:", clientInfo?.location || ""],
      ["Pickup Time:", clientInfo?.pickupTime || ""],
      [], // blank row before table
    ];

    // Table header (without Arabic Name and Unit)
    const tableHeader = [
      "Item Name",
      "Price per Unit",
      "Quantity",
      "Total Price"
    ];

    const tableRows = items.map(item => [
      item.item,
      item.pricePerUnit,
      item.qty,
      item.total
    ]);

    // Summary rows
    const summaryRows = [
      [],
      ["Total Exclude VAT", "", "", totalExcludeVAT],
      ["VAT 15%", "", "", vat],
      ["Total Amount", "", "", totalAmount],
      [],
      ["Paid Amount", "", "", ""],
      ["Remaining Amount (Balance)", "", "", ""]
    ];

    // Combine all rows
    const sheetRows = [
      ...headerRows,
      tableHeader,
      ...tableRows,
      ...summaryRows
    ];

    const itemsSheet = XLSX.utils.aoa_to_sheet(sheetRows);

    // Column widths
    itemsSheet["!cols"] = [
      { wch: 30 }, // Item Name
      { wch: 18 }, // Price per unit
      { wch: 12 }, // Quantity
      { wch: 18 }  // Total Price
    ];

    // Apply styling
    const range = XLSX.utils.decode_range(itemsSheet["!ref"] || "A1");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!itemsSheet[cellAddress]) continue;

        // Initialize cell style
        if (!itemsSheet[cellAddress].s) itemsSheet[cellAddress].s = {};

        // Title row (QUOTATION)
        if (R === 0) {
          itemsSheet[cellAddress].s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }

        // Client info labels (rows 2-8, column A)
        if (R >= 2 && R <= 8 && C === 0) {
          itemsSheet[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }

        // Table header row
        if (R === 10) {
          itemsSheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E0E0E0" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" }
            }
          };
        }

        // Table data rows
        if (R > 10 && R <= 10 + items.length) {
          itemsSheet[cellAddress].s = {
            alignment: { horizontal: C === 0 ? "left" : "center", vertical: "center" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" }
            }
          };
        }

        // Summary rows - bold labels in first column
        const summaryStartRow = 10 + items.length + 2;
        if (R >= summaryStartRow && C === 0) {
          itemsSheet[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }

        // Total Amount row - make it more prominent
        if (R === summaryStartRow + 2) {
          itemsSheet[cellAddress].s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: "FFD966" } },
            alignment: { horizontal: C === 0 ? "left" : "center", vertical: "center" }
          };
        }
      }
    }

    // Merge title cell
    itemsSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Order Summary");

    // Add Menu Reference sheet
    const menuSheet = XLSX.utils.json_to_sheet(menuData);
    XLSX.utils.book_append_sheet(workbook, menuSheet, "Menu Reference");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    return new Response(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="quotation.xlsx"',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to generate quotation" },
      { status: 500 }
    );
  }
}