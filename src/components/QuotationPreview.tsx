import React from "react";

interface QuotationPreviewProps {
  clientName: string;
  clientContact: string;
  eventOrganizer: string;
  eventType: string;
  numberOfPeople: string;
  eventDate: string;
  eventTime: string;
  location: string;
  validityDays: string;
  referenceCode: string;
  quotationItems: Array<{
    item: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  grandTotal: number;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  clientName,
  clientContact,
  eventOrganizer,
  eventType,
  numberOfPeople,
  eventDate,
  eventTime,
  location,
  validityDays,
  referenceCode,
  quotationItems,
  grandTotal,
}) => {
  // Calculate totals like the API does
  const totalExcludeVAT = grandTotal / 1.15;
  const vat = totalExcludeVAT * 0.15;
  const totalAmount = grandTotal;

  // Format date
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <div className="quotation-preview w-full max-w-5xl mx-auto bg-white p-6 text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
      
      {/* Header Section with Logo Space */}
      <div className="text-center mb-8 bg-gray-100 py-8 rounded-lg">
        <div className="text-center mb-4">
          {/* Logo placeholder */}
          <div className="w-28 h-12 bg-gray-300 mx-auto mb-4 rounded flex items-center justify-center text-xs text-black">
            ISFC LOGO
          </div>
        </div>
      </div>

      {/* Company Name in Arabic */}
      <div className="text-center mb-2">
        <h1 className="text-lg font-bold text-white bg-gray-600 py-2 rounded">الشركة العالمية التخصصية للأغذية</h1>
      </div>

      {/* Quotation Title */}
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-black">Quotation - عرض سعر</h2>
      </div>

      {/* Intro Text */}
      <div className="text-center mb-6">
        <p className="text-sm italic text-black">Peace Be Upon You ,, Upon your kind request ,,, We are providing you a quotation for your event ,, Hoping it pleases you ,,</p>
      </div>

      {/* Client Information Section */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black">
          {/* Left Column */}
          <div>
            <div className="mb-3">
              <span className="font-bold text-black">To:</span>
            </div>
            <div className="mb-3">
              <span className="text-black">{clientName || ""}</span>
            </div>
            <div className="mb-3">
              <span className="font-bold text-black">A: </span>
              <span className="text-black">{location || ""}</span>
            </div>
            <div className="mb-3">
              <span className="font-bold text-black">P: </span>
              <span className="text-black">{clientContact || ""}</span>
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            <div className="mb-3">
              <span className="font-bold text-black">Quotation Date: </span>
              <span className="text-black">{formattedDate}</span>
            </div>
            <div className="mb-3">
              <span className="font-bold text-black">Due Date: </span>
              <span className="text-black"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="mb-6 text-sm text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-3">
              <span className="font-bold text-black">Event Organizer: </span>
              <span className="text-black">{eventOrganizer || ""}</span>
            </div>
            <div className="mb-3">
              <span className="font-bold text-black">Number of People: </span>
              <span className="text-black">{numberOfPeople || ""}</span>
            </div>
            <div className="mb-3">
              <span className="font-bold text-black">Date of Event: </span>
              <span className="text-black">{eventDate || ""}</span>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <span className="font-bold text-black">Location of Event: </span>
              <span className="text-black">{location || ""}</span>
            </div>
            <div className="mb-3">
              <span className="font-bold text-black">Pickup Time: </span>
              <span className="text-black">{eventTime || ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-400 text-white">
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">#</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">Product</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">Product (arb)</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">Unit</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">Price per unit</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">QTY</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">#DAYS</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {quotationItems && quotationItems.length > 0 ? (
              quotationItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">{index + 1}</td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">{item.item}</td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black"></td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">pcs</td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">{item.price.toFixed(2)}</td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">{item.quantity}</td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">1</td>
                  <td className="border border-gray-400 px-2 py-3 text-center text-black">{item.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="border border-gray-400 px-4 py-8 text-center text-black">
                  No items added to quotation
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Buffet Details Section */}
      {quotationItems && quotationItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-gray-400 text-white text-center py-3 font-bold text-base">
            Buffets - Banquet Details - التفاصيل
          </div>
          {quotationItems.map((item, index) => (
            <div key={index} className="border border-gray-300 p-4 text-sm">
              <div className="font-bold text-center mb-2 text-black">{item.item}</div>
              <div className="text-center text-black">Buffet service details would go here</div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Details and Status Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left - Invoice Details */}
          <div>
            <div className="bg-gray-400 text-white text-center py-3 font-bold">Invoice Details</div>
            <div className="border border-gray-300 p-4 text-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-black">Total Exclude VAT</span>
                <span className="text-black">{totalExcludeVAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-black">VAT 15%</span>
                <span className="text-black">{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-black">Total Amount</span>
                <span className="text-black">{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-black">Paid Amount</span>
                <span className="text-black"></span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-black">Remaining Amount (Balance)</span>
                <span className="text-black"></span>
              </div>
            </div>
          </div>
          
          {/* Right - Status */}
          <div>
            <div className="bg-gray-400 text-white text-center py-3 font-bold">Status of Quotation- حاله العرض</div>
            <div className="border border-gray-300 p-4 text-sm flex items-center justify-center h-32">
              <span className="text-black">Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-8">
        <div className="bg-gray-400 text-white text-center py-3 font-bold text-base">
          Terms & Conditions - الشروط والاحكام
        </div>
        <div className="border border-gray-300 p-4 text-sm">
          <div className="mb-4 text-black">
            <p>This quotation is valid for {validityDays || "3"} days from the date of sending the quotation, once approved 100% of the quotation total amount should be paid 3 days before the event.</p>
            <p>Once booking is confirmed, the payment will not be refunded for any reason.</p>
            <p>Please send a copy of transfers by E-mail</p>
            {eventType && <p className="mt-2"><span className="font-bold">Event Type:</span> {eventType}</p>}
          </div>
          <div className="text-right text-black" dir="rtl">
            <p>العرض ساري لمدة {validityDays || "3"} أيام من تاريخ الإرسال و عند حال القبول يتم تحويل 100% من قيمه العرض وبسداد المبلغ كامل قبل المناسبه ب 3 أيام</p>
            <p>ي حالة تأكيد الحجز تكون الدفعه غير مستردة لأي سبب من الأسباب</p>
            <p>يتم إرسال صورة من التحويلات على البريد الالكتروني</p>
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div>
            <div className="bg-gray-400 text-white text-center py-3 font-bold">Bank Account Details</div>
            <div className="border border-gray-300 p-4 text-sm">
              <div className="mb-2 text-black"><span className="font-bold">Bank Name:</span> Riyad Bank</div>
              <div className="mb-2 text-black"><span className="font-bold">Account Name:</span> International Specialized Food Company</div>
              <div className="mb-2 text-black"><span className="font-bold">Account Number:</span> 2052000010006086614000</div>
              <div className="mb-2 text-black"><span className="font-bold">IBAN:</span> SA7620000010006086614000</div>
            </div>
          </div>
          <div>
            <div className="bg-gray-400 text-white text-center py-3 font-bold">Comments</div>
            <div className="border border-gray-300 p-4 text-sm h-32 text-black">
              {/* Comments section - empty */}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="text-center text-sm text-black">
        <div className="mb-2">
          <span className="font-bold">For any inquiries:</span>
        </div>
        <div className="mb-1">Phone: +966 11 234 5678 | Email: info@isfc.com.sa</div>
        <div>Website: www.isfc.com.sa</div>
      </div>

    </div>
  );
};

export default QuotationPreview;