"use client";

import { useEffect, useRef, useState } from "react";

export type SortOption = "recommended" | "price-asc" | "price-desc";

function ChevronDown() {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src="/icons/chevron-down.svg" alt="" aria-hidden="true" className="h-4 w-4" />
  );
}

function FilterDropdown({
  availableAmenities,
  selectedAmenities,
  onToggleAmenity,
}: {
  availableAmenities: string[];
  selectedAmenities: Set<string>;
  onToggleAmenity: (amenity: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border-2 border-sand bg-white px-4 py-2 font-outfit text-meta text-jungle/80 transition-colors hover:border-sage"
      >
        Filters
        {selectedAmenities.size > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jungle-dark text-[11px] font-semibold text-sand-light">
            {selectedAmenities.size}
          </span>
        )}
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute left-0 z-10 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-sand bg-white p-3 shadow-soft-lg">
          {availableAmenities.length === 0 ? (
            <p className="px-1 py-1 font-outfit text-meta text-jungle/50">No filters available</p>
          ) : (
            availableAmenities.map(amenity => {
              const checked = selectedAmenities.has(amenity);
              return (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 font-outfit text-meta text-jungle hover:bg-sand-light"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleAmenity(amenity)}
                    className="form-checkbox"
                  />
                  {amenity}
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function SortFilterBar({
  sortBy,
  onSortChange,
  availableAmenities,
  selectedAmenities,
  onToggleAmenity,
}: {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  availableAmenities: string[];
  selectedAmenities: Set<string>;
  onToggleAmenity: (amenity: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="font-outfit text-meta text-jungle/70">
          Sort by
        </label>
        <div className="relative">
          <select
            id="sort-by"
            value={sortBy}
            onChange={e => onSortChange(e.target.value as SortOption)}
            className="select-field h-auto w-auto appearance-none border-sand py-2 pr-10 text-meta text-jungle transition-colors hover:border-sage"
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2">
            <ChevronDown />
          </div>
        </div>
      </div>

      <FilterDropdown
        availableAmenities={availableAmenities}
        selectedAmenities={selectedAmenities}
        onToggleAmenity={onToggleAmenity}
      />
    </div>
  );
}
