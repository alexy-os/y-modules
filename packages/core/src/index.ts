import { DndManager } from './DndManager';
export * from './types';
export { DndManager };

// Helper functions for easy setup
export function createDraggable(element: HTMLElement, config: import('./types').DraggableConfig): () => void {
  return DndManager.getInstance().registerDraggable(element, config);
}

export function createDropZone(element: HTMLElement, config: import('./types').DropZoneConfig): () => void {
  element.setAttribute('data-dropzone', '');
  return DndManager.getInstance().registerDropZone(element, config);
} 