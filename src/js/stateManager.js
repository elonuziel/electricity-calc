/**
 * Simple EventEmitter pattern for state management
 * Allows components to subscribe to state changes
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listenerToRemove) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
}

/**
 * Undo manager for tracking state changes
 */
class UndoManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.undoTimeouts = {};
    }

    /**
     * Push a new operation to history
     */
    push(operation) {
        // Remove any redo history
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Add new operation
        this.history.push(operation);
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > CONFIG.UNDO.MAX_HISTORY_SIZE) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    /**
     * Undo last operation
     */
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const operation = this.history[this.currentIndex];
            return operation;
        }
        return null;
    }

    /**
     * Clear undo history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Show undo toast with expirable button
     */
    showUndoToast(message, callback) {
        const toastId = `undo-${Date.now()}`;
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = 'fixed bottom-4 right-4 p-4 rounded-lg text-white bg-blue-500 max-w-sm z-40 flex justify-between items-center gap-4';
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="if(window.undoCallback) window.undoCallback(); this.parentElement.remove();" class="bg-white text-blue-500 px-3 py-1 rounded font-semibold hover:bg-blue-50">
                בטל
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after timeout
        const timeout = setTimeout(() => {
            const el = document.getElementById(toastId);
            if (el) el.remove();
            delete this.undoTimeouts[toastId];
        }, CONFIG.UNDO.EXPIRY_TIME);
        
        this.undoTimeouts[toastId] = timeout;
        window.undoCallback = callback;
    }
}

/**
 * Centralized state manager with encapsulation
 * Replaces scattered global variables with structured state + events
 */
class StateManager extends EventEmitter {
    constructor() {
        super();
        this._bills = [];
        this._initialSettings = { top: null, bottom: null };
        this._editingBillId = null;
        this.undoManager = new UndoManager();
        
        // Load persisted state
        this._loadFromStorage();
    }

    /**
     * Load state from localStorage
     */
    _loadFromStorage() {
        try {
            const savedBills = localStorage.getItem('elecBills');
            const savedSettings = localStorage.getItem('elecSettings');
            
            if (savedBills) this._bills = JSON.parse(savedBills);
            if (savedSettings) this._initialSettings = JSON.parse(savedSettings);
        } catch (error) {
            console.error('Error loading state from storage:', error);
        }
    }

    /**
     * Persist state to localStorage
     */
    _saveToStorage() {
        safeLocalStorageSet('elecBills', JSON.stringify(this._bills));
        safeLocalStorageSet('elecSettings', JSON.stringify(this._initialSettings));
    }

    // ===== BILLS GETTERS/SETTERS =====

    /**
     * Get all bills (read-only copy)
     */
    getBills() {
        return JSON.parse(JSON.stringify(this._bills));
    }

    /**
     * Set bills and notify listeners
     */
    setBills(bills) {
        this._bills = bills;
        this._saveToStorage();
        this.emit('bills:updated', this.getBills());
    }

    /**
     * Add a new bill
     */
    addBill(bill) {
        const billId = generateUniqueId();
        const newBill = { ...bill, id: billId };
        
        // Check for duplicate ID
        if (this._bills.some(b => b.id === billId)) {
            throw new Error('Failed to generate unique bill ID');
        }
        
        this._bills.push(newBill);
        this._bills.sort((a, b) => new Date(a.date) - new Date(b.date));
        this._saveToStorage();
        this.emit('bills:updated', this.getBills());
        return newBill;
    }

    /**
     * Update existing bill
     */
    updateBill(billId, updates) {
        const index = this._bills.findIndex(b => b.id === billId);
        if (index === -1) {
            throw new Error(`Bill with ID ${billId} not found`);
        }
        
        this._bills[index] = { ...this._bills[index], ...updates };
        this._bills.sort((a, b) => new Date(a.date) - new Date(b.date));
        this._saveToStorage();
        this.emit('bills:updated', this.getBills());
    }

    /**
     * Delete bill
     */
    deleteBill(billId) {
        const index = this._bills.findIndex(b => b.id === billId);
        if (index === -1) {
            throw new Error(`Bill with ID ${billId} not found`);
        }
        
        const deletedBill = this._bills[index];
        this._bills.splice(index, 1);
        this._saveToStorage();
        this.emit('bills:updated', this.getBills());
        
        // Record in undo history
        this.undoManager.push({
            type: 'delete',
            bill: deletedBill,
            undo: () => {
                this._bills.push(deletedBill);
                this._bills.sort((a, b) => new Date(a.date) - new Date(b.date));
                this._saveToStorage();
                this.emit('bills:updated', this.getBills());
            }
        });
        
        // Show undo toast
        this.undoManager.showUndoToast(
            'חשבונית נמחקה',
            () => {
                const op = this.undoManager.undo();
                if (op) op.undo();
            }
        );
        
        return deletedBill;
    }

    /**
     * Get bill by ID
     */
    getBillById(billId) {
        const bill = this._bills.find(b => b.id === billId);
        return bill ? JSON.parse(JSON.stringify(bill)) : null;
    }

    // ===== SETTINGS GETTERS/SETTERS =====

    /**
     * Get settings (read-only copy)
     */
    getSettings() {
        return JSON.parse(JSON.stringify(this._initialSettings));
    }

    /**
     * Set settings and notify listeners
     */
    setSettings(settings) {
        this._initialSettings = settings;
        this._saveToStorage();
        this.emit('settings:updated', this.getSettings());
    }

    /**
     * Check if initial readings are set
     */
    hasInitialReadings() {
        return this._initialSettings.top !== null && this._initialSettings.bottom !== null;
    }

    // ===== EDITING STATE =====

    /**
     * Get ID of bill being edited
     */
    getEditingBillId() {
        return this._editingBillId;
    }

    /**
     * Set bill being edited
     */
    setEditingBillId(billId) {
        this._editingBillId = billId;
        this.emit('editing:changed', billId);
    }

    // ===== BULK OPERATIONS =====

    /**
     * Replace all data (for restore operations)
     */
    replaceAll(bills, settings) {
        this._bills = bills || [];
        this._initialSettings = settings || { top: null, bottom: null };
        this._bills.sort((a, b) => new Date(a.date) - new Date(b.date));
        this._saveToStorage();
        this.emit('bills:updated', this.getBills());
        this.emit('settings:updated', this.getSettings());
    }

    /**
     * Clear all data
     */
    clearAll() {
        this._bills = [];
        this._initialSettings = { top: null, bottom: null };
        this._editingBillId = null;
        localStorage.removeItem('elecBills');
        localStorage.removeItem('elecSettings');
        this.emit('bills:updated', this.getBills());
        this.emit('settings:updated', this.getSettings());
    }
}

/**
 * Global state manager instance
 * Import and use: state.getBills(), state.setBills(), etc.
 */
const state = new StateManager();
