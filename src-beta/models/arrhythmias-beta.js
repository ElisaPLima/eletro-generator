// Enhanced Arrhythmia Pattern Modifiers - Beta Version
// Improved realism and accuracy for common arrhythmias

const ArrhythmiaModifiersBeta = {
    /**
     * Enhanced Atrial Fibrillation
     * - Irregularly irregular rhythm
     * - No P waves (replaced by fibrillatory waves)
     * - Variable RR intervals
     */
    applyAtrialFibrillation(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        let currentTime = 0;
        const baseRR = 60 / params.heartRate;
        
        while (currentTime < duration) {
            // Irregularly irregular - vary RR by ±40%
            const rrVariation = 0.6 + Math.random() * 0.8; // 0.6 to 1.4 times base
            const thisRR = baseRR * rrVariation;
            
            // Generate QRS complex without P wave
            const samplesThisBeat = Math.floor(thisRR * fs);
            
            for (let i = 0; i < samplesThisBeat && currentTime < duration; i++) {
                const beatPhase = i / samplesThisBeat;
                let mv = 0;
                
                // Fibrillatory waves (irregular baseline)
                const fWaveFreq = 4 + Math.random() * 3; // 4-7 Hz
                mv += 0.03 * Math.sin(2 * Math.PI * fWaveFreq * currentTime);
                mv += (Math.random() - 0.5) * 0.02; // Random component
                
                // QRS complex (normal width)
                if (beatPhase > 0.3 && beatPhase < 0.4) {
                    const qrsPhase = (beatPhase - 0.3) / 0.1;
                    // Normal QRS morphology
                    if (qrsPhase < 0.2) {
                        mv += -0.1; // Q wave
                    } else if (qrsPhase < 0.5) {
                        mv += 0.8; // R wave
                    } else {
                        mv += -0.2; // S wave
                    }
                }
                
                // T wave
                if (beatPhase > 0.5 && beatPhase < 0.7) {
                    const tPhase = (beatPhase - 0.5) / 0.2;
                    mv += 0.3 * Math.exp(-Math.pow((tPhase - 0.5) / 0.3, 2));
                }
                
                data.push({
                    time: currentTime,
                    mv: mv
                });
                
                currentTime += 1 / fs;
            }
        }
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv),
            samplingRate: fs,
            duration: duration
        };
    },
    
    /**
     * Enhanced Atrial Flutter
     * - Regular "sawtooth" flutter waves
     * - Flutter rate ~300 bpm
     * - Variable AV conduction (2:1, 3:1, 4:1)
     */
    applyAtrialFlutter(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        const flutterRate = 300; // Atrial flutter rate
        const flutterInterval = 60 / flutterRate;
        const avBlock = params.avBlock || 2; // 2:1, 3:1, or 4:1
        const ventricularRate = flutterRate / avBlock;
        
        let flutterCount = 0;
        
        for (let i = 0; i < duration * fs; i++) {
            const t = i / fs;
            let mv = 0;
            
            // Sawtooth flutter waves
            const flutterPhase = (t % flutterInterval) / flutterInterval;
            // Sawtooth pattern (negative in inferior leads)
            mv += -0.15 * (1 - 2 * flutterPhase);
            
            // QRS every N flutter waves
            const currentFlutter = Math.floor(t / flutterInterval);
            if (currentFlutter % avBlock === 0) {
                const timeSinceQRS = t - (currentFlutter * flutterInterval);
                if (timeSinceQRS < 0.1) {
                    const qrsPhase = timeSinceQRS / 0.1;
                    // QRS complex
                    if (qrsPhase < 0.2) {
                        mv += -0.1;
                    } else if (qrsPhase < 0.5) {
                        mv += 0.8;
                    } else {
                        mv += -0.2;
                    }
                }
                
                // T wave
                if (timeSinceQRS > 0.15 && timeSinceQRS < 0.35) {
                    const tPhase = (timeSinceQRS - 0.15) / 0.2;
                    mv += 0.25 * Math.exp(-Math.pow((tPhase - 0.5) / 0.3, 2));
                }
            }
            
            data.push({
                time: t,
                mv: mv
            });
        }
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv),
            samplingRate: fs,
            duration: duration
        };
    },
    
    /**
     * Enhanced Ventricular Tachycardia (Monomorphic)
     * - Wide QRS > 120ms
     * - Rate 150-250 bpm
     * - Regular rhythm
     * - AV dissociation (independent P waves)
     */
    applyVentricularTachycardia(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        const vtRate = 180; // Typical VT rate
        const vtInterval = 60 / vtRate;
        const atrialRate = 80; // Independent sinus rate
        const atrialInterval = 60 / atrialRate;
        
        for (let i = 0; i < duration * fs; i++) {
            const t = i / fs;
            let mv = 0;
            
            // Wide ventricular complexes
            const vtPhase = (t % vtInterval) / vtInterval;
            if (vtPhase < 0.25) {
                // Wide, bizarre QRS
                const qrsPhase = vtPhase / 0.25;
                mv += 0.9 * Math.sin(Math.PI * qrsPhase) * (1 + 0.2 * Math.sin(2 * Math.PI * qrsPhase));
            }
            
            // Discordant T wave
            if (vtPhase > 0.3 && vtPhase < 0.6) {
                const tPhase = (vtPhase - 0.3) / 0.3;
                mv += -0.3 * Math.exp(-Math.pow((tPhase - 0.5) / 0.3, 2));
            }
            
            // Independent P waves (AV dissociation)
            const atrialPhase = (t % atrialInterval) / atrialInterval;
            if (atrialPhase < 0.1) {
                mv += 0.08 * Math.exp(-Math.pow((atrialPhase - 0.05) / 0.02, 2));
            }
            
            data.push({
                time: t,
                mv: mv
            });
        }
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv),
            samplingRate: fs,
            duration: duration
        };
    },
    
    /**
     * Enhanced 1st Degree AV Block
     * - PR interval > 200ms (prolonged)
     * - All P waves conducted
     * - Regular rhythm
     */
    applyFirstDegreeAVBlock(baseSignal, params) {
        // Simply prolong PR interval
        const modifiedParams = {
            ...params,
            prInterval: Math.max(0.24, params.prInterval) // At least 240ms
        };
        
        return ecgGeneratorBeta.generateECG(modifiedParams, baseSignal.duration);
    },
    
    /**
     * Enhanced 2nd Degree AV Block - Mobitz I (Wenckebach)
     * - Progressive PR lengthening
     * - Dropped QRS after longest PR
     * - Grouped beating pattern
     */
    applyMobitz1(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        const baseHeartRate = 70;
        const basePR = 0.16; // Start with normal PR
        const prIncrement = 0.04; // Increase by 40ms each beat
        const cycleLength = 4; // Drop every 4th beat
        
        let beatNumber = 0;
        let currentTime = 0;
        
        while (currentTime < duration) {
            const beatInCycle = beatNumber % cycleLength;
            const thisPR = basePR + (prIncrement * beatInCycle);
            const shouldDrop = (beatInCycle === cycleLength - 1);
            
            const beatInterval = 60 / baseHeartRate;
            const samplesThisBeat = Math.floor(beatInterval * fs);
            
            for (let i = 0; i < samplesThisBeat && currentTime < duration; i++) {
                const beatPhase = i / samplesThisBeat;
                let mv = 0;
                
                // P wave
                if (beatPhase < 0.1) {
                    mv += 0.15 * Math.exp(-Math.pow((beatPhase - 0.05) / 0.02, 2));
                }
                
                // QRS (dropped on last beat of cycle)
                if (!shouldDrop) {
                    const qrsStart = thisPR / beatInterval;
                    if (beatPhase > qrsStart && beatPhase < qrsStart + 0.1) {
                        const qrsPhase = (beatPhase - qrsStart) / 0.1;
                        if (qrsPhase < 0.2) {
                            mv += -0.1;
                        } else if (qrsPhase < 0.5) {
                            mv += 0.8;
                        } else {
                            mv += -0.2;
                        }
                    }
                    
                    // T wave
                    if (beatPhase > qrsStart + 0.2 && beatPhase < qrsStart + 0.45) {
                        const tPhase = (beatPhase - qrsStart - 0.2) / 0.25;
                        mv += 0.3 * Math.exp(-Math.pow((tPhase - 0.5) / 0.3, 2));
                    }
                }
                
                data.push({
                    time: currentTime,
                    mv: mv
                });
                
                currentTime += 1 / fs;
            }
            
            beatNumber++;
        }
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv),
            samplingRate: fs,
            duration: duration
        };
    },
    
    /**
     * Enhanced 2nd Degree AV Block - Mobitz II
     * - Constant PR interval
     * - Intermittent dropped QRS
     * - Higher risk of progression to complete block
     */
    applyMobitz2(baseSignal, params) {
        const data = [];
        const fs = baseSignal.samplingRate || 500;
        const duration = baseSignal.duration || 10;
        
        const baseHeartRate = 70;
        const prInterval = 0.18; // Constant PR
        const dropRatio = 3; // Drop every 3rd or 4th beat randomly
        
        let beatNumber = 0;
        let currentTime = 0;
        
        while (currentTime < duration) {
            // Randomly drop beat (simulating intermittent block)
            const shouldDrop = (beatNumber % dropRatio === 0) && (beatNumber > 0);
            
            const beatInterval = 60 / baseHeartRate;
            const samplesThisBeat = Math.floor(beatInterval * fs);
            
            for (let i = 0; i < samplesThisBeat && currentTime < duration; i++) {
                const beatPhase = i / samplesThisBeat;
                let mv = 0;
                
                // P wave (always present)
                if (beatPhase < 0.1) {
                    mv += 0.15 * Math.exp(-Math.pow((beatPhase - 0.05) / 0.02, 2));
                }
                
                // QRS (dropped intermittently)
                if (!shouldDrop) {
                    const qrsStart = prInterval / beatInterval;
                    if (beatPhase > qrsStart && beatPhase < qrsStart + 0.1) {
                        const qrsPhase = (beatPhase - qrsStart) / 0.1;
                        // Often wide QRS in Mobitz II
                        if (qrsPhase < 0.3) {
                            mv += -0.1;
                        } else if (qrsPhase < 0.6) {
                            mv += 0.8;
                        } else {
                            mv += -0.2;
                        }
                    }
                    
                    // T wave
                    if (beatPhase > qrsStart + 0.2 && beatPhase < qrsStart + 0.45) {
                        const tPhase = (beatPhase - qrsStart - 0.2) / 0.25;
                        mv += 0.3 * Math.exp(-Math.pow((tPhase - 0.5) / 0.3, 2));
                    }
                }
                
                data.push({
                    time: currentTime,
                    mv: mv
                });
                
                currentTime += 1 / fs;
            }
            
            beatNumber++;
        }
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv),
            samplingRate: fs,
            duration: duration
        };
    }
};

/**
 * Apply enhanced arrhythmia patterns
 */
function applyArrhythmiaBeta(baseSignal, arrhythmiaType, params) {
    switch(arrhythmiaType) {
        case 'afib':
            return ArrhythmiaModifiersBeta.applyAtrialFibrillation(baseSignal, params);
        case 'aflutter':
        case 'aflutter-2to1':
            return ArrhythmiaModifiersBeta.applyAtrialFlutter(baseSignal, {...params, avBlock: 2});
        case 'aflutter-3to1':
            return ArrhythmiaModifiersBeta.applyAtrialFlutter(baseSignal, {...params, avBlock: 3});
        case 'aflutter-variable':
            return ArrhythmiaModifiersBeta.applyAtrialFlutter(baseSignal, {...params, avBlock: 2 + Math.floor(Math.random() * 2)});
        case 'vt':
        case 'monomorphic-vt':
            return ArrhythmiaModifiersBeta.applyVentricularTachycardia(baseSignal, params);
        case 'avblock-1':
        case '1st-degree-av-block':
            return ArrhythmiaModifiersBeta.applyFirstDegreeAVBlock(baseSignal, params);
        case 'avblock-2-mobitz1':
        case 'wenckebach':
            return ArrhythmiaModifiersBeta.applyMobitz1(baseSignal, params);
        case 'avblock-2-mobitz2':
            return ArrhythmiaModifiersBeta.applyMobitz2(baseSignal, params);
        default:
            return baseSignal;
    }
}
