/**
 * elements.js
 * 
 * Handles element creation, default styles, and element factory logic.
 */

/**
 * Default configurations for each component type
 */
const ELEMENT_DEFAULTS = {
    button: {
        width: 140,
        height: 48,
        text: 'Action Button',
        className: 'el-button',
        style: {
            backgroundColor: '#6366f1',
            color: '#ffffff'
        }
    },
    text: {
        width: 250,
        height: 80,
        text: 'Enter your text here. This is a customizable text block for your wireframe designs.',
        className: 'el-text',
        style: {
            backgroundColor: 'transparent',
            color: '#1e293b'
        }
    },
    input: {
        width: 300,
        height: 45,
        text: 'Type something...',
        className: 'el-input',
        style: {
            backgroundColor: '#ffffff',
            color: '#64748b'
        }
    },
    image: {
        width: 200,
        height: 150,
        text: '<i class="fas fa-image" style="font-size: 2rem; color: #cbd5e1;"></i>',
        className: 'el-image',
        style: {
            backgroundColor: '#f1f5f9',
            color: '#cbd5e1'
        }
    },
    card: {
        width: 320,
        height: 220,
        text: '<div style="padding: 15px; font-weight: 600;">Card Header</div>',
        className: 'el-card',
        style: {
            backgroundColor: '#ffffff',
            color: '#1e293b'
        }
    },
    navbar: {
        width: 1100,
        height: 64,
        text: '<div style="display: flex; justify-content: space-between; width: 100%; padding: 0 20px; align-items: center;"><strong>Logo</strong> <div style="display: flex; gap: 20px;"><span>Home</span><span>Features</span><span>Pricing</span></div></div>',
        className: 'el-navbar',
        style: {
            backgroundColor: '#1e293b',
            color: '#ffffff'
        }
    }
};

/**
 * Element Factory to create new element data objects
 */
function createNewElement(type, x, y, id = null) {
    const defaults = ELEMENT_DEFAULTS[type];
    if (!defaults) return null;

    return {
        id: id || `el_${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        x: x,
        y: y,
        width: defaults.width,
        height: defaults.height,
        text: defaults.text,
        style: { ...defaults.style },
        createdBy: 'local-user' // Will be updated by Socket.IO client
    };
}

// Global exposure for other modules
window.ELEMENT_DEFAULTS = ELEMENT_DEFAULTS;
window.createNewElement = createNewElement;
