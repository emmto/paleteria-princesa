import React, { useState } from 'react';
import { clsx } from 'clsx';

interface Props {
  categories: string[];
}

export default function CategoryFilter({ categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const handleSelect = (category: string) => {
    setActiveCategory(category);

    const sections = document.querySelectorAll<HTMLElement>('[data-catalog-section]');
    sections.forEach(section => {
      const sectionCategory = section.dataset.category || '';
      if (category === 'Todas' || sectionCategory === category) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      const rect = catalogEl.getBoundingClientRect();
      if (rect.top < 0) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const pills = ['Todas', ...categories];

  return (
    <div className="sticky top-14 sm:top-16 z-30 bg-gray-50/95 backdrop-blur-md border-b border-gray-200/80 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-8">
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar"
        role="group"
        aria-label="Filtrar catálogo por categoría"
      >
        {pills.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelect(cat)}
              aria-pressed={isActive}
              className={clsx(
                'flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
