// AHA ACLS Critical Cardiac Rhythms
// Based on American Heart Association Advanced Cardiac Life Support Guidelines
// These are the life-threatening rhythms that ACLS providers must recognize

const ACLSRhythms = {
    /**
     * Ventricular Fibrillation (VFib)
     * Chaotic, irregular waveform with no discernible QRS complexes
     * Rate: Indeterminate, Rhythm: Chaotic
     */
    applyVentricularFibrillation(baseSignal, params) {
        const data = baseSignal.data.map(point => {
            // Completely chaotic waveform
            // Multiple frequencies (150-500 Hz oscillations)
            let vfib = 0;
            
            // Coarse VFib: larger amplitude (0.3-0.5 mV)
            // Fine VFib: smaller amplitude (0.05-0.2 mV)
            const amplitude = params.vfibType === 'fine' ? 0.1 : 0.4;
            
            // Mix multiple frequencies for chaotic appearance
            for (let i = 0; i < 5; i++) {
                const freq = 3 + Math.random() * 7; // 3-10 Hz dominant
                const phase = Math.random() * Math.PI * 2;
                vfib += Math.sin(2 * Math.PI * freq * point.time + phase);
            }
            
            // Add random noise
            vfib += (Math.random() - 0.5) * 0.5;
            
            return {
                time: point.time,
                mv: vfib * amplitude / 5
            };
        });
        
        return { ...baseSignal, data: data };
    },
    
    /**
     * Pulseless Electrical Activity (PEA)
     * Organized electrical activity but no mechanical contraction
     * Appears as slow, wide QRS complexes with no pulse
     */
    applyPulselessElectricalActivity(baseSignal, params) {
        // Generate slow, wide complexes (bradycardic rate, wide QRS)
        const peaParams = {
            ...params,
            heartRate: 40 + Math.random() * 20, // 40-60 bpm
            qrsWidth: 0.14 + Math.random() * 0.04, // Wide QRS (140-180ms)
            qrsAmplitude: 5 + Math.random() * 3, // Variable amplitude
            pWaveAmplitude: 0.05, // Diminished P waves
            tAmplitude: 0.1 // Small T waves
        };
        
        return ecgGeneratorBeta.generateECG(peaParams, baseSignal.duration);
    },
    
    /**
     * Asystole
     * Flat line - no electrical activity
     * May have occasional P waves (ventricular standstill)
     */
    applyAsystole(baseSignal, params) {
        const data = baseSignal.data.map(point => {
            let mv = 0;
            
            // Add minimal baseline wander for realism
            mv += 0.02 * Math.sin(2 * Math.PI * 0.2 * point.time);
            
            // Occasional P wave if ventricular standstill
            if (params.asystoleType === 'ventricular-standstill') {
                const beatTime = point.time % (60 / 60); // 60 bpm P waves
                if (beatTime < 0.1) {
                    mv += 0.15 * Math.exp(-Math.pow((beatTime - 0.05) / 0.02, 2));
                }
            }
            
            return {
                time: point.time,
                mv: mv
            };
        });
        
        return { ...baseSignal, data: data };
    },
    
    /**
     * Complete Heart Block (3rd Degree AV Block)
     * Complete AV dissociation - P waves and QRS independent
     * P rate: 60-100 bpm, Ventricular rate: 20-40 bpm
     */
    applyCompleteHeartBlock(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        const atrialRate = 75; // P wave rate
        const ventricularRate = 35; // QRS rate (escape rhythm)
        
        for (let i = 0; i < duration * fs; i++) {
            const t = i / fs;
            let mv = 0;
            
            // Generate independent P waves
            const pInterval = 60 / atrialRate;
            const pPhase = (t % pInterval) / pInterval;
            if (pPhase < 0.15) {
                mv += 0.15 * Math.exp(-Math.pow((pPhase - 0.075) / 0.025, 2));
            }
            
            // Generate independent wide QRS (ventricular escape)
            const qrsInterval = 60 / ventricularRate;
            const qrsPhase = (t % qrsInterval) / qrsInterval;
            
            if (qrsPhase < 0.1) {
                // Wide QRS complex (escape rhythm)
                const qrsT = (qrsPhase - 0.05) / 0.04;
                mv += 0.8 * Math.exp(-Math.pow(qrsT / 0.3, 2));
            }
            
            // T wave after QRS
            if (qrsPhase > 0.15 && qrsPhase < 0.4) {
                const tT = (qrsPhase - 0.25) / 0.15;
                mv += 0.3 * Math.exp(-Math.pow(tT, 2));
            }
            
            data.push({
                time: t,
                mv: mv
            });
        }
        
        return { ...baseSignal, data: data };
    },
    
    /**
     * Torsades de Pointes (Polymorphic VT)
     * "Twisting of the points" - QRS axis rotates
     * Rate: 200-250 bpm with varying amplitude
     */
    applyTorsades(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        const rate = 220; // Typical rate
        
        for (let i = 0; i < duration * fs; i++) {
            const t = i / fs;
            
            // Sinusoidal amplitude modulation (twisting)
            const twistFreq = 1.5; // Complete twist every ~0.7 seconds
            const amplitudeModulation = Math.sin(2 * Math.PI * twistFreq * t);
            
            // Rapid irregular complexes
            const beatInterval = 60 / rate;
            const beatPhase = (t % beatInterval) / beatInterval;
            
            let mv = 0;
            if (beatPhase < 0.3) {
                // Wide, irregular QRS
                mv = amplitudeModulation * 0.6 * Math.sin(Math.PI * beatPhase / 0.3);
            }
            
            // Add irregularity
            mv += (Math.random() - 0.5) * 0.1;
            
            data.push({
                time: t,
                mv: mv
            });
        }
        
        return { ...baseSignal, data: data };
    },
    
    /**
     * Pulseless Ventricular Tachycardia
     * Wide, regular, rapid QRS complexes
     * Rate: 150-250 bpm
     */
    applyPulselessVT(baseSignal, params) {
        const vtParams = {
            ...params,
            heartRate: 180 + Math.random() * 40, // 180-220 bpm
            qrsWidth: 0.16 + Math.random() * 0.04, // Wide QRS (160-200ms)
            qrsAmplitude: 12 + Math.random() * 4,
            pWaveAmplitude: 0, // No P waves
            tAmplitude: 0.15 // Small T waves
        };
        
        return ecgGeneratorBeta.generateECG(vtParams, baseSignal.duration);
    },
    
    /**
     * Agonal Rhythm (Dying Heart)
     * Very slow, wide, irregular ventricular complexes
     * Rate: < 20 bpm, very poor prognosis
     */
    applyAgonalRhythm(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        // Very slow, irregular rate
        let nextBeat = Math.random() * 3; // Random first beat
        
        for (let i = 0; i < duration * fs; i++) {
            const t = i / fs;
            let mv = 0;
            
            // Baseline wander
            mv += 0.03 * Math.sin(2 * Math.PI * 0.15 * t);
            
            // Occasional wide, bizarre QRS
            if (Math.abs(t - nextBeat) < 0.15) {
                const beatPhase = (t - nextBeat + 0.15) / 0.3;
                if (beatPhase >= 0 && beatPhase <= 1) {
                    // Wide, bizarre complex
                    mv += 0.4 * Math.sin(Math.PI * beatPhase) * (1 + (Math.random() - 0.5) * 0.3);
                }
            }
            
            // Schedule next beat (very irregular, 3-8 seconds apart)
            if (t > nextBeat + 0.3) {
                if (Math.random() < 0.01) { // Check each iteration
                    nextBeat = t + 3 + Math.random() * 5;
                }
            }
            
            data.push({
                time: t,
                mv: mv
            });
        }
        
        return { ...baseSignal, data: data };
    }
};

/**
 * Apply ACLS rhythm pattern
 */
function applyACLSRhythm(baseSignal, rhythmType, params) {
    switch(rhythmType) {
        case 'vfib':
            return ACLSRhythms.applyVentricularFibrillation(baseSignal, params);
        case 'vfib-coarse':
            return ACLSRhythms.applyVentricularFibrillation(baseSignal, {...params, vfibType: 'coarse'});
        case 'vfib-fine':
            return ACLSRhythms.applyVentricularFibrillation(baseSignal, {...params, vfibType: 'fine'});
        case 'pea':
            return ACLSRhythms.applyPulselessElectricalActivity(baseSignal, params);
        case 'asystole':
            return ACLSRhythms.applyAsystole(baseSignal, {...params, asystoleType: 'complete'});
        case 'ventricular-standstill':
            return ACLSRhythms.applyAsystole(baseSignal, {...params, asystoleType: 'ventricular-standstill'});
        case 'complete-heart-block':
        case '3rd-degree-av-block':
            return ACLSRhythms.applyCompleteHeartBlock(baseSignal, params);
        case 'torsades':
        case 'polymorphic-vt':
            return ACLSRhythms.applyTorsades(baseSignal, params);
        case 'pulseless-vt':
            return ACLSRhythms.applyPulselessVT(baseSignal, params);
        case 'agonal':
            return ACLSRhythms.applyAgonalRhythm(baseSignal, params);
        default:
            return baseSignal;
    }
}
