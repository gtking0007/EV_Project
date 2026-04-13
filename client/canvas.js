/**
 * canvas.js
 * 
 * Handles canvas initialization, element rendering, and local state management.
 */

class CanvasManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.elements = []; // Local array of element data objects
    }

    /**
     * Renders a single element object onto the canvas
     */
    renderElement(element) {
        // Create the main wrapper element
        const el = document.createElement('div');
        el.id = element.id;
        el.className = `canvas-element ${ELEMENT_DEFAULTS[element.type].className}`;
        el.setAttribute('data-id', element.id);

        // Apply position and size
        el.style.left = `${element.x}px`;
        el.style.top = `${element.y}px`;
        el.style.width = `${element.width}px`;
        el.style.height = `${element.height}px`;
        el.style.position = 'absolute';

        // Apply styles
        if (element.style.backgroundColor) el.style.backgroundColor = element.style.backgroundColor;
        if (element.style.color) el.style.color = element.style.color;
        if (element.style.zIndex !== undefined) el.style.zIndex = element.style.zIndex;

        // Content
        const inner = document.createElement('div');
        inner.className = 'element-inner';
        inner.innerHTML = element.text;
        el.appendChild(inner);

        // Add resize handle (bottom-right)
        const handle = document.createElement('div');
        handle.className = 'resize-handle handle-br';
        el.appendChild(handle);

        // Append to the canvas
        this.container.appendChild(el);
        return el;
    }

    /**
     * Clears and re-renders all elements
     */
    reRenderCanvas() {
        this.container.innerHTML = '';
        this.elements.forEach(element => this.renderElement(element));
    }

    /**
     * Local storage of element data
     */
    addElementToLocal(element) {
        this.elements.push(element);
        this.renderElement(element);
    }

    updateLocalElement(id, updates) {
        const index = this.elements.findIndex(el => el.id === id);
        if (index !== -1) {
            this.elements[index] = { ...this.elements[index], ...updates };

            // Only update DOM properties directly for performance during drag/resize
            const domEl = document.getElementById(id);
            if (domEl) {
                if (updates.x !== undefined) domEl.style.left = `${updates.x}px`;
                if (updates.y !== undefined) domEl.style.top = `${updates.y}px`;
                if (updates.width !== undefined) domEl.style.width = `${updates.width}px`;
                if (updates.height !== undefined) domEl.style.height = `${updates.height}px`;

                // If it's a full update (text/style), re-render content
                if (updates.text !== undefined) domEl.querySelector('.element-inner').innerHTML = updates.text;
                if (updates.style && updates.style.backgroundColor) domEl.style.backgroundColor = updates.style.backgroundColor;
                if (updates.style && updates.style.color) domEl.style.color = updates.style.color;
                if (updates.style && updates.style.zIndex !== undefined) domEl.style.zIndex = updates.style.zIndex;
            }
        }
    }

    removeLocalElement(id) {
        this.elements = this.elements.filter(el => el.id !== id);
        const domEl = document.getElementById(id);
        if (domEl) domEl.remove();
    }
}

// Global exposure for other modules
window.CanvasManager = CanvasManager;
