export interface Position {
  x: number;
  y: number;
}

export interface DragEvent<T = any> {
  type: 'dragstart' | 'dragmove' | 'dragend';
  source: HTMLElement;
  payload: T;
  position: Position;
  originalEvent: MouseEvent | TouchEvent;
}

export interface DropEvent<T = any> {
  type: 'drop' | 'hover';
  source: HTMLElement;
  target: HTMLElement;
  payload: T;
  position: Position;
  originalEvent: MouseEvent | TouchEvent;
}

export interface DraggableConfig<T = any> {
  data: T;
  onDragStart?: (event: DragEvent<T>) => void;
  onDragMove?: (event: DragEvent<T>) => void;
  onDragEnd?: (event: DragEvent<T>) => void;
  dragHandle?: string;
  disabled?: boolean;
  preview?: {
    render?: (data: T) => HTMLElement;
    offset?: { x: number; y: number };
    className?: string;
  };
}

export interface DropZoneConfig<T = any> {
  accept?: (data: T) => boolean;
  onDrop?: (event: DropEvent<T>) => void;
  onHover?: (event: DropEvent<T>) => void;
  onHoverEnd?: (event: DropEvent<T>) => void;
  disabled?: boolean;
}

export interface DragState<T = any> {
  isDragging: boolean;
  source: HTMLElement | null;
  payload: T | null;
  position: Position | null;
  previewElement: HTMLElement | null;
}

export interface DropZoneState {
  isOver: boolean;
  position: Position | null;
} 