"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

// Mock menu data structure
const menuDataRaw = {
  categories: [
    {
      category: "Main Course",
      items: [
        { name_en: "Grilled Chicken", price: 45, source: "Kitchen A" },
        { name_en: "Beef Steak", price: 65, source: "Kitchen A" },
        { name_en: "Fish Fillet", price: 55, source: "Kitchen B" }
      ]
    },
    {
      category: "Appetizers",
      items: [
        { name_en: "Caesar Salad", price: 25, source: "Kitchen A" },
        { name_en: "Soup", price: 20, source: "Kitchen B" }
      ]
    },
    {
      category: "Desserts",
      items: [
        { name_en: "Chocolate Cake", price: 30, source: "Kitchen A" },
        { name_en: "Ice Cream", price: 15, source: "Kitchen B" }
      ]
    }
  ]
};

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
  const [darkMode, setDarkMode] = useState(false);
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

  const handleDownloadExcel = () => {
    if (quotation.length === 0) return;
    alert("Excel download would trigger here in production");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    } p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Dark Mode Toggle */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-2 transition-colors duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
            }`}>
              Quotation Generator
            </h1>
            <p className={`transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Create professional catering quotations
            </p>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl shadow-lg hover:scale-110 active:scale-95 transform transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                : 'bg-white hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Client/Event Details Card */}
        <div className={`mb-8 rounded-2xl shadow-lg border transition-all duration-300 p-6 md:p-8 hover:shadow-xl ${
          darkMode 
            ? 'bg-slate-800/50 backdrop-blur-sm border-slate-700' 
            : 'bg-white/80 backdrop-blur-sm border-slate-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 transition-colors duration-300 ${
            darkMode ? 'text-slate-100' : 'text-slate-800'
          }`}>
            <span className={`w-1 h-6 rounded-full transition-colors duration-300 ${
              darkMode 
                ? 'bg-gradient-to-b from-blue-400 to-indigo-400' 
                : 'bg-gradient-to-b from-blue-500 to-indigo-500'
            }`}></span>
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
                <label className={`block text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {field.label}
                </label>
                <input 
                  type={field.type}
                  min={field.type === "number" ? 1 : undefined}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400 hover:border-blue-400 placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 hover:border-blue-400 placeholder-slate-400'
                  }`}
                  value={field.value} 
                  onChange={e => field.setValue(e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Add Item Button */}
        <div className="mb-6">
          <button
            className={`px-6 py-3 rounded-lg shadow-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 ${
              darkMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
            }`}
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>

        {/* Quotation Table */}
        {quotation.length > 0 && (
          <div className={`mb-8 rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/50 backdrop-blur-sm border-slate-700' 
              : 'bg-white/80 backdrop-blur-sm border-slate-200'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h2 className={`text-xl font-semibold flex items-center gap-2 transition-colors duration-300 ${
                darkMode ? 'text-slate-100' : 'text-slate-800'
              }`}>
                <span className={`w-1 h-6 rounded-full transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-b from-blue-400 to-indigo-400' 
                    : 'bg-gradient-to-b from-blue-500 to-indigo-500'
                }`}></span>
                Quotation Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  }`}>
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
                      className={`border-b transition-colors duration-150 ${
                        darkMode 
                          ? 'border-slate-700 hover:bg-slate-700/50' 
                          : 'border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      <td className={`p-4 transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{row.item}</td>
                      <td className={`p-4 transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.category}</td>
                      <td className={`p-4 transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.source}</td>
                      <td className={`p-4 font-medium transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{row.quantity}</td>
                      <td className={`p-4 transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{row.price} SAR</td>
                      <td className={`p-4 font-semibold transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{row.total} SAR</td>
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
                  <tr className={`transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  }`}>
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
            className={`px-6 py-3 rounded-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 shadow-md ${
              darkMode 
                ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' 
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
          <button
            className={`px-6 py-3 rounded-lg shadow-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              darkMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
            }`}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden transform transition-all ${
              darkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`p-6 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                <h3 className="text-2xl font-bold text-white">Add Item to Quotation</h3>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Source Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="source-select" className={`block text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Source
                  </label>
                  <select
                    id="source-select"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400 hover:border-blue-400' 
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 hover:border-blue-400'
                    }`}
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
                  <label htmlFor="category-select" className={`block text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Category
                  </label>
                  <select
                    id="category-select"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400 hover:border-blue-400 disabled:bg-slate-800' 
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 hover:border-blue-400 disabled:bg-slate-100'
                    }`}
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
                  <label htmlFor="item-select" className={`block text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Item Name
                  </label>
                  <select
                    id="item-select"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400 hover:border-blue-400 disabled:bg-slate-800' 
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 hover:border-blue-400 disabled:bg-slate-100'
                    }`}
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
                  <label htmlFor="quantity-input" className={`block text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Quantity
                  </label>
                  <input
                    id="quantity-input"
                    type="number"
                    min={1}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400 hover:border-blue-400 placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-500 hover:border-blue-400 placeholder-slate-400'
                    }`}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className={`p-6 flex justify-end gap-3 border-t transition-colors duration-300 ${
                darkMode 
                  ? 'bg-slate-900/50 border-slate-700' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <button
                  className={`px-6 py-2.5 rounded-lg border font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 ${
                    darkMode 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2.5 rounded-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                  }`}
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