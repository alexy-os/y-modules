export class BlockControls extends HTMLElement {
  private static template = `
    <style>
      :host {
        position: absolute;
        right: -40px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 4px;
        background: white;
        padding: 4px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1000;
      }

      :host(.visible) {
        opacity: 1;
      }

      button {
        width: 32px;
        height: 32px;
        border: none;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: all 0.2s;
      }

      button:hover {
        background: #e0e0e0;
        color: #333;
      }

      button.delete {
        color: #ff4444;
      }

      button.delete:hover {
        background: #ff4444;
        color: white;
      }
    </style>
    <button class="move-up" title="Move Up">↑</button>
    <button class="delete" title="Delete">×</button>
    <button class="move-down" title="Move Down">↓</button>
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = BlockControls.template;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    const moveUpBtn = this.shadowRoot!.querySelector('.move-up');
    const deleteBtn = this.shadowRoot!.querySelector('.delete');
    const moveDownBtn = this.shadowRoot!.querySelector('.move-down');

    moveUpBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('moveup'));
    });

    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('delete'));
    });

    moveDownBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('movedown'));
    });
  }

  show() {
    this.classList.add('visible');
  }

  hide() {
    this.classList.remove('visible');
  }
}

customElements.define('block-controls', BlockControls); 