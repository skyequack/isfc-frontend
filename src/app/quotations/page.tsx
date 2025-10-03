"use client";

import { useState, useEffect } from "react";
import menuDataRaw from "../../../menu.json";
import OrderCard from "@/components/menu/OrderCard";

interface MenuItem {
  item: string;
  price: number;
  source: string;
  category: string;
  name_en: string;
  name_ar: string;
  unit: string;
  rating?: string;
  description: string;
  prepTime: string;
  ingredients: string[];
  allergens: string[];
  dietary: string[];
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
        name_en: i.name_en,
        name_ar: typeof i.name_ar === "string" ? i.name_ar : "",
        price: i.price,
        unit: typeof i.unit === "string" ? i.unit : "",
        source: typeof i.source === "string" ? i.source : "",
        category: cat.category,
        rating: typeof i.rating === "string" ? i.rating : undefined,
        description: typeof i.description === "string" ? i.description : "",
        prepTime: typeof i.prepTime === "string" ? i.prepTime : "",
        ingredients: Array.isArray(i.ingredients) ? i.ingredients : [],
        allergens: Array.isArray(i.allergens) ? i.allergens : [],
        dietary: Array.isArray(i.dietary) ? i.dietary : []
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});

  const [clientName, setClientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [eventOrganizer, setEventOrganizer] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const [excelData, setExcelData] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const flatMenu = getFlatMenuItems();
  const categories = Array.from(new Set(flatMenu.map((item) => item.category)));
  const items = flatMenu.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    setGrandTotal(quotation.reduce((sum, row) => sum + row.total, 0));
  }, [quotation]);

  useEffect(() => {
    setSelectedCategory("");
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddItem = (menuItem: MenuItem) => {
    const quantity = itemQuantities[menuItem.item] || 1;
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
    setItemQuantities((prev) => ({ ...prev, [menuItem.item]: 1 }));
    setError(null);
  };

  const handleQuantityChange = (itemName: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemName] || 1;
      const newValue = Math.max(1, current + delta);
      return { ...prev, [itemName]: newValue };
    });
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

  const handlePreviewExcel = async () => {
    try {
      const res = await fetch("/api/generate-quotation", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate Excel");
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        setExcelData(e.target?.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to preview Excel";
      setError(errorMessage);
    }
  };

  const handleInfoClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsModalClosing(false);
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedItem(null);
      setIsModalClosing(false);
    }, 300);
  };

  const errorClass = error ? "opacity-100 transition-opacity duration-500" : "opacity-0 transition-opacity duration-500";

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
              Create catering quotations
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full pl-64 pr-10">

        {/* Two Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Event Details Card */}
          <div className="rounded-xl shadow-lg transition-all duration-300 p-6 md:p-8 hover:shadow-xl bg-white">
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

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label htmlFor="category-select" className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Select Category
                </label>
                <select
                  id="category-select"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Food Cards Scrollable Area */}
              {selectedCategory && items.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                      Menu Items
                    </label>
                    <span className="text-xs text-slate-500">Scroll to see more</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {items.map((item) => {
                      const quantity = itemQuantities[item.item] || 1;
                      return (
                        <div
                          key={item.item}
                          className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-white"
                        >
                          <div className="flex items-start gap-3">
                            {/* Placeholder for image */}
                            <div className="relative">
                              <div className="w-30 h-25 rounded-lg bg-gradient-to-br from-[#5e775a] to-[#4a5f47] flex-shrink-0 flex items-center justify-center text-white text-xs font-medium">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <button
                                onClick={() => handleInfoClick(item)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white text-[#5e775a] hover:bg-[#5e775a] hover:text-white flex items-center justify-center shadow-md"
                              >
                                i
                              </button>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm text-[#3d3d3d] leading-tight mb-1">
                                    {item.item}
                                  </h3>
                                  <p className="text-xs text-slate-500">{item.source}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm font-bold text-[#5e775a]">SAR {item.price}</div>
                                  <div className="text-xs text-slate-500">Per pax</div>
                                </div>
                              </div>
                              <hr className="my-2 border-t border-slate-200" />

                              <div className="flex items-center justify-between gap-2 mt-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1">
                                  <button
                                    onClick={() => handleQuantityChange(item.item, -1)}
                                    className="w-6 h-6 rounded flex items-center justify-center bg-white text-[#5e775a] hover:bg-[#5e775a] hover:text-white transition-all duration-200 font-bold"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center font-semibold text-sm text-[#3d3d3d]">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item.item, 1)}
                                    className="w-6 h-6 rounded flex items-center justify-center bg-white text-[#5e775a] hover:bg-[#5e775a] hover:text-white transition-all duration-200 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                {/* Add Button */}
                                <button
                                  onClick={() => handleAddItem(item)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[#5e775a] hover:bg-[#4a5f47] focus:outline-none focus:ring-2 focus:ring-green-400"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCategory && items.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No items available in this category
                </div>
              )}
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

        {/* Excel Preview Pane */}
        <div className="mt-6">
          <button
            className="px-6 py-3 rounded-lg shadow-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 bg-[#5e775a] hover:bg-[#4a5f47] text-white"
            onClick={handlePreviewExcel}
          >
            Preview Excel
          </button>
          {excelData && (
            <iframe
              src={excelData}
              className="w-full h-96 mt-4 border border-gray-300 rounded-lg"
              title="Excel Preview"
            ></iframe>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-medium animate-fadeIn ${errorClass}`}>
            {error}
          </div>
        )}
      </div>

      {/* Item Info Modal */}
      {isModalOpen && selectedItem && (
        <div 
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${
            isModalClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={closeModal}
        >
          <div 
            className={isModalClosing ? 'animate-scaleOut' : 'animate-scaleIn'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <OrderCard
                name_en={selectedItem.name_en}
                name_ar={selectedItem.name_ar}
                source={selectedItem.source}
                price={selectedItem.price}
                unit={selectedItem.unit}
                rating={selectedItem.rating}
                description={selectedItem.description}
                prepTime={selectedItem.prepTime}
                ingredients={selectedItem.ingredients}
                allergens={selectedItem.allergens}
                dietary={selectedItem.dietary}
              />
              <button
                onClick={closeModal}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-400 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5e775a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4a5f47;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-fadeOut {
          animation: fadeOut 0.2s ease-in;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-scaleOut {
          animation: scaleOut 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}