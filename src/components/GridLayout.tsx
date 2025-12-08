import React, { useState } from 'react';
import type { GridItem } from '../types/quiz.types';
import { getLucideIcon, resolveAWSIconPath } from '../utils/iconMapper';

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
      {items.map((item, index) => (
        <GridItemComponent key={index} item={item} />
      ))}
    </section>
  );
};

/**
 * GridItemComponent
 * Renders a single grid item with icon support for both AWS and Lucide
 */
const GridItemComponent: React.FC<{ item: GridItem }> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const iconType = item.iconType || 'lucide'; // Default to lucide for backward compatibility
  const colorClass = item.color ? `text-${item.color}-400` : 'text-reinvent-purple';

  // Determine icon rendering based on type
  let iconElement = null;
  if (item.icon) {
    if (iconType === 'lucide') {
      const IconComponent = getLucideIcon(item.icon);
      if (IconComponent) {
        iconElement = (
          <IconComponent
            className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`}
            data-testid="grid-item-icon"
            aria-hidden="true"
          />
        );
      }
    } else if (iconType === 'aws') {
      const awsIconPath = resolveAWSIconPath(item.icon);
      if (!imageError) {
        iconElement = (
          <img
            src={awsIconPath}
            alt=""
            className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 object-contain"
            onError={() => setImageError(true)}
            data-testid="grid-item-icon"
            aria-hidden="true"
          />
        );
      } else {
        // Fallback for AWS icons that fail to load
        iconElement = (
          <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-reinvent-purple/20 rounded border border-reinvent-purple/50">
            <span className="text-[6px] font-bold text-reinvent-purple uppercase">
              {item.icon}
            </span>
          </div>
        );
      }
    }
  }

  return (
    <article
      className="p-3 sm:p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-reinvent-purple/50 transition-colors"
      data-testid="grid-item"
      role="listitem"
      aria-label={item.title}
    >
      {/* Icon and Title */}
      <div className="flex items-start gap-2 sm:gap-3 mb-2">
        {iconElement}
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
};

export default GridLayout;
