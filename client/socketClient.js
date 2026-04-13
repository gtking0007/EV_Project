/**
 * client/socketClient.js
 * 
 * Logic to communicate with the Socket.IO server.
 * Handles both emitting local changes and listening for remote updates.
 */

class SocketClient {
    /**
     * @param {Object} callbacks - Functions to update the local canvas state
     */
    constructor(callbacks) {
        this.socket = io();
        this.onInit = callbacks.onInit;
        this.onAdd = callbacks.onAdd;
        this.onMove = callbacks.onMove;
        this.onResize = callbacks.onResize;
        this.onUpdate = callbacks.onUpdate;
        this.onDelete = callbacks.onDelete;

        this.setupListeners();
    }

    /**
     * Listen for events from the server
     */
    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to collaboration server');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.warn('Disconnected from server');
            this.updateConnectionStatus(false);
        });

        // Load initial state
        this.socket.on('init', (elements) => {
            if (this.onInit) this.onInit(elements);
        });

        // Listen for new elements
        this.socket.on('addElement', (element) => {
            if (this.onAdd) this.onAdd(element);
        });

        // Listen for position updates
        this.socket.on('moveElement', (data) => {
            if (this.onMove) this.onMove(data.id, data.x, data.y);
        });

        // Listen for resize updates
        this.socket.on('resizeElement', (data) => {
            if (this.onResize) this.onResize(data.id, data.width, data.height);
        });

        // Listen for property updates (text, style, etc.)
        this.socket.on('updateElement', (data) => {
            if (this.onUpdate) this.onUpdate(data.id, data.updates);
        });

        // Listen for deletions
        this.socket.on('deleteElement', (id) => {
            if (this.onDelete) this.onDelete(id);
        });
    }

    /**
     * API methods to emit change events to the server
     */

    emitAdd(elementData) {
        this.socket.emit('addElement', elementData);
    }

    emitMove(id, x, y) {
        this.socket.emit('moveElement', { id, x, y });
    }

    emitResize(id, width, height) {
        this.socket.emit('resizeElement', { id, width, height });
    }

    emitUpdate(id, updates) {
        this.socket.emit('updateElement', { id, updates });
    }

    emitDelete(id) {
        this.socket.emit('deleteElement', id);
    }

    /**
     * UI feedback for connection state
     */
    updateConnectionStatus(isOnline) {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');

        if (dot) dot.classList.toggle('online', isOnline);
        if (text) text.innerText = isOnline ? 'Connected' : 'Offline (Local Only)';
    }
}

window.SocketClient = SocketClient;
