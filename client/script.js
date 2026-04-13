/**
 * script.js
 * 
 * Application Entry Point. Bootstraps the CanvasManager, UIController, DragEngine, and SocketClient.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize State Managers
    // CanvasManager manages the DOM elements and a local array of element data
    const canvasManager = new CanvasManager('canvas');
    const canvasElement = document.getElementById('canvas');

    // 2. Initialize UI Controller
    // UIController manages sidebar interactions and the property panel
    const ui = new UIController({
        onAdd: (newElement) => {
            // Add Locally
            canvasManager.addElementToLocal(newElement);
            // Sync with Server (if socket exists)
            if (window.socketClient) window.socketClient.emitAdd(newElement);
            // Select automatically
            ui.selectElement(newElement.id);
        },
        onUpdate: (id, updates) => {
            // Update Locally
            canvasManager.updateLocalElement(id, updates);
            // Sync with Server
            if (window.socketClient) window.socketClient.emitUpdate(id, updates);
        },
        onDelete: (id) => {
            // Remove Locally
            canvasManager.removeLocalElement(id);
            // Sync with Server
            if (window.socketClient) window.socketClient.emitDelete(id);
            // Deselect
            ui.selectElement(null);
        }
    });

    // 3. Initialize Socket Client (Collaboration)
    const initSocket = () => {
        window.socketClient = new SocketClient({
            onInit: (elements) => {
                canvasManager.elements = elements;
                canvasManager.reRenderCanvas();
                ui.setElements(elements);
            },
            onAdd: (element) => {
                canvasManager.addElementToLocal(element);
                ui.setElements(canvasManager.elements);
            },
            onMove: (id, x, y) => {
                canvasManager.updateLocalElement(id, { x, y });
                ui.updateFieldValues(id, { x, y });
            },
            onResize: (id, w, h) => {
                canvasManager.updateLocalElement(id, { width: w, height: h });
                ui.updateFieldValues(id, { width: w, height: h });
            },
            onUpdate: (id, updates) => {
                canvasManager.updateLocalElement(id, updates);
                ui.updateFieldValues(id, updates);
            },
            onDelete: (id) => {
                canvasManager.removeLocalElement(id);
                ui.setElements(canvasManager.elements);
                if (ui.selectedId === id) ui.selectElement(null);
            }
        });
    };

    // 4. Initialize Drag & Resize Engine
    // Handles mouse interactions on the canvas
    const dragEngine = new DragEngine(
        canvasElement,
        // When an element is moved
        (id, x, y) => {
            canvasManager.updateLocalElement(id, { x, y });
            ui.updateFieldValues(id, { x, y });
            if (window.socketClient) window.socketClient.emitMove(id, x, y);
        },
        // When an element is resized
        (id, width, height) => {
            canvasManager.updateLocalElement(id, { width, height });
            ui.updateFieldValues(id, { width, height });
            if (window.socketClient) window.socketClient.emitResize(id, width, height);
        },
        // When an element is clicked/selected
        (id) => {
            ui.selectElement(id);
        }
    );

    // Initial Sync (Wait for socket to be ready)
    if (typeof io !== 'undefined') {
        initSocket();
    } else {
        console.warn('Socket.IO not detected. Application running in local-only mode.');
    }

    // 5. Features: Export PNG (Active Implementation)
    document.getElementById('export-png').addEventListener('click', () => {
        const btn = document.getElementById('export-png');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;

        // Deselect element to avoid capturing selection borders
        const selectedId = ui.selectedId;
        ui.selectElement(null);

        html2canvas(canvasElement, {
            scale: 2, // Higher quality
            backgroundColor: '#ffffff',
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `wireframe-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Restore UI state
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (selectedId) ui.selectElement(selectedId);
        }).catch(err => {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    });

    console.log('✨ Collaborative Wireframing Tool: Complete Engine Initialized');
});
