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

interface MenuCategory {
  category: string;
  items: MenuRawItem[];
}
interface MenuRawItem {
  name_en: string;
  price: number;
  [key: string]: unknown;
}

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
  const [quotation, setQuotation] = useState<OrderItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [eventOrganizer, setEventOrganizer] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const flatMenu = getFlatMenuItems();
  const sources = Array.from(new Set(flatMenu.map((item) => item.source)));
  const categories = Array.from(new Set(flatMenu.filter((item) => item.source === selectedSource).map((item) => item.category)));
  const items = flatMenu.filter((item) => item.source === selectedSource && item.category === selectedCategory);

  useEffect(() => {
    setGrandTotal(quotation.reduce((sum, row) => sum + row.total, 0));
  }, [quotation]);

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
    setQuotation((prev) => [
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
    setQuotation((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    setQuotation([]);
    setGrandTotal(0);
    setError(null);
  };

  const handleDownloadExcel = async () => {
    if (quotation.length === 0) return;

    const menuData = flatMenu.map((item) => ({
      Item: item.item,
      Price: item.price,
      Source: item.source,
      Category: item.category,
    }));
    const orderData = quotation.map((row) => ({
      Item: row.item,
      Quantity: row.quantity,
      Source: row.source,
      Category: row.category,
      Price: row.price,
      Total: row.total,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Quotation Generator
          </h1>
          <p className="text-gray-600">Create professional catering quotations</p>
        </div>

        {/* Client/Event Details Card */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
            Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={clientName} 
                onChange={e => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={mobileNumber} 
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Event Organizer</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={eventOrganizer} 
                onChange={e => setEventOrganizer(e.target.value)}
                placeholder="Enter organizer name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Number of People</label>
              <input 
                type="number" 
                min={1} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={numberOfPeople} 
                onChange={e => setNumberOfPeople(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date of Event</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={eventDate} 
                onChange={e => setEventDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter event location"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
              <input 
                type="time" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300" 
                value={pickupTime} 
                onChange={e => setPickupTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Add Item Button */}
        <div className="mb-6">
          <button
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 hover:scale-105 active:scale-95 transform transition-all duration-200 font-medium"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>

        {/* Quotation Table */}
        {quotation.length > 0 && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                Quotation Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                    <th className="p-4 text-left font-semibold">Item</th>
                    <th className="p-4 text-left font-semibold">Sub Category</th>
                    <th className="p-4 text-left font-semibold">Source</th>
                    <th className="p-4 text-left font-semibold">Qty</th>
                    <th className="p-4 text-left font-semibold">Unit Price (SAR)</th>
                    <th className="p-4 text-left font-semibold">Total (SAR)</th>
                    <th className="p-4 text-center font-semibold">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b border-gray-200 hover:bg-orange-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-gray-900">{row.item}</td>
                      <td className="p-4 text-gray-700">{row.category}</td>
                      <td className="p-4 text-gray-700">{row.source}</td>
                      <td className="p-4 text-gray-900 font-medium">{row.quantity}</td>
                      <td className="p-4 text-gray-900">{row.price} SAR</td>
                      <td className="p-4 text-gray-900 font-semibold">{row.total} SAR</td>
                      <td className="p-4 text-center">
                        <button
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:scale-110 transform transition-all duration-200 flex items-center justify-center mx-auto font-bold"
                          onClick={() => handleRemoveItem(idx)}
                          aria-label={`Remove ${row.item}`}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <td colSpan={5} className="p-4 text-right font-bold text-lg">Grand Total</td>
                    <td className="p-4 font-bold text-lg">{grandTotal} SAR</td>
                    <td className="p-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 hover:scale-105 active:scale-95 transform transition-all duration-200 shadow-md"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
          <button
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 hover:scale-105 active:scale-95 transform transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleDownloadExcel}
            disabled={quotation.length === 0}
          >
            Download Excel
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-orange-200 overflow-hidden transform transition-all">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
                <h3 className="text-2xl font-bold text-white">Add Item to Quotation</h3>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Source Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="source-select" className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <select
                    id="source-select"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-orange-300"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    <option value="">Select Source</option>
                    {sources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category-select"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-orange-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={!selectedSource}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Item Name Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="item-select" className="block text-sm font-medium text-gray-700">
                    Item Name
                  </label>
                  <select
                    id="item-select"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-orange-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    disabled={!selectedCategory}
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item.item} value={item.item}>{item.item}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    id="quantity-input"
                    type="number"
                    min={1}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white hover:border-orange-300"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                <button
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:scale-105 active:scale-95 transform transition-all duration-200"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                  onClick={handleConfirmAdd}
                  disabled={!selectedItem || quantity < 1}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}