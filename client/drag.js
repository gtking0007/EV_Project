/**
 * drag.js
 * 
 * Handles the logic for dragging existing elements and resizing them.
 */

class DragEngine {
    constructor(canvasContainer, onMove, onResize, onSelect) {
        this.canvas = canvasContainer;
        this.onMove = onMove;      // Callback to emit to server and update state
        this.onResize = onResize;  // Callback to emit to server and update state
        this.onSelect = onSelect;  // Callback when an element is clicked

        this.isDragging = false;
        this.isResizing = false;
        this.selectedElement = null;
        this.activeElementId = null;

        this.dragOffset = { x: 0, y: 0 };
        this.initialSize = { width: 0, height: 0, x: 0, y: 0 };

        this.init();
    }

    init() {
        // Event listeners for dragging elements and handles
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    /**
     * MouseDown: Start dragging or resizing
     */
    handleMouseDown(e) {
        const target = e.target;

        // 1. Check if clicking on a resize handle
        if (target.classList.contains('resize-handle')) {
            e.stopPropagation();
            this.isResizing = true;
            this.selectedElement = target.closest('.canvas-element');
            this.activeElementId = this.selectedElement.id;

            this.initialSize = {
                width: parseInt(this.selectedElement.style.width),
                height: parseInt(this.selectedElement.style.height),
                startX: e.clientX,
                startY: e.clientY
            };

            this.onSelect(this.activeElementId);
            return;
        }

        // 2. Check if clicking on an actual element
        const element = target.closest('.canvas-element');
        if (element) {
            e.stopPropagation();
            this.isDragging = true;
            this.selectedElement = element;
            this.activeElementId = element.id;

            // Highlight selected element
            this.onSelect(this.activeElementId);

            // Calculate drag offset
            const rect = element.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        } else {
            // Clicked on empty canvas
            this.onSelect(null);
            this.selectedElement = null;
            this.activeElementId = null;
        }
    }

    /**
     * MouseMove: Update position or size in real-time
     */
    handleMouseMove(e) {
        if (!this.selectedElement) return;

        // Handle Dragging Logic
        if (this.isDragging) {
            const canvasRect = this.canvas.getBoundingClientRect();
            let x = e.clientX - canvasRect.left - this.dragOffset.x;
            let y = e.clientY - canvasRect.top - this.dragOffset.y;

            // --- GRID SNAPPING (20px) ---
            const GRID_SIZE = 20;
            x = Math.round(x / GRID_SIZE) * GRID_SIZE;
            y = Math.round(y / GRID_SIZE) * GRID_SIZE;

            // Boundary protection
            x = Math.max(0, Math.min(x, this.canvas.clientWidth - parseInt(this.selectedElement.style.width)));
            y = Math.max(0, Math.min(y, this.canvas.clientHeight - parseInt(this.selectedElement.style.height)));

            // Update DOM position immediately for smooth movement
            this.selectedElement.style.left = `${x}px`;
            this.selectedElement.style.top = `${y}px`;

            // Emit to callback (Socket.IO and State updates)
            this.onMove(this.activeElementId, Math.round(x), Math.round(y));
        }

        // Handle Resizing Logic
        if (this.isResizing) {
            const deltaX = e.clientX - this.initialSize.startX;
            const deltaY = e.clientY - this.initialSize.startY;

            const newWidth = Math.max(50, this.initialSize.width + deltaX);
            const newHeight = Math.max(25, this.initialSize.height + deltaY);

            // Update DOM size immediately for smooth resizing
            this.selectedElement.style.width = `${newWidth}px`;
            this.selectedElement.style.height = `${newHeight}px`;

            // Emit to callback (Socket.IO and State updates)
            this.onResize(this.activeElementId, Math.round(newWidth), Math.round(newHeight));
        }
    }

    /**
     * MouseUp: Stop dragging/resizing
     */
    handleMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
        // Keep activeElementId for selection state until next mousedown
    }
}

// Global exposure for other modules
window.DragEngine = DragEngine;
