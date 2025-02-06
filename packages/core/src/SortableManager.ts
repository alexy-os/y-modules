import { Position } from './types';

export class SortableManager {
  private container: HTMLElement;
  private indicator: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Создаем единый индикатор
    this.indicator = document.createElement('div');
    this.indicator.className = 'drop-indicator';
    this.container.appendChild(this.indicator);
  }

  public findDropPosition(mousePosition: Position): { index: number; where: 'before' | 'after' } {
    // Добавляем приведение типов для компонентов
    const components = Array.from(
      this.container.querySelectorAll('.dropped-component')
    ).map(el => el as HTMLElement);
    
    // Если нет компонентов, вставляем в начало
    if (components.length === 0) {
      this.showIndicator('start');
      return { index: 0, where: 'before' };
    }

    // Проверяем позицию перед первым компонентом
    const firstComponent = components[0];
    const firstRect = firstComponent.getBoundingClientRect();
    if (mousePosition.y < firstRect.top + (firstRect.height * 0.3)) {
      this.showIndicator('before', firstComponent);
      return { index: 0, where: 'before' };
    }

    // Проверяем позиции между компонентами
    for (let i = 0; i < components.length - 1; i++) {
      const currentComponent = components[i];
      const nextComponent = components[i + 1];
      const currentRect = currentComponent.getBoundingClientRect();
      const nextRect = nextComponent.getBoundingClientRect();
      const gap = nextRect.top - currentRect.bottom;
      
      if (mousePosition.y >= currentRect.bottom && mousePosition.y <= nextRect.top) {
        this.showIndicator('between', currentComponent, nextComponent);
        return { index: i + 1, where: 'before' };
      }
    }

    // Проверяем позицию после последнего компонента
    const lastComponent = components[components.length - 1];
    const lastRect = lastComponent.getBoundingClientRect();
    if (mousePosition.y > lastRect.bottom - (lastRect.height * 0.3)) {
      this.showIndicator('after', lastComponent);
      return { index: components.length, where: 'after' };
    }

    // По умолчанию вставляем после последнего
    this.showIndicator('after', lastComponent);
    return { index: components.length, where: 'after' };
  }

  private showIndicator(position: 'start' | 'before' | 'between' | 'after', component?: HTMLElement, nextComponent?: HTMLElement) {
    const containerRect = this.container.getBoundingClientRect();

    switch (position) {
      case 'start':
        this.indicator.style.top = `${20}px`;
        break;
      case 'before':
        if (component) {
          const rect = component.getBoundingClientRect();
          this.indicator.style.top = `${rect.top - containerRect.top - 2}px`;
        }
        break;
      case 'between':
        if (component && nextComponent) {
          const rect1 = component.getBoundingClientRect();
          const rect2 = nextComponent.getBoundingClientRect();
          const middle = (rect2.top - rect1.bottom) / 2;
          this.indicator.style.top = `${rect1.bottom - containerRect.top + middle}px`;
        }
        break;
      case 'after':
        if (component) {
          const rect = component.getBoundingClientRect();
          this.indicator.style.top = `${rect.bottom - containerRect.top + 2}px`;
        }
        break;
    }

    this.indicator.style.display = 'block';
  }

  public hideIndicator() {
    this.indicator.style.display = 'none';
  }

  public insertElement(element: HTMLElement, index: number, where: 'before' | 'after'): void {
    // Добавляем приведение типов для компонентов
    const components = Array.from(
      this.container.querySelectorAll('.dropped-component')
    ).map(el => el as HTMLElement);
    
    if (where === 'after') {
      index++;
    }

    if (index >= components.length) {
      this.container.appendChild(element);
    } else {
      this.container.insertBefore(element, components[index]);
    }
  }
} 