import { DndManager } from './DndManager';
import { SortableManager } from './SortableManager';
import { BlockControls } from './components/BlockControls';
import type { DraggableConfig, DropZoneConfig } from './types';

// Экспортируем компоненты
export { DndManager };
export { SortableManager };
export { BlockControls };
// Инициализируем менеджер сразу
const manager = DndManager.getInstance();

// Экспортируем типы
export * from './types';

// Экспортируем функции как именованные экспорты
export function createDraggable(element: HTMLElement, config: DraggableConfig): () => void {
  return manager.registerDraggable(element, config);
}

export function createDropZone(element: HTMLElement, config: DropZoneConfig): () => void {
  element.setAttribute('data-dropzone', '');
  return manager.registerDropZone(element, config);
} 