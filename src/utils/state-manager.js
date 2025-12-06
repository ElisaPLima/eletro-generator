// State Management System
class ECGStateManager {
    constructor() {
        this.state = {
            parameters: { ...DEFAULT_PARAMETERS },
            waveformData: null,
            leadData: null,
            calculatedMetrics: {
                bpm: 76,
                rrInterval: 0,
                qtc: 0,
                axis: 0
            },
            analysis: null,
            history: [],
            maxHistorySize: 20
        };
        
        this.listeners = [];
    }
    
    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function to execute on state change
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    /**
     * Update state and notify listeners
     * @param {Object} updates - Partial state updates
     */
    setState(updates) {
        const prevState = { ...this.state };
        this.state = {
            ...this.state,
            ...updates
        };
        
        this.notifyListeners(prevState);
    }
    
    /**
     * Update a specific parameter
     * @param {string} paramName - Parameter name
     * @param {*} value - New value
     */
    updateParameter(paramName, value) {
        this.setState({
            parameters: {
                ...this.state.parameters,
                [paramName]: value
            }
        });
    }
    
    /**
     * Update multiple parameters at once
     * @param {Object} params - Object with parameter key-value pairs
     */
    updateParameters(params) {
        this.setState({
            parameters: {
                ...this.state.parameters,
                ...params
            }
        });
    }
    
    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    }
    
    /**
     * Get specific parameter value
     * @param {string} paramName - Parameter name
     * @returns {*} Parameter value
     */
    getParameter(paramName) {
        return this.state.parameters[paramName];
    }
    
    /**
     * Get all parameters
     * @returns {Object} All parameters
     */
    getParameters() {
        return this.state.parameters;
    }
    
    /**
     * Notify all listeners of state change
     * @param {Object} prevState - Previous state
     */
    notifyListeners(prevState) {
        this.listeners.forEach(listener => {
            listener(this.state, prevState);
        });
    }
    
    /**
     * Save current state to history
     */
    saveSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            parameters: { ...this.state.parameters },
            calculatedMetrics: { ...this.state.calculatedMetrics }
        };
        
        this.state.history.push(snapshot);
        
        // Limit history size
        if (this.state.history.length > this.state.maxHistorySize) {
            this.state.history.shift();
        }
    }
    
    /**
     * Restore state from history
     * @param {number} index - History index (-1 for most recent)
     */
    restoreSnapshot(index = -1) {
        if (this.state.history.length === 0) return;
        
        const snapshotIndex = index < 0 
            ? this.state.history.length + index 
            : index;
            
        if (snapshotIndex >= 0 && snapshotIndex < this.state.history.length) {
            const snapshot = this.state.history[snapshotIndex];
            this.setState({
                parameters: { ...snapshot.parameters },
                calculatedMetrics: { ...snapshot.calculatedMetrics }
            });
        }
    }
    
    /**
     * Undo last change
     */
    undo() {
        if (this.state.history.length > 1) {
            this.state.history.pop(); // Remove current state
            this.restoreSnapshot(-1); // Restore previous
        }
    }
    
    /**
     * Reset to default parameters
     */
    reset() {
        this.saveSnapshot();
        this.setState({
            parameters: { ...DEFAULT_PARAMETERS },
            analysis: null
        });
    }
    
    /**
     * Update calculated metrics
     * @param {Object} metrics - Calculated metrics
     */
    updateMetrics(metrics) {
        this.setState({
            calculatedMetrics: {
                ...this.state.calculatedMetrics,
                ...metrics
            }
        });
    }
    
    /**
     * Set waveform data
     * @param {Object} data - Waveform data for all leads
     */
    setWaveformData(data) {
        this.setState({
            waveformData: data
        });
    }
    
    /**
     * Set lead data
     * @param {Object} data - Lead-specific data
     */
    setLeadData(data) {
        this.setState({
            leadData: data
        });
    }
    
    /**
     * Set analysis results
     * @param {Object} analysis - Analysis results
     */
    setAnalysis(analysis) {
        this.setState({
            analysis: analysis
        });
    }
}

// Create global state manager instance
const stateManager = new ECGStateManager();
