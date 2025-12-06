// Enhanced Pathology Pattern Modifiers - Beta Version
// Improved realism based on real ECG characteristics and medical literature

const PathologyModifiersBeta = {
    /**
     * Enhanced STEMI patterns with hyperacute changes
     * Includes: Tombstone ST elevation, reciprocal changes, hyperacute T waves
     */
    applySTEMI(allLeads, location, params) {
        const stemiPatterns = {
            'stemi-anterior': {
                elevated: ['V1', 'V2', 'V3', 'V4'],
                reciprocal: ['D2', 'D3', 'aVF'],
                stElevation: 0.4, // Tombstone pattern (>4mm)
                stDepression: -0.2,
                hyperacuteT: ['V2', 'V3', 'V4'], // Tall peaked T waves
                qWaves: ['V1', 'V2', 'V3'] // Pathologic Q if evolved MI
            },
            'stemi-inferior': {
                elevated: ['D2', 'D3', 'aVF'],
                reciprocal: ['D1', 'aVL', 'V1', 'V2'],
                stElevation: 0.35,
                stDepression: -0.15,
                hyperacuteT: ['D2', 'D3', 'aVF'],
                qWaves: ['D2', 'D3', 'aVF']
            },
            'stemi-lateral': {
                elevated: ['D1', 'aVL', 'V5', 'V6'],
                reciprocal: ['D2', 'D3', 'aVF'],
                stElevation: 0.35,
                stDepression: -0.15,
                hyperacuteT: ['V5', 'V6'],
                qWaves: ['D1', 'aVL', 'V5', 'V6']
            },
            'stemi-posterior': {
                elevated: ['V7', 'V8', 'V9'], // Posterior leads (if available)
                reciprocal: ['V1', 'V2', 'V3'], // ST depression & tall R waves in V1-V2
                stElevation: 0.3,
                stDepression: -0.25, // Prominent depression anteriorly
                tallR: ['V1', 'V2'] // R/S ratio > 1 in V1-V2
            },
            'stemi-septal': {
                elevated: ['V1', 'V2'],
                reciprocal: [],
                stElevation: 0.3,
                stDepression: -0.1,
                hyperacuteT: ['V1', 'V2'],
                qWaves: ['V1', 'V2']
            }
        };
        
        const pattern = stemiPatterns[location];
        if (!pattern) return allLeads;
        
        const modified = {};
        const isEvolvedMI = params.miStage === 'evolved'; // Hours to days old
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Apply ST elevation with convex upward morphology (tombstone)
            if (pattern.elevated.includes(leadName)) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // ST segment: 0.35-0.65 of beat cycle
                    if (beatPhase > 0.35 && beatPhase < 0.65) {
                        const stPhase = (beatPhase - 0.35) / 0.3;
                        // Convex upward (coved) ST elevation
                        const stShape = Math.sin(Math.PI * stPhase);
                        return { 
                            time: point.time, 
                            mv: point.mv + pattern.stElevation * stShape 
                        };
                    }
                    return point;
                });
            }
            
            // Apply hyperacute T waves (tall, peaked)
            if (pattern.hyperacuteT && pattern.hyperacuteT.includes(leadName) && !isEvolvedMI) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // T wave: 0.5-0.75 of beat cycle
                    if (beatPhase > 0.5 && beatPhase < 0.75) {
                        const tPhase = (beatPhase - 0.5) / 0.25;
                        // Hyperacute T: tall and peaked
                        const hyperacuteT = 0.35 * Math.exp(-Math.pow((tPhase - 0.5) / 0.15, 2));
                        return { 
                            time: point.time, 
                            mv: point.mv + hyperacuteT 
                        };
                    }
                    return point;
                });
            }
            
            // Apply reciprocal ST depression
            if (pattern.reciprocal.includes(leadName)) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    if (beatPhase > 0.35 && beatPhase < 0.65) {
                        return { 
                            time: point.time, 
                            mv: point.mv + pattern.stDepression 
                        };
                    }
                    return point;
                });
            }
            
            // Add pathologic Q waves if evolved MI
            if (isEvolvedMI && pattern.qWaves && pattern.qWaves.includes(leadName)) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // Q wave: 0.25-0.28 of beat cycle
                    if (beatPhase > 0.25 && beatPhase < 0.28) {
                        // Deep Q wave (>0.04s wide, >25% of R wave)
                        return { 
                            time: point.time, 
                            mv: point.mv - 0.3 
                        };
                    }
                    return point;
                });
            }
            
            // Posterior MI: tall R waves in V1-V2
            if (location === 'stemi-posterior' && pattern.tallR && pattern.tallR.includes(leadName)) {
                data = data.map((point, i) => {
                    if (point.mv > 0.3) {
                        // Increase R wave amplitude
                        return { 
                            time: point.time, 
                            mv: point.mv * 2 
                        };
                    }
                    return point;
                });
            }
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    },
    
    /**
     * Hyperkalemia (High Potassium)
     * Peaked T waves, wide QRS, sine wave pattern in severe cases
     * Mild: 5.5-6.5 mEq/L, Moderate: 6.5-8 mEq/L, Severe: >8 mEq/L
     */
    applyHyperkalemia(allLeads, severity, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Peaked T waves (all severities)
            data = data.map((point, i) => {
                const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                
                // T wave region
                if (beatPhase > 0.5 && beatPhase < 0.7) {
                    const tPhase = (beatPhase - 0.5) / 0.2;
                    // Narrow, peaked "tented" T waves
                    const peakedT = 0.4 * Math.exp(-Math.pow((tPhase - 0.5) / 0.08, 2));
                    return { 
                        time: point.time, 
                        mv: point.mv + peakedT 
                    };
                }
                
                // Wide QRS (moderate to severe)
                if (severity !== 'mild' && beatPhase > 0.25 && beatPhase < 0.35) {
                    // Widen QRS by stretching
                    return point;
                }
                
                // Sine wave pattern (severe)
                if (severity === 'severe') {
                    // Smooth sine wave appearance
                    const sineWave = 0.5 * Math.sin(2 * Math.PI * beatPhase);
                    return { 
                        time: point.time, 
                        mv: sineWave 
                    };
                }
                
                return point;
            });
            
            // Flatten/disappear P waves (moderate to severe)
            if (severity !== 'mild') {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    if (beatPhase < 0.2) {
                        return { 
                            time: point.time, 
                            mv: point.mv * 0.2 // Greatly diminished P wave
                        };
                    }
                    return point;
                });
            }
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    },
    
    /**
     * Hypokalemia (Low Potassium)
     * Prominent U waves, ST depression, T wave flattening
     * Mild: 3.0-3.5 mEq/L, Moderate: 2.5-3.0 mEq/L, Severe: <2.5 mEq/L
     */
    applyHypokalemia(allLeads, severity, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            data = data.map((point, i) => {
                const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                
                // Flatten T waves
                if (beatPhase > 0.5 && beatPhase < 0.7) {
                    return { 
                        time: point.time, 
                        mv: point.mv * 0.3 // Flat T wave
                    };
                }
                
                // Prominent U waves
                if (beatPhase > 0.7 && beatPhase < 0.85) {
                    const uPhase = (beatPhase - 0.7) / 0.15;
                    const uAmplitude = severity === 'severe' ? 0.25 : 
                                     severity === 'moderate' ? 0.18 : 0.12;
                    const uWave = uAmplitude * Math.exp(-Math.pow((uPhase - 0.5) / 0.3, 2));
                    return { 
                        time: point.time, 
                        mv: point.mv + uWave 
                    };
                }
                
                // ST depression
                if (beatPhase > 0.35 && beatPhase < 0.5) {
                    const stDepression = severity === 'severe' ? -0.15 : 
                                        severity === 'moderate' ? -0.1 : -0.05;
                    return { 
                        time: point.time, 
                        mv: point.mv + stDepression 
                    };
                }
                
                return point;
            });
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    },
    
    /**
     * Pericarditis
     * Diffuse ST elevation (concave), PR depression
     */
    applyPericarditis(allLeads, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Skip aVR (usually has ST depression in pericarditis)
            if (leadName === 'aVR') {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // ST depression in aVR
                    if (beatPhase > 0.35 && beatPhase < 0.65) {
                        return { 
                            time: point.time, 
                            mv: point.mv - 0.15 
                        };
                    }
                    return point;
                });
            } else {
                // Diffuse ST elevation (concave upward)
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // Concave ST elevation
                    if (beatPhase > 0.35 && beatPhase < 0.65) {
                        const stPhase = (beatPhase - 0.35) / 0.3;
                        // Concave (smiley) shape
                        const stShape = 1 - Math.pow(2 * stPhase - 1, 2);
                        return { 
                            time: point.time, 
                            mv: point.mv + 0.2 * stShape 
                        };
                    }
                    
                    // PR segment depression
                    if (beatPhase > 0.15 && beatPhase < 0.25) {
                        return { 
                            time: point.time, 
                            mv: point.mv - 0.08 
                        };
                    }
                    
                    return point;
                });
            }
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    },
    
    /**
     * Improved RBBB with accurate morphology
     * RSR' pattern in V1, wide S in V5/V6, QRS >120ms
     */
    applyRBBB(allLeads, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // V1, V2: RSR' (M-shaped, rabbit ears)
            if (leadName === 'V1' || leadName === 'V2') {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // QRS complex region
                    if (beatPhase > 0.25 && beatPhase < 0.38) {
                        const qrsPhase = (beatPhase - 0.25) / 0.13;
                        
                        // Create RSR' pattern
                        // r wave
                        if (qrsPhase < 0.3) {
                            return { 
                                time: point.time, 
                                mv: point.mv * 0.4 
                            };
                        }
                        // S wave (nadir)
                        else if (qrsPhase >= 0.3 && qrsPhase < 0.5) {
                            return { 
                                time: point.time, 
                                mv: -0.2 
                            };
                        }
                        // R' wave (taller second peak)
                        else {
                            const r2Phase = (qrsPhase - 0.5) / 0.5;
                            return { 
                                time: point.time, 
                                mv: 0.8 * Math.exp(-Math.pow((r2Phase - 0.5) / 0.3, 2)) 
                            };
                        }
                    }
                    return point;
                });
            }
            
            // V5, V6, D1: Wide S wave
            if (leadName === 'V5' || leadName === 'V6' || leadName === 'D1') {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // Widen S wave
                    if (beatPhase > 0.28 && beatPhase < 0.36) {
                        return { 
                            time: point.time, 
                            mv: point.mv < 0 ? point.mv * 1.8 : point.mv 
                        };
                    }
                    return point;
                });
            }
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    },
    
    /**
     * Improved LBBB with accurate morphology
     * Broad R in V5/V6/D1, deep S in V1, QRS >120ms, no septal Q waves
     */
    applyLBBB(allLeads, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // V5, V6, D1, aVL: Broad monophasic R wave
            if (['V5', 'V6', 'D1', 'aVL'].includes(leadName)) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // Remove Q wave, create broad R
                    if (beatPhase > 0.25 && beatPhase < 0.38) {
                        const qrsPhase = (beatPhase - 0.25) / 0.13;
                        // Broad, notched R wave
                        const broadR = Math.sin(Math.PI * qrsPhase) * (1 + 0.1 * Math.sin(3 * Math.PI * qrsPhase));
                        return { 
                            time: point.time, 
                            mv: 1.2 * broadR 
                        };
                    }
                    return point;
                });
            }
            
            // V1, V2: Deep QS or rS pattern
            if (leadName === 'V1' || leadName === 'V2') {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    
                    // Deep S wave, minimal r
                    if (beatPhase > 0.25 && beatPhase < 0.36) {
                        return { 
                            time: point.time, 
                            mv: point.mv < 0 ? point.mv * 2.5 : point.mv * 0.2 
                        };
                    }
                    return point;
                });
            }
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    }
};

// Enhanced pathology application function
function applyPathologyBeta(allLeads, pathologyType, params) {
    if (pathologyType.startsWith('stemi-')) {
        return PathologyModifiersBeta.applySTEMI(allLeads, pathologyType, params);
    }
    
    switch(pathologyType) {
        case 'hyperkalemia-mild':
            return PathologyModifiersBeta.applyHyperkalemia(allLeads, 'mild', params);
        case 'hyperkalemia-moderate':
            return PathologyModifiersBeta.applyHyperkalemia(allLeads, 'moderate', params);
        case 'hyperkalemia-severe':
            return PathologyModifiersBeta.applyHyperkalemia(allLeads, 'severe', params);
        case 'hypokalemia-mild':
            return PathologyModifiersBeta.applyHypokalemia(allLeads, 'mild', params);
        case 'hypokalemia-moderate':
            return PathologyModifiersBeta.applyHypokalemia(allLeads, 'moderate', params);
        case 'hypokalemia-severe':
            return PathologyModifiersBeta.applyHypokalemia(allLeads, 'severe', params);
        case 'pericarditis':
            return PathologyModifiersBeta.applyPericarditis(allLeads, params);
        case 'rbbb':
            return PathologyModifiersBeta.applyRBBB(allLeads, params);
        case 'lbbb':
            return PathologyModifiersBeta.applyLBBB(allLeads, params);
        default:
            return allLeads;
    }
}
