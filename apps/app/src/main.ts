import { createDraggable, createDropZone, SortableManager } from '@y-modules/core';

interface ComponentData {
  type: string;
  content: string;
}

const dropzone = document.querySelector<HTMLElement>('.dropzone');
if (!dropzone) throw new Error('Dropzone not found');

const sortableManager = new SortableManager(dropzone);

createDropZone(dropzone, {
  accept: () => true,
  onHover: (event) => {
    sortableManager.findDropPosition({
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

    const isExistingComponent = event.source.closest('.dropzone') === dropzone;
    
    if (isExistingComponent) {
      sortableManager.insertElement(event.source, dropPosition.index, dropPosition.where);
    } else {
      const component = document.createElement('div');
      component.className = 'dropped-component';
      component.dataset.type = event.payload.type;
      component.innerHTML = `
        <strong>${event.payload.type}</strong>
        <p>${event.payload.content}</p>
      `;

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

// Инициализация draggable компонентов
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
    }
  });
}); 