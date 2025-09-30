
"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import menuDataRaw from "../../../menu.json";


interface MenuItem {
  item: string;
  price: number;
  source: string;
  category: string;
}

// Types for menu.json structure
interface MenuCategory {
  category: string;
  items: MenuRawItem[];
}
interface MenuRawItem {
  name_en: string;
  price: number;
  [key: string]: unknown;
}

// Flatten menu items from all categories in menu.json
function getFlatMenuItems(): MenuItem[] {
  if (!menuDataRaw || !Array.isArray(menuDataRaw.categories)) return [];
  return (menuDataRaw.categories as MenuCategory[]).flatMap((cat: MenuCategory) =>
    (cat.items || [])
      .filter((i: MenuRawItem) => typeof i.name_en === "string" && typeof i.price === "number")
      .map((i: MenuRawItem) => ({
        item: i.name_en,
        price: i.price,
        source: typeof i.source === "string" ? i.source : "",
        category: cat.category
      }))
  );
}

interface OrderItem {
  item: string;
  quantity: number;
  price: number;
  total: number;
  source: string;
  category: string;
}

export default function QuotationPage() {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [quotation, setQuotation] = useState<OrderItem[] | null>(null);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Client/Event details state
  const [clientName, setClientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [eventOrganizer, setEventOrganizer] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  // Prepare menu data for dropdowns
  const flatMenu = getFlatMenuItems();
  const sources = Array.from(new Set(flatMenu.map((item) => item.source)));
  const categories = Array.from(new Set(flatMenu.filter((item) => item.source === selectedSource).map((item) => item.category)));
  const items = flatMenu.filter((item) => item.source === selectedSource && item.category === selectedCategory);

  useEffect(() => {
    if (quotation) {
      setGrandTotal(quotation.reduce((sum, row) => sum + row.total, 0));
    }
  }, [quotation]);

  // Reset dependent dropdowns when source/category changes
  useEffect(() => {
    setSelectedCategory("");
    setSelectedItem("");
  }, [selectedSource]);
  useEffect(() => {
    setSelectedItem("");
  }, [selectedCategory]);

  const handleAddItem = () => {
    setSelectedSource("");
    setSelectedCategory("");
    setSelectedItem("");
    setQuantity(1);
    setShowModal(true);
  };

  const handleConfirmAdd = () => {
    const menuItem = items.find((m) => m.item === selectedItem);
    if (!menuItem) {
      setError("Invalid item selected.");
      return;
    }
    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    setOrder((prev) => [
      ...prev,
      {
        item: menuItem.item,
        quantity,
        price: menuItem.price,
        total: menuItem.price * quantity,
        source: menuItem.source,
        category: menuItem.category,
      },
    ]);
    setShowModal(false);
    setError(null);
  };

  const handleRemoveItem = (idx: number) => {
    setOrder((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerateQuotation = () => {
    if (order.length === 0) {
      setError("Add at least one item to the order.");
      return;
    }
    setQuotation(order);
    setError(null);
  };

  const handleReset = () => {
    setOrder([]);
    setQuotation(null);
    setGrandTotal(0);
    setError(null);
  };

  // Download Excel from API
  const handleDownloadExcel = async () => {
    if (!quotation || quotation.length === 0) return;

    // Prepare menuData, orderData, and clientInfo for API
    const menuData = flatMenu.map((item) => ({
      Item: item.item,
      Price: item.price,
      Source: item.source,
      Category: item.category,
    }));
    const orderData = quotation.map((row) => ({
      Item: row.item,
      Quantity: row.quantity,
    }));
    const clientInfo = {
      clientName,
      mobileNumber,
      eventOrganizer,
      numberOfPeople,
      eventDate,
      location,
      pickupTime,
    };

    try {
      const response = await fetch("/api/generate-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menuData, orderData, clientInfo }),
      });
      if (!response.ok) throw new Error("Failed to generate Excel file");
      const blob = await response.blob();
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Quotation.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel file download failed:", err);
      setError("Failed to download Excel file.");
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-4 text-orange-900">Quotation Generator</h1>

      {/* Client/Event Details */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg border border-orange-300">
        <div>
          <label className="block font-medium mb-1 text-orange-900">Client Name:</label>
          <input type="text" className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1 text-orange-900">Mobile Number:</label>
          <input type="text" className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1 text-orange-900">Event Organizer:</label>
          <input type="text" className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={eventOrganizer} onChange={e => setEventOrganizer(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1 text-orange-900">Number of People:</label>
          <input type="number" min={1} className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={numberOfPeople} onChange={e => setNumberOfPeople(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1 text-orange-900">Date of Event:</label>
          <input type="date" className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={eventDate} onChange={e => setEventDate(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1 text-orange-900">Location:</label>
          <input type="text" className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1 text-orange-900">Pickup Time:</label>
          <input type="time" className="w-full border border-orange-400 rounded px-3 py-2 text-black" value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded shadow"
          onClick={handleAddItem}
        >
          + Add Item
        </button>
      </div>

      {order.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-orange-800">Current Order</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-800 text-white">
                <th className="border border-orange-400 p-2">Item</th>
                <th className="border border-orange-400 p-2">Qty</th>
                <th className="border border-orange-400 p-2">Unit Price (SAR)</th>
                <th className="border border-orange-400 p-2">Total (SAR)</th>
                <th className="border border-orange-400 p-2">Remove</th>
              </tr>
            </thead>
            <tbody>
              {order.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-orange-50" : "bg-white"}>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.item}</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.quantity}</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.price} SAR</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.total} SAR</td>
                  <td className="border border-orange-200 p-2 text-center">
                    <button
                      className="text-red-700 font-bold hover:bg-red-100 rounded px-2"
                      onClick={() => handleRemoveItem(idx)}
                      aria-label={`Remove ${row.item}`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleGenerateQuotation}
          disabled={order.length === 0}
        >
          Generate Quotation
        </button>
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded shadow disabled:opacity-50"
          onClick={handleDownloadExcel}
          disabled={!quotation || quotation.length === 0}
        >
          Download Excel
        </button>
      </div>

      {error && (
        <div className="mt-4 text-red-600 font-medium">{error}</div>
      )}

      {/* Modal for adding item */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border-2 border-orange-700">
            <h3 className="text-2xl font-semibold mb-6 text-orange-700 text-center">Add Item</h3>
            {/* Source Dropdown */}
            <div className="mb-4">
              <label htmlFor="source-select" className="block mb-2 font-medium text-black">Source</label>
              <select
                id="source-select"
                className="w-full border border-orange-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option value="">-- Select Source --</option>
                {sources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            {/* Category Dropdown */}
            <div className="mb-4">
              <label htmlFor="category-select" className="block mb-2 font-medium text-black">Category</label>
              <select
                id="category-select"
                className="w-full border border-orange-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedSource}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {/* Item Name Dropdown */}
            <div className="mb-4">
              <label htmlFor="item-select" className="block mb-2 font-medium text-black">Item Name</label>
              <select
                id="item-select"
                className="w-full border border-orange-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">-- Select Item --</option>
                {items.map((item) => (
                  <option key={item.item} value={item.item}>{item.item}</option>
                ))}
              </select>
            </div>
            {/* Quantity Input */}
            <div className="mb-6">
              <label htmlFor="quantity-input" className="block mb-2 font-medium text-black">Quantity</label>
              <input
                id="quantity-input"
                type="number"
                min={1}
                className="w-full border border-orange-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-100"
                onClick={() => setShowModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-50"
                onClick={handleConfirmAdd}
                disabled={!selectedItem || quantity < 1}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation display */}
      {quotation && (
        <div className="mt-6 border-2 border-orange-700 p-4 rounded bg-white shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-orange-800">Quotation</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-800 text-white">
                <th className="border border-orange-400 p-2">Item</th>
                <th className="border border-orange-400 p-2">Sub Category</th>
                <th className="border border-orange-400 p-2">Source</th>
                <th className="border border-orange-400 p-2">Qty</th>
                <th className="border border-orange-400 p-2">Unit Price (SAR)</th>
                <th className="border border-orange-400 p-2">Total (SAR)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-orange-50" : "bg-white"}>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.item}</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.category}</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.source}</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.quantity}</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.price} SAR</td>
                  <td className="border border-orange-200 p-2 text-gray-900">{row.total} SAR</td>
                </tr>
              ))}
              <tr className="bg-orange-100">
                <td colSpan={5} className="border border-orange-300 p-2 text-right font-bold text-orange-800">Grand Total</td>
                <td className="border border-orange-300 p-2 font-bold text-orange-900">{grandTotal} SAR</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}