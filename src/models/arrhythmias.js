// Arrhythmia Pattern Modifiers
const ArrhythmiaModifiers = {
    /**
     * Apply sinus bradycardia
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyBradycardia(baseSignal, params) {
        // Simply ensure heart rate < 60
        const newParams = { ...params, heartRate: Math.min(params.heartRate, 55) };
        return ecgGenerator.generateECG(newParams, baseSignal.duration);
    },
    
    /**
     * Apply atrial fibrillation
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyAtrialFibrillation(baseSignal, params) {
        const data = baseSignal.data.map((point, i) => {
            let mv = point.mv;
            
            // Remove P waves (replace with fibrillatory waves)
            const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
            if (beatPhase < 0.15) {
                // Add irregular fibrillatory oscillations instead of P wave
                mv = mv - point.mv * 0.8 + (Math.random() - 0.5) * 0.05;
            }
            
            // Add irregularly irregular RR intervals
            if (i > 0 && Math.random() < 0.01) {
                mv += (Math.random() - 0.5) * 0.3;
            }
            
            return { time: point.time, mv: mv };
        });
        
        return { ...baseSignal, data: data };
    },
    
    /**
     * Apply atrial flutter
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyAtrialFlutter(baseSignal, params) {
        const flutterRate = 300; // Typical atrial flutter rate
        const data = baseSignal.data.map((point, i) => {
            let mv = point.mv;
            
            // Add sawtooth flutter waves
            const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
            if (beatPhase < 0.4) {
                mv += 0.08 * Math.sin(2 * Math.PI * 4 * point.time);
            }
            
            return { time: point.time, mv: mv };
        });
        
        return { ...baseSignal, data: data };
    },
    
    /**
     * Apply ventricular tachycardia
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyVT(baseSignal, params) {
        // Wide QRS complexes, fast rate
        const newParams = {
            ...params,
            heartRate: Math.max(params.heartRate, 150),
            qrsWidth: 0.16, // Wide QRS > 120ms
            pWaveAmplitude: 0.02 // Diminished P waves (AV dissociation)
        };
        
        return ecgGenerator.generateECG(newParams, baseSignal.duration);
    },
    
    /**
     * Apply 1st degree AV block
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyAVBlock1(baseSignal, params) {
        // PR interval > 200ms
        const newParams = { ...params, prInterval: Math.max(params.prInterval, 0.22) };
        return ecgGenerator.generateECG(newParams, baseSignal.duration);
    },
    
    /**
     * Apply 2nd degree AV block - Mobitz I (Wenckebach)
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyAVBlock2Mobitz1(baseSignal, params) {
        // Progressive PR lengthening with dropped beats
        const data = [...baseSignal.data];
        let prExtension = 0;
        
        // This is simplified - would need more complex beat manipulation
        return { ...baseSignal, data: data };
    },
    
    /**
     * Apply 2nd degree AV block - Mobitz II
     * @param {Object} baseSignal - Base ECG signal
     * @param {Object} params - User parameters
     * @returns {Object} Modified signal
     */
    applyAVBlock2Mobitz2(baseSignal, params) {
        // Constant PR with intermittent dropped QRS
        // Simplified implementation
        return baseSignal;
    }
};

// Apply arrhythmia to signal
function applyArrhythmia(baseSignal, arrhythmiaType, params) {
    switch(arrhythmiaType) {
        case 'sinus-brady':
            return ArrhythmiaModifiers.applyBradycardia(baseSignal, params);
        case 'afib':
            return ArrhythmiaModifiers.applyAtrialFibrillation(baseSignal, params);
        case 'aflutter':
            return ArrhythmiaModifiers.applyAtrialFlutter(baseSignal, params);
        case 'vt':
            return ArrhythmiaModifiers.applyVT(baseSignal, params);
        case 'avblock-1':
            return ArrhythmiaModifiers.applyAVBlock1(baseSignal, params);
        case 'avblock-2-mobitz1':
            return ArrhythmiaModifiers.applyAVBlock2Mobitz1(baseSignal, params);
        case 'avblock-2-mobitz2':
            return ArrhythmiaModifiers.applyAVBlock2Mobitz2(baseSignal, params);
        default:
            return baseSignal;
    }
}
