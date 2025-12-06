// Parameter Panel Controller
class ParameterPanel {
    constructor() {
        this.inputs = {};
        this.initializeInputs();
        this.attachEventListeners();
    }
    
    /**
     * Initialize all input elements
     */
    initializeInputs() {
        this.inputs = {
            heartRate: document.getElementById('heart-rate'),
            pWidth: document.getElementById('p-width'),
            qtInterval: document.getElementById('qt-interval'),
            stAmplitude: document.getElementById('st-amplitude'),
            prInterval: document.getElementById('pr-interval'),
            tAmplitude: document.getElementById('t-amplitude'),
            prLevel: document.getElementById('pr-level'),
            uAmplitude: document.getElementById('u-amplitude'),
            qrsWidth: document.getElementById('qrs-width'),
            qrsAmplitude: document.getElementById('qrs-amplitude'),
            arrhythmia: document.getElementById('arrhythmia-select'),
            bundleBlock: document.getElementById('bundle-block-select'),
            pathology: document.getElementById('pathology-select'),
            pacemaker: document.getElementById('pacemaker-select')
        };
    }
    
    /**
     * Attach event listeners to all inputs
     */
    attachEventListeners() {
        // Number inputs
        Object.keys(this.inputs).forEach(key => {
            const input = this.inputs[key];
            if (input && (input.type === 'number' || input.type === 'range')) {
                input.addEventListener('input', () => this.handleParameterChange(key));
            } else if (input && input.tagName === 'SELECT') {
                input.addEventListener('change', () => this.handleParameterChange(key));
            }
        });
    }
    
    /**
     * Handle parameter change
     * @param {string} paramName - Parameter name
     */
    handleParameterChange(paramName) {
        const input = this.inputs[paramName];
        let value;
        
        if (input.type === 'number' || input.type === 'range') {
            value = parseFloat(input.value);
        } else {
            value = input.value;
        }
        
        // Update state
        const mapping = {
            heartRate: 'heartRate',
            pWidth: 'pWaveDuration',
            qtInterval: 'qtInterval',
            stAmplitude: 'stAmplitude',
            prInterval: 'prInterval',
            tAmplitude: 'tAmplitude',
            prLevel: 'prLevel',
            uAmplitude: 'uAmplitude',
            qrsWidth: 'qrsWidth',
            qrsAmplitude: 'qrsAmplitude',
            arrhythmia: 'arrhythmia',
            bundleBlock: 'bundleBlock',
            pathology: 'pathology',
            pacemaker: 'pacemaker'
        };
        
        stateManager.updateParameter(mapping[paramName], value);
    }
    
    /**
     * Update UI from state
     * @param {Object} params - Parameters object
     */
    updateFromState(params) {
        if (this.inputs.heartRate) this.inputs.heartRate.value = params.heartRate;
        if (this.inputs.pWidth) this.inputs.pWidth.value = params.pWaveDuration;
        if (this.inputs.qtInterval) this.inputs.qtInterval.value = params.qtInterval;
        if (this.inputs.stAmplitude) this.inputs.stAmplitude.value = params.stAmplitude;
        if (this.inputs.prInterval) this.inputs.prInterval.value = params.prInterval;
        if (this.inputs.tAmplitude) this.inputs.tAmplitude.value = params.tAmplitude;
        if (this.inputs.prLevel) this.inputs.prLevel.value = params.prLevel;
        if (this.inputs.uAmplitude) this.inputs.uAmplitude.value = params.uAmplitude;
        if (this.inputs.qrsWidth) this.inputs.qrsWidth.value = params.qrsWidth;
        if (this.inputs.qrsAmplitude) this.inputs.qrsAmplitude.value = params.qrsAmplitude;
        if (this.inputs.arrhythmia) this.inputs.arrhythmia.value = params.arrhythmia;
        if (this.inputs.bundleBlock) this.inputs.bundleBlock.value = params.bundleBlock;
        if (this.inputs.pathology) this.inputs.pathology.value = params.pathology;
        if (this.inputs.pacemaker) this.inputs.pacemaker.value = params.pacemaker;
    }
}

// Create global parameter panel instance
const parameterPanel = new ParameterPanel();
