// Main Application Entry Point
class ECGBuilderApp {
    constructor() {
        this.initialized = false;
    }
    
    /**
     * Initialize the application
     */
    initialize() {
        if (this.initialized) return;
        
        console.log('Initializing ECG Builder...');
        
        // Subscribe to state changes
        stateManager.subscribe((newState, prevState) => {
            this.onStateChange(newState, prevState);
        });
        
        // Initial render
        this.renderECG();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        this.initialized = true;
        console.log('ECG Builder initialized successfully');
    }
    
    /**
     * Handle state changes
     * @param {Object} newState - New state
     * @param {Object} prevState - Previous state
     */
    onStateChange(newState, prevState) {
        // Check if parameters changed
        const paramsChanged = JSON.stringify(newState.parameters) !== JSON.stringify(prevState.parameters);
        
        if (paramsChanged) {
            // Debounce rendering for performance
            this.debouncedRender();
        }
    }
    
    /**
     * Render ECG (with debouncing)
     */
    renderECG() {
        ecgCanvas.render();
    }
    
    /**
     * Debounced render function
     */
    debouncedRender = (() => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.renderECG(), 300);
        };
    })();
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z - Undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                stateManager.undo();
                parameterPanel.updateFromState(stateManager.getParameters());
                this.renderECG();
            }
            
            // Ctrl+S - Export PDF
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                exportManager.exportToPDF();
            }
            
            // Ctrl+R - Reset to defaults
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                if (confirm('Reset to default parameters?')) {
                    stateManager.reset();
                    parameterPanel.updateFromState(stateManager.getParameters());
                    this.renderECG();
                }
            }
            
            // Ctrl+A - Auto analyze
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                analysisEngine.performAnalysis();
            }
        });
    }
    
    /**
     * Get application info
     * @returns {Object} App info
     */
    getInfo() {
        return {
            name: 'ECG Builder',
            version: '1.0.0',
            description: 'Interactive 12-lead ECG Generator for Medical Education',
            author: 'ECG Builder Team',
            features: [
                '12-lead ECG rendering with D3.js',
                'Gaussian-based waveform generation',
                'Arrhythmia simulation',
                'Pathology patterns',
                'Automated ECG analysis',
                'PDF/JPG export',
                'Template presets',
                'Real-time parameter adjustment'
            ]
        };
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.ecgApp = new ECGBuilderApp();
    window.ecgApp.initialize();
    
    // Log app info
    console.log('ECG Builder v1.0.0');
    console.log('Ready to generate ECGs!');
    
    // Expose useful functions to console for debugging
    window.debugECG = {
        getState: () => stateManager.getState(),
        getParameters: () => stateManager.getParameters(),
        getLeadData: () => ecgCanvas.getLeadData(),
        analyze: () => analysisEngine.performAnalysis(),
        exportPDF: () => exportManager.exportToPDF(),
        exportJPG: () => exportManager.exportToJPG(),
        loadTemplate: (name) => templateManager.loadTemplate(name),
        templates: Object.keys(ECGTemplates)
    };
    
    console.log('Debug functions available in window.debugECG');
});
