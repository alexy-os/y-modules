import { Position, DragEvent, DropEvent, DragState, DropZoneState, DraggableConfig, DropZoneConfig } from './types';

export class DndManager {
  private static instance: DndManager;
  private dragState: DragState = {
    isDragging: false,
    source: null,
    payload: null,
    position: null
  };
  private dropZones = new WeakMap<HTMLElement, DropZoneConfig>();
  private draggables = new WeakMap<HTMLElement, DraggableConfig>();
  private positions = new WeakMap<HTMLElement, DOMRect>();
  private observer: IntersectionObserver;

  private constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.positions.set(entry.target as HTMLElement, entry.boundingClientRect);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.setupGlobalListeners();
  }

  public static getInstance(): DndManager {
    if (!DndManager.instance) {
      DndManager.instance = new DndManager();
    }
    return DndManager.instance;
  }

  private setupGlobalListeners(): void {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  public registerDraggable(element: HTMLElement, config: DraggableConfig): () => void {
    this.draggables.set(element, config);
    element.style.willChange = 'transform';
    
    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (config.disabled) return;
      if (config.dragHandle) {
        const target = e.target as HTMLElement;
        if (!target.closest(config.dragHandle)) return;
      }

      e.preventDefault();
      const position = this.getEventPosition(e);
      this.startDrag(element, position, e);
    };

    element.addEventListener('mousedown', handleStart);
    element.addEventListener('touchstart', handleStart, { passive: false });

    return () => {
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('touchstart', handleStart);
      this.draggables.delete(element);
    };
  }

  public registerDropZone(element: HTMLElement, config: DropZoneConfig): () => void {
    this.dropZones.set(element, config);
    this.observer.observe(element);

    return () => {
      this.observer.unobserve(element);
      this.dropZones.delete(element);
    };
  }

  private startDrag(element: HTMLElement, position: Position, originalEvent: MouseEvent | TouchEvent): void {
    const config = this.draggables.get(element);
    if (!config) return;

    this.dragState = {
      isDragging: true,
      source: element,
      payload: config.data,
      position
    };

    const event: DragEvent = {
      type: 'dragstart',
      source: element,
      payload: config.data,
      position,
      originalEvent
    };

    config.onDragStart?.(event);
    element.classList.add('dragging');
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.dragState.isDragging) return;
    this.handleMove(e);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.dragState.isDragging) return;
    e.preventDefault();
    this.handleMove(e);
  }

  private handleMove(e: MouseEvent | TouchEvent): void {
    if (!this.dragState.source) return;

    const position = this.getEventPosition(e);
    const config = this.draggables.get(this.dragState.source);
    
    if (config) {
      const event: DragEvent = {
        type: 'dragmove',
        source: this.dragState.source,
        payload: this.dragState.payload!,
        position,
        originalEvent: e
      };
      
      config.onDragMove?.(event);
    }

    this.checkDropZones(position, e);
  }

  private checkDropZones(position: Position, originalEvent: MouseEvent | TouchEvent): void {
    Array.from(this.getDropZoneEntries()).forEach(([element, config]: [HTMLElement, DropZoneConfig]) => {
      if (config.disabled) return;

      const rect = this.positions.get(element) || element.getBoundingClientRect();
      const isOver = this.isPositionInRect(position, rect);

      if (isOver && this.dragState.source) {
        const event: DropEvent = {
          type: 'hover',
          source: this.dragState.source,
          target: element,
          payload: this.dragState.payload!,
          position,
          originalEvent
        };

        if (config.accept?.(this.dragState.payload!) !== false) {
          config.onHover?.(event);
        }
      }
    });
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this.dragState.isDragging) return;
    this.handleDrop(e);
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (!this.dragState.isDragging) return;
    this.handleDrop(e);
  }

  private handleDrop(e: MouseEvent | TouchEvent): void {
    if (!this.dragState.source) return;

    const position = this.getEventPosition(e);
    const dragConfig = this.draggables.get(this.dragState.source);

    Array.from(this.getDropZoneEntries()).forEach(([element, dropConfig]: [HTMLElement, DropZoneConfig]) => {
      if (dropConfig.disabled) return;

      const rect = this.positions.get(element) || element.getBoundingClientRect();
      if (this.isPositionInRect(position, rect)) {
        const event: DropEvent = {
          type: 'drop',
          source: this.dragState.source!,
          target: element,
          payload: this.dragState.payload!,
          position,
          originalEvent: e
        };

        if (dropConfig.accept?.(this.dragState.payload!) !== false) {
          dropConfig.onDrop?.(event);
        }
      }
    });

    if (dragConfig) {
      const event: DragEvent = {
        type: 'dragend',
        source: this.dragState.source,
        payload: this.dragState.payload!,
        position,
        originalEvent: e
      };
      
      dragConfig.onDragEnd?.(event);
    }

    this.dragState.source.classList.remove('dragging');
    this.resetDragState();
  }

  private resetDragState(): void {
    this.dragState = {
      isDragging: false,
      source: null,
      payload: null,
      position: null
    };
  }

  private getEventPosition(e: MouseEvent | TouchEvent): Position {
    if (e instanceof MouseEvent) {
      return { x: e.clientX, y: e.clientY };
    } else {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
  }

  private isPositionInRect(position: Position, rect: DOMRect): boolean {
    return (
      position.x >= rect.left &&
      position.x <= rect.right &&
      position.y >= rect.top &&
      position.y <= rect.bottom
    );
  }

  private *getDropZoneEntries(): Generator<[HTMLElement, DropZoneConfig]> {
    const dropZones = Array.from(document.querySelectorAll('[data-dropzone]'));
    for (const element of dropZones) {
      const config = this.dropZones.get(element as HTMLElement);
      if (config) {
        yield [element as HTMLElement, config];
      }
    }
  }
} 