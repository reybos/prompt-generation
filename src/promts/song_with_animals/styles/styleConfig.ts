/**
 * Конфигурация стилей для song with animals pipeline
 * Стили теперь выбираются через UI
 */

import { defaultStyle } from './defaultStyle.js';
import { steampunkStyle } from './steampunkStyle.js';

// Доступные стили
export const AVAILABLE_STYLES = {
  default: 'default',
  steampunk: 'steampunk'
} as const;

export type StyleName = keyof typeof AVAILABLE_STYLES;

// Типы для стилей
export interface VisualStyle {
  name: string;
  displayName: string;
  description: string;
  characterStyle: string;
  environmentStyle: string;
  colorPalette: string;
}

// Функция для получения стиля по имени
export function getStyle(styleName: string): VisualStyle {
  const styles: Record<string, VisualStyle> = {
    default: defaultStyle,
    steampunk: steampunkStyle,
  };
  
  return styles[styleName] || defaultStyle;
}

// Функция для получения списка доступных стилей
export function getAvailableStyles(): { name: string; displayName: string; description: string }[] {
  return [
    { name: defaultStyle.name, displayName: defaultStyle.displayName, description: defaultStyle.description },
    { name: steampunkStyle.name, displayName: steampunkStyle.displayName, description: steampunkStyle.description },
  ];
}

// Функция для проверки валидности стиля
export function isValidStyle(styleName: string): styleName is StyleName {
  return styleName in AVAILABLE_STYLES;
}
