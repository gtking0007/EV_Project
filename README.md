## Collaborative UI/UX Wireframing Tool

A real-time, production-quality collaborative design platform (simplified Figma alternative) where multiple users can design UI wireframes on a shared canvas.

## 🚀 Features

- **Real-time Collaboration**: Powered by Socket.IO for instant synchronization across all connected clients.
- **Draggable Components**: Drag and drop UI elements (Buttons, Inputs, Cards, etc.) from the library onto the canvas.
- **Property Editor**: Select any element to modify its text, position, size, and styling (colors).
- **Responsive Canvas**: A large design area with an interactive grid background and selection highlighting.
- **Clean Architecture**: Modular JavaScript structure separating concerns into UI, Canvas, Drag, and Socket logic.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Real-Time**: Socket.IO (WebSockets)

## 📁 Project Structure


```
├── client
│   ├── canvas.js
│   ├── drag.js
│   ├── elements.js
│   ├── index.html
│   ├── script.js
│   ├── socketClient.js
│   ├── style.css
│   └── ui.js
├── server
│   ├── routes.js
│   ├── server.js
│   ├── socketHandler.js
│   └── utils.js
├── README.md
├── package-lock.json
└── package.json
```

## ⚙️ Installation

1. **Clone the repository** (or navigate to the folder).
2. **Install dependencies**:
   `ash
   npm install
   `

## 🏃 Getting Started

To run the application locally:

`ash
node server/server.js
`

The application will be available at: [http://localhost:3000](http://localhost:3000)

## 🤝 How Collaboration Works

1. When a user connects, they receive the current state of the canvas from the server.
2. Every action (adding, moving, resizing, or editing an element) emits a WebSocket event.
3. The server broadcasts these updates to all other connected clients.
4. Clients receive events and update their local DOM in real-time, ensuring a synchronized experience.

---
