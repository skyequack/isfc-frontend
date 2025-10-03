import React from 'react';
import Image from 'next/image';

interface OrderCardProps {
  name_en: string;
  name_ar: string;
  source: string;
  price: number;
  unit: string;
  rating?: string;
  description: string;
  prepTime: string;
  ingredients: string[];
  allergens: string[];
  dietary: string[];
  avatar?: string;
}

export default function OrderCard({
  name_en,
  name_ar,
  source,
  price,
  unit,
  rating,
  description,
  prepTime,
  ingredients,
  allergens,
  dietary,
  avatar,
}: OrderCardProps) {
  return (
    <div className="w-[420px] rounded-xl bg-white border border-[#EEF2F4] shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-6 space-y-4">
      {/* Header Row */}
      <header className="flex items-center justify-between">
        {/* Left Block - Avatar + Title/Subtitle */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-lg bg-[#FFF7F0] flex items-center justify-center flex-shrink-0">
            {avatar ? (
              <Image src={avatar} alt={`${name_en} image`} width={32} height={32} className="w-8 h-8" />
            ) : (
              <svg
                className="w-8 h-8 text-[#5e775a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Dish icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            )}
          </div>

          {/* Title Block */}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#0F1724] leading-tight">
              {name_en}
            </h2>
            <p className="text-[13px] font-medium text-[#6B7280] leading-tight">
              {source}
            </p>
          </div>
        </div>

        {/* Right Block - Price & Rating */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-[#2DBE63]">SAR {price}</div>
          <div className="text-xs text-slate-500">Per {unit}</div>
          {rating && (
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <svg
                className="w-3.5 h-3.5 text-[#FFC857]"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Star rating"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[13px] text-[#6B7280]">{rating}</span>
            </div>
          )}
        </div>
      </header>

      {/* Horizontal Divider */}
      <hr className="border-t border-[#EEF2F4]" />

      {/* Main Description */}
      <p className="text-sm text-[#374151] leading-relaxed">{description}</p>

      {/* Preparation Time Section */}
      <section>
        <h3 className="text-[13px] font-semibold text-[#334155] mb-2">
          Preparation Time
        </h3>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#6B7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Clock icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-[#374151]">{prepTime}</span>
        </div>
      </section>

      {/* Key Ingredients Section */}
      <section>
        <h3 className="text-[13px] font-semibold text-[#334155] mb-2">
          Key Ingredients
        </h3>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-md bg-[#E8F5E9] border border-[#A5D6A7] text-[13px] text-[#2E7D32]"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </section>

      {/* Allergens Section */}
      {allergens.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-[#334155] mb-2">
            Allergens
          </h3>
          <div className="flex flex-wrap gap-2">
            {allergens.map((allergen, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFF1F1] border border-[#F6D6D6] text-[13px] text-[#B91C1C]"
                aria-label={`Allergen: ${allergen}`}
              >
                <svg
                  className="w-3.5 h-3.5 text-[#F59E0B]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {allergen}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Dietary Information Section */}
      {dietary.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-[#334155] mb-2">
            Dietary Information
          </h3>
          <div className="flex flex-wrap gap-2">
            {dietary.map((diet, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ECFDF5] border border-[#D1FAE5] text-[13px] text-[#047857]"
              >
                <svg
                  className="w-3.5 h-3.5 text-[#047857]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {diet}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
