import { createDraggable, createDropZone, SortableManager, BlockControls } from '@y-modules/core';

interface ComponentData {
  type: string;
  content: string;
}

const dropzoneElement = document.querySelector<HTMLElement>('.dropzone');
if (!dropzoneElement) {
  throw new Error('Dropzone element not found');
}

const dropzone = dropzoneElement; // теперь TypeScript знает, что это не null
const sortableManager = new SortableManager(dropzone);

function createComponent(payload: ComponentData): HTMLElement {
  const component = document.createElement('div');
  component.className = 'dropped-component';
  component.dataset.type = payload.type;
  component.innerHTML = `
    <strong>${payload.type}</strong>
    <p>${payload.content}</p>
  `;

  // Добавляем controls
  const controls = new BlockControls();
  component.appendChild(controls);

  // Показываем/скрываем controls при наведении
  component.addEventListener('mouseenter', () => {
    controls.show();
  });

  component.addEventListener('mouseleave', () => {
    controls.hide();
  });

  // Обрабатываем события controls
  controls.addEventListener('moveup', () => {
    const prev = component.previousElementSibling;
    if (prev) {
      dropzone.insertBefore(component, prev);
    }
  });

  controls.addEventListener('movedown', () => {
    const next = component.nextElementSibling;
    if (next) {
      dropzone.insertBefore(component, next.nextElementSibling);
    }
  });

  controls.addEventListener('delete', () => {
    component.remove();
  });

  createDraggable(component, {
    data: payload,
    onDragStart: () => component.classList.add('dragging'),
    onDragEnd: () => component.classList.remove('dragging')
  });

  return component;
}

// Обновляем обработчик onDrop
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
      const component = createComponent(event.payload);
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