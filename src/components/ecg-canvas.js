// ECG Canvas Component - Manages rendering and updates
class ECGCanvas {
    constructor() {
        this.currentLeadData = null;
    }
    
    /**
     * Render ECG from current state
     */
    render() {
        const params = stateManager.getParameters();
        
        // Generate base ECG signal (Lead II as reference)
        let baseSignal = ecgGenerator.generateECG(params, 10);
        
        // Apply arrhythmia if selected
        if (params.arrhythmia !== 'none') {
            baseSignal = applyArrhythmia(baseSignal, params.arrhythmia, params);
        }
        
        // Calculate BPM from signal
        const peaks = ecgGenerator.findPeaks(baseSignal.data, baseSignal.samplingRate);
        const bpmData = ecgGenerator.calculateBPM(peaks);
        
        // Update calculated BPM display
        this.updateCalculatedBPM(bpmData.bpm);
        
        // Update metrics in state
        stateManager.updateMetrics({
            bpm: bpmData.bpm,
            rrInterval: bpmData.rrInterval,
            qtc: ecgGenerator.calculateQTc(params.qtInterval, bpmData.rrInterval)
        });
        
        // Generate all 12 leads
        let allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);
        
        // Apply bundle block if selected
        if (params.bundleBlock !== 'none') {
            allLeads = applyBundleBlock(allLeads, params.bundleBlock, params);
        }
        
        // Apply pathology if selected
        if (params.pathology !== 'none') {
            allLeads = applyPathology(allLeads, params.pathology, params);
        }
        
        // Store lead data
        this.currentLeadData = allLeads;
        stateManager.setLeadData(allLeads);
        
        // Render to canvas
        gridRenderer.render12LeadECG(allLeads, params);
    }
    
    /**
     * Update calculated BPM display
     * @param {number} bpm - Calculated BPM
     */
    updateCalculatedBPM(bpm) {
        const bpmDisplay = document.getElementById('calculated-bpm');
        if (bpmDisplay) {
            bpmDisplay.textContent = bpm;
        }
    }
    
    /**
     * Get current lead data
     * @returns {Object} Current lead data
     */
    getLeadData() {
        return this.currentLeadData;
    }
}

// Create global ECG canvas instance
const ecgCanvas = new ECGCanvas();
