import Image from "next/image";

interface MenuItemCardProps {
  name: string;
  source: string;
  category: string;
  price: number;
  unit: string;
  rating?: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  onAdd: () => void;
  onMoreInfo: () => void;
}

export default function MenuItemCard({
  name,
  source,
  category,
  price,
  unit,
  rating,
  description,
  imageUrl,
  quantity,
  onQuantityChange,
  onAdd,
  onMoreInfo,
}: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-all duration-200">
      <div className="flex gap-3">
        {/* Left side - Source logo and item info */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top section: Logo and title */}
          <div className="flex items-start gap-2 mb-2">
            {/* Source logo */}
            <div className="w-16 h-12 flex-shrink-0 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={source}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-xs font-bold text-slate-600">{source}</span>
              )}
            </div>

            {/* Vertical dividing line */}
            <div className="w-0.5 h-12 mt-1 bg-slate-500 flex-shrink-0"></div>

            {/* Title, category, and price */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">
                {name}
              </h3>
              <p className="text-sm text-slate-400 mb-1">
                {category}
              </p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <>
              {/* Horizontal dividing line */}
              <div className="h-0.5 bg-slate-500 mb-2"></div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </>
          )}

          {/* Bottom row: More Info and Live Station */}
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={onMoreInfo}
              className="text-sm text-slate-400 hover:text-[#5e775a] font-medium transition-colors"
            >
              More Info
            </button>
            
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="font-medium">Live Station</span>

            </div>
          </div>
        </div>

        {/* Right side - Image and controls */}
        <div className="flex flex-col items-end gap-3">
          {/* Price and Image side by side */}
          <div className="flex items-start gap-3">
            {/* Price section */}
            <div className="flex flex-col items-end justify-start h-24">
              <span className="text-xs font-medium text-slate-600 mb-1">
                Per {unit.toLowerCase()}
              </span>
              <span className="text-xl font-bold text-slate-900">
                SAR {price}
              </span>
              {rating && (
                <div className="text-xs text-amber-500 flex items-center gap-0.5 mt-1">
                  <span>⭐</span>
                  <span className="font-medium">{rating}</span>
                </div>
              )}
            </div>
            
            {/* Food image */}
            <div className="w-56 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                width={224}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            </div>
          </div>

          {/* Quantity controls and add button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200 font-medium text-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
              aria-label="Decrease quantity"
            >
              −
            </button>
            
            <span className="w-12 text-center font-semibold text-base text-slate-900 tabular-nums">
              {quantity}
            </span>
            
            <button
              onClick={() => onQuantityChange(1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200 font-medium text-xl"
              aria-label="Increase quantity"
            >
              +
            </button>
            
            <button
              onClick={onAdd}
              className="w-14 h-14 rounded-full bg-[#5e775a] hover:bg-[#4a5f47] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg ml-2"
              aria-label="Add to quotation"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}