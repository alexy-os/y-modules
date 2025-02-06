import { createDraggable, createDropZone, SortableManager } from '@y-modules/core';

interface ComponentData {
  type: string;
  content: string;
}

// Функция создания preview элемента
function createPreviewElement(data: ComponentData): HTMLElement {
  const preview = document.createElement('div');
  preview.className = 'component-preview';
  preview.innerHTML = `
    <strong>${data.type}</strong>
    <p>${data.content}</p>
  `;
  return preview;
}

// Initialize draggable components
document.querySelectorAll<HTMLElement>('.component').forEach(element => {
  createDraggable(element, {
    data: {
      type: element.dataset.type,
      content: element.textContent?.trim() || ''
    } as ComponentData,
    onDragStart: () => {
      element.classList.add('dragging');
    },
    onDragEnd: () => {
      element.classList.remove('dragging');
    },
    preview: {
      render: createPreviewElement,
      offset: { x: 15, y: 15 },
      className: 'dragging-preview'
    }
  });
});

// Initialize drop zone
const dropzone = document.querySelector<HTMLElement>('.dropzone');
if (!dropzone) throw new Error('Dropzone not found');

const sortableManager = new SortableManager(dropzone);

createDropZone(dropzone, {
  accept: (data: ComponentData) => true,
  onHover: (event) => {
    // Получаем позицию относительно dropzone
    const dropzoneRect = dropzone.getBoundingClientRect();
    const relativePosition = {
      x: event.position.x - dropzoneRect.left,
      y: event.position.y - dropzoneRect.top
    };

    // Определяем позицию для вставки
    const dropPosition = sortableManager.findDropPosition({
      x: event.position.x,
      y: event.position.y
    });

    dropzone.classList.add('hover');
  },
  onHoverEnd: () => {
    dropzone.classList.remove('hover');
    sortableManager.hideIndicator();
  },
  onDrop: (event) => {
    const dropPosition = sortableManager.findDropPosition({
      x: event.position.x,
      y: event.position.y
    });

    // Если это существующий компонент
    const isExistingComponent = event.source.closest('.dropzone') === dropzone;
    
    if (isExistingComponent) {
      // Перемещаем существующий компонент
      sortableManager.insertElement(event.source, dropPosition.index, dropPosition.where);
    } else {
      // Создаем новый компонент
      const component = document.createElement('div');
      component.className = 'dropped-component';
      component.dataset.type = event.payload.type;
      component.innerHTML = `
        <strong>${event.payload.type}</strong>
        <p>${event.payload.content}</p>
      `;

      // Делаем новый компонент перетаскиваемым
      createDraggable(component, {
        data: event.payload,
        onDragStart: () => component.classList.add('dragging'),
        onDragEnd: () => component.classList.remove('dragging')
      });

      sortableManager.insertElement(component, dropPosition.index, dropPosition.where);
    }

    sortableManager.hideIndicator();
    dropzone.classList.remove('hover');
  }
});

function createComponent(data: ComponentData): HTMLElement {
  const component = document.createElement('div');
  component.className = 'dropped-component';
  component.innerHTML = `
    <strong>${data.type}</strong>
    <p>${data.content}</p>
  `;
  
  createDraggable(component, {
    data: data,
    onDragStart: () => component.classList.add('dragging'),
    onDragEnd: () => component.classList.remove('dragging')
  });

  return component;
} 