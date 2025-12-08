import React from 'react';
import type { GridItem } from '../types/quiz.types';
import { getLucideIcon } from '../utils/iconMapper';

interface GridLayoutProps {
  columns: number;
  items: GridItem[];
}

/**
 * GridLayout Component
 * 
 * Renders items in a multi-column grid layout with responsive design.
 * Supports icons, titles, descriptions, stats, and features for each grid item.
 * 
 * Requirements:
 * - 13.3: Render items in multi-column layout with specified columns
 * - 13.5: Render icons alongside item content when present
 */
const GridLayout: React.FC<GridLayoutProps> = ({ columns, items }) => {
  // Generate grid column classes based on column count
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2';

  return (
    <section
      className={`grid ${gridColsClass} gap-3 sm:gap-4 my-3 sm:my-4`}
      data-testid="grid-layout"
      data-columns={columns}
      role="list"
      aria-label={`Grid layout with ${columns} columns`}
    >
      {items.map((item, index) => {
        const IconComponent = item.icon ? getLucideIcon(item.icon) : null;
        const colorClass = item.color ? `text-${item.color}-400` : 'text-reinvent-purple';

        return (
          <article
            key={index}
            className="p-3 sm:p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-reinvent-purple/50 transition-colors"
            data-testid="grid-item"
            role="listitem"
            aria-label={item.title}
          >
            {/* Icon and Title */}
            <div className="flex items-start gap-2 sm:gap-3 mb-2">
              {IconComponent && (
                <IconComponent
                  className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`}
                  data-testid="grid-item-icon"
                  aria-hidden="true"
                />
              )}
              <h3 className="text-base sm:text-lg font-semibold text-white" data-testid="grid-item-title">
                {item.title}
              </h3>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3" data-testid="grid-item-description">
                {item.description}
              </p>
            )}

            {/* Single Stat */}
            {item.stat && (
              <div className={`text-xl sm:text-2xl font-bold ${colorClass} mb-2`} data-testid="grid-item-stat" aria-label={`Statistic: ${item.stat}`}>
                {item.stat}
              </div>
            )}

            {/* Stats Array */}
            {item.stats && item.stats.length > 0 && (
              <ul className="space-y-1 mb-2" data-testid="grid-item-stats" aria-label="Statistics">
                {item.stats.map((stat, statIndex) => (
                  <li key={statIndex} className={`text-xs sm:text-sm font-semibold ${colorClass}`}>
                    {stat}
                  </li>
                ))}
              </ul>
            )}

            {/* Features Array */}
            {item.features && item.features.length > 0 && (
              <ul className="space-y-1" data-testid="grid-item-features" aria-label="Features">
                {item.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-xs sm:text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-reinvent-purple mt-0.5" aria-hidden="true">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </section>
  );
};

export default GridLayout;
