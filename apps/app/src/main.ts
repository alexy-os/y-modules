import { createDraggable, createDropZone } from '@y-modules/core';

interface ComponentData {
  type: string;
  content: string;
}

// Initialize draggable components
document.querySelectorAll<HTMLElement>('.component').forEach(element => {
  createDraggable(element, {
    data: {
      type: element.dataset.type,
      content: element.textContent?.trim() || ''
    } as ComponentData,
    onDragStart: () => {
      element.style.opacity = '0.5';
    },
    onDragEnd: () => {
      element.style.opacity = '1';
    }
  });
});

// Initialize drop zone
const dropzone = document.querySelector<HTMLElement>('.dropzone');
if (dropzone) {
  createDropZone(dropzone, {
    accept: (data: ComponentData) => true, // Accept all components
    onHover: (event) => {
      dropzone.classList.add('hover');
    },
    onHoverEnd: () => {
      dropzone.classList.remove('hover');
    },
    onDrop: (event) => {
      const data = event.payload as ComponentData;
      dropzone.classList.remove('hover');
      
      // Create and append the new component
      const component = document.createElement('div');
      component.className = 'dropped-component';
      component.innerHTML = `
        <strong>${data.type}</strong>
        <p>${data.content}</p>
      `;
      
      dropzone.appendChild(component);
    }
  });
} 