"use client";

import { useState, useEffect } from "react";
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
    // Reset form after adding
    setSelectedSource("");
    setSelectedCategory("");
    setSelectedItem("");
    setQuantity(1);
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

  const handleDownloadExcel = () => {
    if (quotation.length === 0) return;
    const menuData = menuDataRaw.categories.flatMap(c => 
      c.items.map(i => ({
        Item: i.name_en,
        Arabic: i.name_ar || "",
        Unit: i.unit || "pcs",
        Price: i.price,
        source: i.source,
        category: c.category
      }))
    );
    const orderData = quotation.map(q => ({
      Item: q.item,
      Quantity: q.quantity
    }));
    const clientInfo = {
      clientName,
      mobileNumber,
      eventOrganizer,
      numberOfPeople,
      eventDate,
      location,
      pickupTime
    };
    fetch("/api/generate-quotation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuData, orderData, clientInfo })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to generate Excel");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotation.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        setError(err.message || "Failed to download Excel");
      });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-[#a47149] via-[#a47149] to-[#a47149] pl-0 pr-0 pt-4 md:pt-8 pb-4 md:pb-8">
      {/* Full-width header bar */}
      <div className="-mr-0 -mt-4 md:-mt-8 mb-8 bg-[#5e775a] pr-0 py-6 pl-0">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 transition-colors duration-300 text-white">
              Quotation Generator
            </h1>
            <p className="transition-colors duration-300 text-white/90">
              Create professional catering quotations
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full pl-64 pr-10">

        {/* Two Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Client/Event Details Card */}
          <div className="lg:col-span-2 rounded-xl shadow-lg transition-all duration-300 p-6 md:p-8 hover:shadow-xl bg-white">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 transition-colors duration-300 text-[#3d3d3d]">
              <span className="w-1 h-6 rounded-full transition-colors duration-300 bg-[#5e775a]"></span>
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Client Name", value: clientName, setValue: setClientName, type: "text", placeholder: "Enter client name" },
                { label: "Mobile Number", value: mobileNumber, setValue: setMobileNumber, type: "text", placeholder: "Enter mobile number" },
                { label: "Event Organizer", value: eventOrganizer, setValue: setEventOrganizer, type: "text", placeholder: "Enter organizer name" },
                { label: "Number of People", value: numberOfPeople, setValue: setNumberOfPeople, type: "number", placeholder: "0" },
                { label: "Date of Event", value: eventDate, setValue: setEventDate, type: "date", placeholder: "" },
                { label: "Location", value: location, setValue: setLocation, type: "text", placeholder: "Enter event location" },
                { label: "Pickup Time", value: pickupTime, setValue: setPickupTime, type: "time", placeholder: "" }
              ].map((field, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                    {field.label}
                  </label>
                  <input 
                    type={field.type}
                    min={field.type === "number" ? 1 : undefined}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                    value={field.value} 
                    onChange={e => field.setValue(e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Add Item Card */}
          <div className="rounded-xl shadow-lg transition-all duration-300 p-6 md:p-8 hover:shadow-xl bg-white">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 transition-colors duration-300 text-[#3d3d3d]">
              <span className="w-1 h-6 rounded-full transition-colors duration-300 bg-[#5e775a]"></span>
              Add Item to Quotation
            </h2>
            <div className="space-y-5">
              {/* Source Dropdown */}
              <div className="space-y-2">
                <label htmlFor="source-select" className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Source
                </label>
                <select
                  id="source-select"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a]"
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
                <label htmlFor="category-select" className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Category
                </label>
                <select
                  id="category-select"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] disabled:bg-slate-100"
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
                <label htmlFor="item-select" className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Item Name
                </label>
                <select
                  id="item-select"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] disabled:bg-slate-100"
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
                <label htmlFor="quantity-input" className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Quantity
                </label>
                <input
                  id="quantity-input"
                  type="number"
                  min={1}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Add Button */}
              <button
                className="w-full px-6 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md bg-[#5e775a] hover:bg-[#4a5f47] text-white"
                onClick={handleConfirmAdd}
                disabled={!selectedItem || quantity < 1}
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Quotation Table */}
        <div className="mb-8 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white opacity-100 animate-fade-in">
          <div className="p-6 border-b transition-colors duration-300 border-slate-200">
            <h2 className="text-xl font-semibold flex items-center gap-2 transition-colors duration-300 text-[#3d3d3d]">
              <span className="w-1 h-6 rounded-full transition-colors duration-300 bg-[#5e775a]"></span>
              Quotation Items
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="transition-colors duration-300 bg-[#5e775a] text-white">
                  <th className="p-4 text-left font-semibold border-b border-slate-300">Item</th>
                  <th className="p-4 text-left font-semibold border-b border-slate-300">Sub Category</th>
                  <th className="p-4 text-left font-semibold border-b border-slate-300">Source</th>
                  <th className="p-4 text-left font-semibold border-b border-slate-300">Qty</th>
                  <th className="p-4 text-left font-semibold border-b border-slate-300">Unit Price (SAR)</th>
                  <th className="p-4 text-left font-semibold border-b border-slate-300">Total (SAR)</th>
                  <th className="p-4 text-center font-semibold border-b border-slate-300">Remove</th>
                </tr>
              </thead>
              <tbody>
                {quotation.length > 0 ? (
                  quotation.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b transition-colors duration-150 border-slate-200 hover:bg-[#f9f9f9]"
                    >
                      <td className="p-4 transition-colors duration-300 text-[#3d3d3d]">{row.item}</td>
                      <td className="p-4 transition-colors duration-300 text-[#666666]">{row.category}</td>
                      <td className="p-4 transition-colors duration-300 text-[#666666]">{row.source}</td>
                      <td className="p-4 font-medium transition-colors duration-300 text-[#3d3d3d]">{row.quantity}</td>
                      <td className="p-4 transition-colors duration-300 text-[#3d3d3d]">{row.price} SAR</td>
                      <td className="p-4 font-semibold transition-colors duration-300 text-[#3d3d3d]">{row.total} SAR</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">No items in the quotation</td>
                  </tr>
                )}
                <tr className="transition-colors duration-300 bg-[#5e775a] text-white">
                  <td colSpan={5} className="p-4 text-right font-bold text-lg border-t border-slate-300">Grand Total</td>
                  <td className="p-4 font-bold text-lg border-t border-slate-300">{grandTotal} SAR</td>
                  <td className="p-4 border-t border-slate-300"></td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Action Buttons inside the table card */}
          <div className="p-6 border-t flex flex-wrap gap-3 justify-end border-slate-200">
            <button
              className="px-6 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 shadow-md bg-[#a47149] text-white hover:bg-[#8b5d3e]"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
            <button
              className="px-6 py-3 rounded-lg shadow-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-[#5e775a] hover:bg-[#4a5f47] text-white"
              onClick={handleDownloadExcel}
              disabled={quotation.length === 0}
            >
              Download Excel
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-medium animate-fadeIn">
            {error}
          </div>
        )}


      </div>
    </div>
  );
}