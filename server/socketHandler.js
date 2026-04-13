/**
 * server/socketHandler.js
 * 
 * Handles real-time communication events between clients.
 * Manages the shared state of canvas elements in memory.
 */

const { generateId } = require('./utils');

// In-memory shared state for wireframe elements
let elements = [];

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        /**
         * INITIALIZATION
         * When a new user connects, send them the current state of the canvas.
         */
        socket.emit('init', elements);

        /**
         * CREATE ELEMENT
         * Receives a request to add a new component.
         * Assigns a unique ID and broadcasts the new element to all clients.
         */
        socket.on('addElement', (elementData) => {
            const newElement = {
                ...elementData,
                id: generateId(),
                createdBy: socket.id
            };

            elements.push(newElement);

            // Emit to everyone (including sender) to ensure everyone has the new ID
            io.emit('addElement', newElement);
            console.log(`Element added: ${newElement.id} by ${socket.id}`);
        });

        /**
         * MOVE ELEMENT
         * Receives coordinate updates for an existing element.
         * Updates the master state and broadcasts to all other clients.
         */
        socket.on('moveElement', (data) => {
            const { id, x, y } = data;
            const element = elements.find(el => el.id === id);

            if (element) {
                element.x = x;
                element.y = y;
                // Broadcast to all clients EXCEPT the sender for efficiency
                socket.broadcast.emit('moveElement', { id, x, y });
            }
        });

        /**
         * RESIZE ELEMENT
         * Receives dimension updates for an existing element.
         * Updates the master state and broadcasts to all other clients.
         */
        socket.on('resizeElement', (data) => {
            const { id, width, height } = data;
            const element = elements.find(el => el.id === id);

            if (element) {
                element.width = width;
                element.height = height;
                socket.broadcast.emit('resizeElement', { id, width, height });
            }
        });

        /**
         * UPDATE ELEMENT
         * Receives property updates (text, colors, etc.) for an existing element.
         */
        socket.on('updateElement', (data) => {
            const { id, updates } = data;
            const index = elements.findIndex(el => el.id === id);

            if (index !== -1) {
                elements[index] = { ...elements[index], ...updates };
                socket.broadcast.emit('updateElement', { id, updates });
            }
        });

        /**
         * DELETE ELEMENT
         * Removes an element from the shared state and notifies all clients.
         */
        socket.on('deleteElement', (id) => {
            elements = elements.filter(el => el.id !== id);
            io.emit('deleteElement', id); // Emit to all including sender
            console.log(`Element deleted: ${id}`);
        });

        /**
         * DISCONNECT
         */
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;
