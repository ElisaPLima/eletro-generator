// ECG Templates / Presets
const ECGTemplates = {
    normal: {
        name: 'ECG Normal',
        parameters: {
            heartRate: 75,
            pWaveDuration: 0.10,
            pWaveAmplitude: 0.15,
            prInterval: 0.16,
            prLevel: 0,
            qrsWidth: 0.09,
            qrsAmplitude: 10,
            qtInterval: 0.40,
            stAmplitude: 0,
            tAmplitude: 0.30,
            uAmplitude: 0.05,
            arrhythmia: 'none',
            bundleBlock: 'none',
            pathology: 'none',
            pacemaker: 'none'
        }
    },
    
    'stemi-anterior': {
        name: 'IAM Anterior',
        parameters: {
            heartRate: 85,
            pWaveDuration: 0.10,
            pWaveAmplitude: 0.15,
            prInterval: 0.16,
            prLevel: 0,
            qrsWidth: 0.09,
            qrsAmplitude: 10,
            qtInterval: 0.42,
            stAmplitude: 0.30,
            tAmplitude: 0.35,
            uAmplitude: 0,
            arrhythmia: 'none',
            bundleBlock: 'none',
            pathology: 'stemi-anterior',
            pacemaker: 'none'
        }
    },
    
    afib: {
        name: 'Fibrilação Atrial',
        parameters: {
            heartRate: 120,
            pWaveDuration: 0.05,
            pWaveAmplitude: 0.03,
            prInterval: 0.14,
            prLevel: 0,
            qrsWidth: 0.08,
            qrsAmplitude: 8,
            qtInterval: 0.35,
            stAmplitude: 0,
            tAmplitude: 0.25,
            uAmplitude: 0,
            arrhythmia: 'afib',
            bundleBlock: 'none',
            pathology: 'none',
            pacemaker: 'none'
        }
    },
    
    lbbb: {
        name: 'BCRE (Bloqueio Completo de Ramo Esquerdo)',
        parameters: {
            heartRate: 70,
            pWaveDuration: 0.10,
            pWaveAmplitude: 0.15,
            prInterval: 0.18,
            prLevel: 0,
            qrsWidth: 0.14,
            qrsAmplitude: 12,
            qtInterval: 0.44,
            stAmplitude: -0.05,
            tAmplitude: 0.20,
            uAmplitude: 0,
            arrhythmia: 'none',
            bundleBlock: 'lbbb',
            pathology: 'none',
            pacemaker: 'none'
        }
    },
    
    lvh: {
        name: 'Hipertrofia Ventricular Esquerda',
        parameters: {
            heartRate: 65,
            pWaveDuration: 0.11,
            pWaveAmplitude: 0.18,
            prInterval: 0.17,
            prLevel: 0,
            qrsWidth: 0.10,
            qrsAmplitude: 18,
            qtInterval: 0.42,
            stAmplitude: -0.10,
            tAmplitude: 0.20,
            uAmplitude: 0,
            arrhythmia: 'none',
            bundleBlock: 'none',
            pathology: 'lvh',
            pacemaker: 'none'
        }
    },
    
    'stemi-inferior': {
        name: 'IAM Inferior',
        parameters: {
            heartRate: 55,
            pWaveDuration: 0.10,
            pWaveAmplitude: 0.15,
            prInterval: 0.16,
            prLevel: 0,
            qrsWidth: 0.09,
            qrsAmplitude: 10,
            qtInterval: 0.45,
            stAmplitude: 0.25,
            tAmplitude: 0.30,
            uAmplitude: 0,
            arrhythmia: 'none',
            bundleBlock: 'none',
            pathology: 'stemi-inferior',
            pacemaker: 'none'
        }
    },
    
    rbbb: {
        name: 'BCRD (Bloqueio Completo de Ramo Direito)',
        parameters: {
            heartRate: 72,
            pWaveDuration: 0.10,
            pWaveAmplitude: 0.15,
            prInterval: 0.16,
            prLevel: 0,
            qrsWidth: 0.13,
            qrsAmplitude: 11,
            qtInterval: 0.42,
            stAmplitude: 0,
            tAmplitude: 0.25,
            uAmplitude: 0,
            arrhythmia: 'none',
            bundleBlock: 'rbbb',
            pathology: 'none',
            pacemaker: 'none'
        }
    },
    
    vt: {
        name: 'Taquicardia Ventricular',
        parameters: {
            heartRate: 180,
            pWaveDuration: 0.08,
            pWaveAmplitude: 0.05,
            prInterval: 0.14,
            prLevel: 0,
            qrsWidth: 0.16,
            qrsAmplitude: 15,
            qtInterval: 0.30,
            stAmplitude: 0.05,
            tAmplitude: 0.30,
            uAmplitude: 0,
            arrhythmia: 'vt',
            bundleBlock: 'none',
            pathology: 'none',
            pacemaker: 'none'
        }
    }
};

// Template Manager
class TemplateManager {
    constructor() {
        this.setupEventListeners();
    }
    
    /**
     * Setup template button event listeners
     */
    setupEventListeners() {
        const templateButtons = document.querySelectorAll('.template-btn');
        templateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateName = e.target.dataset.template;
                this.loadTemplate(templateName);
            });
        });
    }
    
    /**
     * Load a template
     * @param {string} templateName - Template name
     */
    loadTemplate(templateName) {
        const template = ECGTemplates[templateName];
        if (!template) {
            console.error('Template not found:', templateName);
            return;
        }
        
        // Save current state to history
        stateManager.saveSnapshot();
        
        // Update state with template parameters
        stateManager.updateParameters(template.parameters);
        
        // Update UI
        parameterPanel.updateFromState(template.parameters);
        
        // Render ECG
        ecgCanvas.render();
        
        console.log('Loaded template:', template.name);
    }
    
    /**
     * Get all template names
     * @returns {Array} Template names
     */
    getTemplateNames() {
        return Object.keys(ECGTemplates);
    }
    
    /**
     * Get template by name
     * @param {string} name - Template name
     * @returns {Object} Template data
     */
    getTemplate(name) {
        return ECGTemplates[name];
    }
}

// Create global template manager instance
const templateManager = new TemplateManager();
