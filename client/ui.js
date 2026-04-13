/**
 * ui.js
 * 
 * Manages the User Interface, sidebar interactions, and the Properties Panel.
 */

class UIController {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.selectedId = null;
        this.elements = []; // Local cache of element data from CanvasManager

        // DOM elements
        this.panel = document.getElementById('properties-panel');
        this.emptyMsg = document.getElementById('no-selection-message');
        this.canvasElement = document.getElementById('canvas');

        // Property Inputs
        this.inputs = {
            id: document.getElementById('prop-id'),
            text: document.getElementById('prop-text'),
            x: document.getElementById('prop-x'),
            y: document.getElementById('prop-y'),
            width: document.getElementById('prop-width'),
            height: document.getElementById('prop-height'),
            color: document.getElementById('prop-color'),
            colorHex: document.getElementById('prop-color-hex'),
            textColor: document.getElementById('prop-text-color'),
            textColorHex: document.getElementById('prop-text-color-hex')
        };

        this.initEventListeners();
    }

    initEventListeners() {
        // 1. Sidebar Component Dragging
        const components = document.querySelectorAll('.component-item');
        components.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', item.dataset.type);
            });
        });

        // 2. Canvas Drop Handling
        this.canvasElement.addEventListener('dragover', (e) => e.preventDefault());
        this.canvasElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('type');
            if (!type) return;

            const rect = this.canvasElement.getBoundingClientRect();

            // Calculate center drop position
            const x = e.clientX - rect.left - (window.ELEMENT_DEFAULTS[type].width / 2);
            const y = e.clientY - rect.top - (window.ELEMENT_DEFAULTS[type].height / 2);

            // Create new element via factory
            const newEl = window.createNewElement(type, Math.max(0, Math.round(x)), Math.max(0, Math.round(y)));

            // Trigger add callback
            this.callbacks.onAdd(newEl);
        });

        // 3. Property Panel Field Updates
        const triggerUpdate = (key, value, isStyle = false) => {
            if (!this.selectedId) return;
            const updates = {};
            if (isStyle) {
                const current = this.getElementData(this.selectedId);
                updates.style = { ...current.style, [key]: value };
            } else {
                updates[key] = value;
            }
            this.callbacks.onUpdate(this.selectedId, updates);
        };

        // Numerical & Text Inputs
        this.inputs.text.addEventListener('input', (e) => triggerUpdate('text', e.target.value));
        this.inputs.x.addEventListener('input', (e) => triggerUpdate('x', parseInt(e.target.value) || 0));
        this.inputs.y.addEventListener('input', (e) => triggerUpdate('y', parseInt(e.target.value) || 0));
        this.inputs.width.addEventListener('input', (e) => triggerUpdate('width', parseInt(e.target.value) || 0));
        this.inputs.height.addEventListener('input', (e) => triggerUpdate('height', parseInt(e.target.value) || 0));

        // Color Inputs
        this.inputs.color.addEventListener('input', (e) => {
            this.inputs.colorHex.value = e.target.value.toUpperCase();
            triggerUpdate('backgroundColor', e.target.value, true);
        });
        this.inputs.colorHex.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                this.inputs.color.value = e.target.value;
                triggerUpdate('backgroundColor', e.target.value, true);
            }
        });

        this.inputs.textColor.addEventListener('input', (e) => {
            this.inputs.textColorHex.value = e.target.value.toUpperCase();
            triggerUpdate('color', e.target.value, true);
        });
        this.inputs.textColorHex.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                this.inputs.textColor.value = e.target.value;
                triggerUpdate('color', e.target.value, true);
            }
        });

        // 4. Layering Actions
        document.getElementById('bring-to-front').addEventListener('click', () => {
            if (this.selectedId) {
                const zIndices = this.elements.map(el => (el.style && el.style.zIndex) || 0);
                const maxZ = Math.max(0, ...zIndices);
                triggerUpdate('zIndex', maxZ + 1, true);
            }
        });

        document.getElementById('send-to-back').addEventListener('click', () => {
            if (this.selectedId) {
                const zIndices = this.elements.map(el => (el.style && el.style.zIndex) || 0);
                const minZ = Math.min(0, ...zIndices);
                triggerUpdate('zIndex', minZ - 1, true);
            }
        });

        // 5. Delete Action
        document.getElementById('delete-element').addEventListener('click', () => {
            if (this.selectedId) {
                this.callbacks.onDelete(this.selectedId);
                this.selectElement(null);
            }
        });
    }

    /**
     * Updates the local element cache
     */
    setElements(elements) {
        this.elements = elements;
    }

    getElementData(id) {
        return this.elements.find(el => el.id === id);
    }

    /**
     * Handles element selection and visual highlighting
     */
    selectElement(id) {
        this.selectedId = id;

        // Remove selection from all, add to selected
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.toggle('selected', el.id === id);
        });

        if (!id) {
            this.panel.classList.add('hidden');
            this.emptyMsg.classList.remove('hidden');
            return;
        }

        const data = this.getElementData(id);
        if (!data) return;

        this.panel.classList.remove('hidden');
        this.emptyMsg.classList.add('hidden');

        // Update panel fields
        this.inputs.id.value = data.id;
        this.inputs.text.value = data.text;
        this.inputs.x.value = data.x;
        this.inputs.y.value = data.y;
        this.inputs.width.value = data.width;
        this.inputs.height.value = data.height;

        const bgColor = this.rgbToHex(data.style.backgroundColor);
        this.inputs.color.value = bgColor;
        this.inputs.colorHex.value = bgColor.toUpperCase();

        const textColor = this.rgbToHex(data.style.color);
        this.inputs.textColor.value = textColor;
        this.inputs.textColorHex.value = textColor.toUpperCase();
    }

    /**
     * Updates specific field values (used when dragging/resizing)
     */
    updateFieldValues(id, updates) {
        if (id !== this.selectedId) return;

        if (updates.x !== undefined) this.inputs.x.value = updates.x;
        if (updates.y !== undefined) this.inputs.y.value = updates.y;
        if (updates.width !== undefined) this.inputs.width.value = updates.width;
        if (updates.height !== undefined) this.inputs.height.value = updates.height;
        if (updates.text !== undefined) this.inputs.text.value = updates.text;
    }

    /**
     * Utility to convert color strings to Hex for input[type=color]
     */
    rgbToHex(col) {
        if (!col) return '#000000';
        if (col.startsWith('#')) return col;
        if (col === 'transparent') return '#FFFFFF';

        const rgb = col.match(/\d+/g);
        if (!rgb || rgb.length < 3) return '#000000';

        return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
    }
}

window.UIController = UIController;
