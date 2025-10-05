"use client";

import { useState, useEffect, useCallback } from "react";
import menuDataRaw from "../../../menu.json";
import OrderCard from "@/components/menu/OrderCard";
import QuotationPreview from "@/components/QuotationPreview";
import MenuItemCard from "@/components/menu/MenuItemCard";
import { useSidebar } from "@/components/Navigation/Navigation";

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
  const { isVisible: isSidebarVisible, isPinned } = useSidebar();
  const [quotation, setQuotation] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Dynamic padding based on sidebar visibility (including pinned state) with smooth transitions
  const shouldShowSidebar = isSidebarVisible || isPinned;
  const containerClass = `w-full pr-10 transition-all duration-300 ease-out ${shouldShowSidebar ? "pl-64" : "pl-10"}`;
  const [selectedSource, setSelectedSource] = useState<string>("360G");
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  
  // Carousel state for switching between item selection and quotation view
  const [currentCarouselView, setCurrentCarouselView] = useState<'items' | 'quotation'>('items');

  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [eventOrganizer, setEventOrganizer] = useState("");
  const [customEventOrganizer, setCustomEventOrganizer] = useState("");
  const [eventType, setEventType] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [validityDays, setValidityDays] = useState("14");
  const [referenceCode, setReferenceCode] = useState("");
  const [brandCode, setBrandCode] = useState("ISFC");

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  
  // Event organizer options
  const eventOrganizers = [
    "Select Organizer",
    "Batoul Bassam",
    "Said Chouaki",
    "Mohammad Al-Hawamdeh",
    "Custom"
  ];
  
  // Event type options
  const eventTypes = [
    "Select Event Type",
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Conference",
    "Exhibition",
    "Gala Dinner",
    "Product Launch",
    "Other"
  ];

  const flatMenu = getFlatMenuItems();

  const generateReferenceCode = useCallback(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const code = `${brandCode}-${year}-${randomNum}`;
    setReferenceCode(code);
  }, [brandCode]);

  useEffect(() => {
    setGrandTotal(quotation.reduce((sum, row) => sum + row.total, 0));
  }, [quotation]);

  useEffect(() => {
    setSelectedCategory("");
    // Generate reference code on mount
    generateReferenceCode();
  }, [generateReferenceCode]);

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
        description: i.description || "",
        source: i.source,
        category: c.category
      }))
    );
    const orderData = quotation.map(q => ({
      Item: q.item,
      Quantity: q.quantity
    }));
    const finalEventOrganizer = eventOrganizer === "Custom" ? customEventOrganizer : eventOrganizer;
    const clientInfo = {
      clientName,
      clientContact,
      eventOrganizer: finalEventOrganizer,
      eventType,
      numberOfPeople,
      eventDate,
      eventTime,
      location,
      validityDays,
      referenceCode
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
        a.download = `${referenceCode}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        setError(err.message || "Failed to download Excel");
      });
  };

  const handleInfoClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsModalClosing(false);
  };

  const closeModal = () => {
    setIsModalClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isModalClosing) {
      setIsModalOpen(false);
      setSelectedItem(null);
      setIsModalClosing(false);
    }
  };

  const errorClass = error ? "opacity-100 transition-opacity duration-500" : "opacity-0 transition-opacity duration-500";

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-[#a47149] via-[#a47149] to-[#a47149] pl-0 pr-0 pt-4 md:pt-8 pb-4 md:pb-8">
      {/* Full-width header bar */}
      <div className="-mr-0 -mt-4 md:-mt-8 mb-8 bg-[#5e775a] pr-0 py-6 pl-0">
        <div className={containerClass}>
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
      
      <div className={containerClass}>

        {/* Three Card Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Event Details Card - Takes 3 columns */}
          <div className="xl:col-span-3 h-fit rounded-xl shadow-lg transition-all duration-300 p-6 hover:shadow-xl bg-white">
            <h2 className="text-xl font-semibold mb-6 my-3 flex items-center gap-2 transition-colors duration-300 text-[#3d3d3d]">
              <span className="w-1 h-6 rounded-full transition-colors duration-300 bg-[#5e775a]"></span>
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Client Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Client Name
                </label>
                <input 
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>

              {/* Client Contact */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Client Contact
                </label>
                <input 
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={clientContact} 
                  onChange={e => setClientContact(e.target.value)}
                  placeholder="Enter contact number/email"
                />
              </div>

              {/* Event Organizer - Dropdown with Custom option */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Event Organizer
                </label>
                <select
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a]"
                  value={eventOrganizer}
                  onChange={e => setEventOrganizer(e.target.value)}
                >
                  {eventOrganizers.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              {/* Custom Event Organizer - Show only if "Custom" is selected */}
              {eventOrganizer === "Custom" && (
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                    Custom Organizer Name
                  </label>
                  <input 
                    type="text"
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                    value={customEventOrganizer} 
                    onChange={e => setCustomEventOrganizer(e.target.value)}
                    placeholder="Enter organizer name"
                  />
                </div>
              )}

              {/* Event Type - Dropdown */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Event Type
                </label>
                <select
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a]"
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Number of People */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Number of People
                </label>
                <input 
                  type="number"
                  min={1}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={numberOfPeople} 
                  onChange={e => setNumberOfPeople(e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Event Date
                </label>
                <input 
                  type="date"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={eventDate} 
                  onChange={e => setEventDate(e.target.value)}
                />
              </div>

              {/* Event Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Event Time
                </label>
                <input 
                  type="time"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={eventTime} 
                  onChange={e => setEventTime(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Location
                </label>
                <input 
                  type="text"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter event location"
                />
              </div>
              {/* Validity Days */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Validity (Days)
                </label>
                <input 
                  type="number"
                  min={1}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] placeholder-slate-400"
                  value={validityDays} 
                  onChange={e => setValidityDays(e.target.value)}
                  placeholder="14"
                />
              </div>
            </div>
          </div>

          {/* Add Item to Quotation Carousel - Takes 6 columns */}
          <div className="xl:col-span-5 w-full max-w mx-auto">
            {/* White Card Container */}
            <div className="bg-white rounded-xl shadow-lg transition-all duration-300 p-6 md:p-8 hover:shadow-xl">
              {/* Header Section */}
              <header className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 transition-colors duration-300 text-[#3d3d3d]">
                  <span className="w-1 h-6 rounded-full transition-colors duration-300 bg-[#5e775a]"></span>
                  {currentCarouselView === 'items' ? 'Add Item to Quotation' : 'Quotation Items'}
                </h2>
                {currentCarouselView === 'items' ? (
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#6B8E6F] hover:bg-[#5a7a5e] text-white font-bold text-sm uppercase rounded-lg transition-colors duration-200"
                    onClick={() => setCurrentCarouselView('quotation')}
                  >
                    NEXT
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#a47149] hover:bg-[#8b5d3f] text-white font-bold text-sm uppercase rounded-lg transition-colors duration-200"
                    onClick={() => setCurrentCarouselView('items')}
                  >
                    BACK
                  </button>
                )}
              </header>

              {/* Carousel Content */}
              {currentCarouselView === 'items' ? (
                // Item Selection View
                <div className="animate-fadeIn">
                  {/* Source Dropdown Section */}
                  <div className="space-y-2">
                <label htmlFor="source-select" className="block text-sm font-medium transition-colors duration-300 text-[#3d3d3d]">
                  Source
                </label>
                <div className="relative">
                  <select
                    id="source-select"
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-transparent transition-all duration-200 bg-white border-slate-300 text-[#3d3d3d] focus:ring-[#5e775a] focus:ring-opacity-50 hover:border-[#5e775a] appearance-none cursor-pointer"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    <option value="">Select Source</option>
                    <option value="360G">360G</option>
                    <option value="ISFC">ISFC</option>
                    <option value="DW">DW</option>
                  </select>
                  {/* Chevron Down Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Green Category Section */}
              <div className="bg-[#6B8E6F] rounded-2xl p-6 mt-6">
                {/* Category Selector */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="category-select" className="block text-sm font-medium text-white">
                    Select Category
                  </label>
                  <div className="relative">
                    <select
                      id="category-select"
                      className="w-full bg-white rounded-xl px-4 py-4 text-[#4A4A4A] appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 cursor-pointer"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {Array.from(new Set(flatMenu.map(item => item.category))).sort().map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {/* Chevron Down Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Scrollable Menu Area */}
                {selectedSource && (() => {
                  const filteredItems = flatMenu.filter(
                    item => item.source === selectedSource && (selectedCategory === "" || item.category === selectedCategory)
                  );
                  
                  if (filteredItems.length === 0) {
                    return (
                      <div className="text-center py-8 text-white/70">
                        <p>No items found{selectedCategory ? ' for this category' : ''}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 menu-scrollbar">
                      {filteredItems.map((item) => (
                        <MenuItemCard
                          key={item.item}
                          name={item.name_en}
                          source={item.source}
                          category={item.category}
                          price={item.price}
                          unit={item.unit}
                          rating={item.rating}
                          description={item.description}
                          imageUrl={undefined}
                          quantity={itemQuantities[item.item] || 1}
                          onQuantityChange={(delta) => handleQuantityChange(item.item, delta)}
                          onAdd={() => handleAddItem(item)}
                          onMoreInfo={() => handleInfoClick(item)}
                        />
                      ))}
                    </div>
                  );
                })()}
                  </div>
                </div>
              ) : (
                // Quotation Items View - Full Table Implementation
                <div className="space-y-4 animate-fadeIn">
                  {/* Brand Code and Reference Code */}
                  <div className="flex gap-4 mb-6">
                    {/* Brand Code */}
                    <div className="space-y-2 min-w-[120px]">
                      <label className="block text-sm font-medium text-[#3d3d3d]">
                        Brand Code
                      </label>
                      <select
                        className="w-full border rounded-lg px-4 py-2.5 bg-white border-slate-300 text-[#3d3d3d] text-sm focus:ring-2 focus:ring-[#5e775a] focus:border-transparent transition-all duration-200"
                        value={brandCode}
                        onChange={e => {
                          setBrandCode(e.target.value);
                          generateReferenceCode();
                        }}
                      >
                        <option value="ISFC">ISFC</option>
                        <option value="G360">G360</option>
                        <option value="DW">DW</option>
                      </select>
                    </div>

                    {/* Reference Code */}
                    <div className="space-y-2 flex-1">
                      <label className="block text-sm font-medium text-[#3d3d3d]">
                        Reference Code
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 border rounded-lg px-4 py-2.5 bg-slate-50 border-slate-300 text-[#3d3d3d] text-sm"
                          value={referenceCode} 
                          readOnly
                        />
                        <button
                          onClick={generateReferenceCode}
                          className="px-3 py-3 rounded-lg bg-[#5e775a] text-white hover:bg-[#4a5f47] transition-colors text-sm flex-shrink-0"
                          type="button"
                          title="Regenerate code"
                        >
                          ↻
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quotation Items Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#5e775a] text-white">
                          <th className="p-3 text-left font-semibold text-sm">Item</th>
                          <th className="p-3 text-left font-semibold text-sm">Sub Category</th>
                          <th className="p-3 text-left font-semibold text-sm">Source</th>
                          <th className="p-3 text-left font-semibold text-sm">Qty</th>
                          <th className="p-3 text-left font-semibold text-sm">Unit Price (SAR)</th>
                          <th className="p-3 text-left font-semibold text-sm">Total (SAR)</th>
                          <th className="p-3 text-center font-semibold text-sm">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.length > 0 ? (
                          quotation.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className="border-b border-slate-200 hover:bg-[#f9f9f9] transition-colors duration-150"
                            >
                              <td className="p-3 text-[#3d3d3d] text-sm">{row.item}</td>
                              <td className="p-3 text-[#666666] text-sm">{row.category}</td>
                              <td className="p-3 text-[#666666] text-sm">{row.source}</td>
                              <td className="p-3 font-medium text-[#3d3d3d] text-sm">{row.quantity}</td>
                              <td className="p-3 text-[#3d3d3d] text-sm">{row.price} SAR</td>
                              <td className="p-3 font-semibold text-[#3d3d3d] text-sm">{row.total} SAR</td>
                              <td className="p-3 text-center">
                                <button
                                  className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:scale-110 transform transition-all duration-200 flex items-center justify-center mx-auto text-xs font-bold"
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
                            <td colSpan={7} className="p-6 text-center text-gray-500">No items in the quotation</td>
                          </tr>
                        )}
                        {quotation.length > 0 && (
                          <tr className="bg-[#5e775a] text-white">
                            <td colSpan={5} className="p-3 text-right font-bold text-sm border-t border-slate-300">Grand Total</td>
                            <td className="p-3 font-bold text-sm border-t border-slate-300">{grandTotal} SAR</td>
                            <td className="p-3 border-t border-slate-300"></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      className="px-4 py-2 rounded-lg font-medium hover:scale-105 active:scale-95 transform transition-all duration-200 shadow-md bg-[#a47149] text-white hover:bg-[#8b5d3e] text-sm"
                      onClick={handleReset}
                      type="button"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live A4 Quotation Preview - Takes 3 columns */}
          <div className="xl:col-span-4 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white">
  <div className="p-6 border-b transition-colors duration-300 border-slate-200 flex justify-between items-center">
    <h2 className="text-xl font-semibold flex items-center gap-2 transition-colors duration-300 text-[#3d3d3d]">
      <span className="w-1 h-6 rounded-full transition-colors duration-300 bg-[#5e775a]"></span>
      Quotation
    </h2>
    <div className="flex gap-3">
      <button
        onClick={() => window.print()}
        className="p-3 rounded-lg bg-[#5e775a] text-white hover:bg-[#4a5f47] transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md"
        title="Print Preview"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-[#5e775a] text-white hover:bg-[#4a5f47] transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={handleDownloadExcel}
        disabled={quotation.length === 0}
      >
        Download Excel
      </button>
    </div>
  </div>
  <div className="p-4 overflow-auto bg-gray-100" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }} id="quotation-preview">
    <div className="transform scale-75 origin-top-left" style={{ width: '133.33%', height: '133.33%' }}>
      <QuotationPreview
        clientName={clientName}
        clientContact={clientContact}
        eventOrganizer={eventOrganizer === "Custom" ? customEventOrganizer : eventOrganizer}
        eventType={eventType}
        numberOfPeople={numberOfPeople}
        location={location}
        eventDate={eventDate}
        eventTime={eventTime}
        validityDays={validityDays}
        quotationItems={quotation}
        referenceCode={referenceCode}
        grandTotal={grandTotal}
      />
    </div>
  </div>
</div>

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
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) {
              handleAnimationEnd();
            }
          }}
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
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-20px);
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
          animation: fadeIn 0.3s ease-out;
        }
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-in;
          animation-fill-mode: forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-scaleOut {
          animation: scaleOut 0.3s ease-in;
          animation-fill-mode: forwards;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #quotation-preview, #quotation-preview * {
            visibility: visible;
          }
          #quotation-preview {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}