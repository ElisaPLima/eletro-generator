// Pathology Pattern Modifiers
const PathologyModifiers = {
    /**
     * Apply STEMI (ST Elevation Myocardial Infarction)
     * @param {Object} allLeads - All 12-lead data
     * @param {string} location - Infarction location
     * @param {Object} params - User parameters
     * @returns {Object} Modified leads
     */
    applySTEMI(allLeads, location, params) {
        const stemiPatterns = {
            'stemi-anterior': {
                elevated: ['V1', 'V2', 'V3', 'V4'],
                reciprocal: ['D2', 'D3', 'aVF'],
                stElevation: 0.3,
                stDepression: -0.15
            },
            'stemi-inferior': {
                elevated: ['D2', 'D3', 'aVF'],
                reciprocal: ['D1', 'aVL'],
                stElevation: 0.3,
                stDepression: -0.15
            },
            'stemi-lateral': {
                elevated: ['D1', 'aVL', 'V5', 'V6'],
                reciprocal: ['D2', 'D3', 'aVF'],
                stElevation: 0.3,
                stDepression: -0.15
            },
            'stemi-posterior': {
                elevated: [],
                reciprocal: ['V1', 'V2'], // Shows as ST depression
                stElevation: 0,
                stDepression: -0.2
            }
        };
        
        const pattern = stemiPatterns[location];
        if (!pattern) return allLeads;
        
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Apply ST elevation
            if (pattern.elevated.includes(leadName)) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    // ST segment is typically 0.4-0.7 of beat cycle
                    if (beatPhase > 0.4 && beatPhase < 0.7) {
                        return { time: point.time, mv: point.mv + pattern.stElevation };
                    }
                    return point;
                });
            }
            
            // Apply reciprocal ST depression
            if (pattern.reciprocal.includes(leadName)) {
                data = data.map((point, i) => {
                    const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
                    if (beatPhase > 0.4 && beatPhase < 0.7) {
                        return { time: point.time, mv: point.mv + pattern.stDepression };
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
     * Apply RBBB (Right Bundle Branch Block)
     * @param {Object} allLeads - All 12-lead data
     * @param {Object} params - User parameters
     * @returns {Object} Modified leads
     */
    applyRBBB(allLeads, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Wide QRS > 120ms in all leads
            // rsR' pattern in V1, wide S in V6
            if (leadName === 'V1') {
                // Add M-shaped QRS (rsR')
                data = this.addMShapedQRS(data, params);
            } else if (leadName === 'V6' || leadName === 'D1') {
                // Wide S wave
                data = this.widenSWave(data, params);
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
     * Apply LBBB (Left Bundle Branch Block)
     * @param {Object} allLeads - All 12-lead data
     * @param {Object} params - User parameters
     * @returns {Object} Modified leads
     */
    applyLBBB(allLeads, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Wide QRS > 120ms, broad R in V5/V6, deep S in V1
            if (leadName === 'V5' || leadName === 'V6' || leadName === 'D1') {
                // Broad monophasic R wave
                data = this.broadenRWave(data, params);
            } else if (leadName === 'V1') {
                // Deep QS or rS pattern
                data = this.deepenSWave(data, params);
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
     * Apply LVH (Left Ventricular Hypertrophy)
     * @param {Object} allLeads - All 12-lead data
     * @param {Object} params - User parameters
     * @returns {Object} Modified leads
     */
    applyLVH(allLeads, params) {
        const modified = {};
        
        Object.keys(allLeads).forEach(leadName => {
            const lead = allLeads[leadName];
            let data = [...lead.data];
            
            // Increased voltages: S in V1 + R in V5/V6 > 35mm
            if (leadName === 'V5' || leadName === 'V6') {
                data = data.map(point => ({
                    time: point.time,
                    mv: point.mv * 1.8 // Increase amplitude
                }));
            } else if (leadName === 'V1') {
                data = data.map(point => ({
                    time: point.time,
                    mv: point.mv > 0 ? point.mv : point.mv * 1.5 // Deepen S
                }));
            }
            
            // Strain pattern in lateral leads
            if (leadName === 'D1' || leadName === 'aVL' || leadName === 'V5' || leadName === 'V6') {
                data = this.addStrainPattern(data, params);
            }
            
            modified[leadName] = {
                ...lead,
                data: data,
                voltageData: data.map(d => d.mv)
            };
        });
        
        return modified;
    },
    
    // Helper methods
    addMShapedQRS(data, params) {
        // Simplified M-shape addition
        return data.map((point, i) => {
            const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
            if (beatPhase > 0.25 && beatPhase < 0.35) {
                // Add second peak
                const extra = 0.3 * Math.sin((beatPhase - 0.25) * Math.PI * 10);
                return { time: point.time, mv: point.mv + extra };
            }
            return point;
        });
    },
    
    widenSWave(data, params) {
        return data.map((point, i) => {
            if (point.mv < -0.1) {
                return { time: point.time, mv: point.mv * 1.5 };
            }
            return point;
        });
    },
    
    broadenRWave(data, params) {
        return data.map((point, i) => {
            if (point.mv > 0.3) {
                return { time: point.time, mv: point.mv * 1.3 };
            }
            return point;
        });
    },
    
    deepenSWave(data, params) {
        return data.map((point, i) => {
            if (point.mv < 0) {
                return { time: point.time, mv: point.mv * 2 };
            }
            return point;
        });
    },
    
    addStrainPattern(data, params) {
        // ST depression and T wave inversion
        return data.map((point, i) => {
            const beatPhase = (point.time % (60 / params.heartRate)) / (60 / params.heartRate);
            if (beatPhase > 0.5 && beatPhase < 0.8) {
                return { time: point.time, mv: point.mv - 0.1 };
            }
            return point;
        });
    }
};

// Apply bundle block to leads
function applyBundleBlock(allLeads, blockType, params) {
    switch(blockType) {
        case 'rbbb':
            return PathologyModifiers.applyRBBB(allLeads, params);
        case 'lbbb':
            return PathologyModifiers.applyLBBB(allLeads, params);
        default:
            return allLeads;
    }
}

// Apply pathology to leads
function applyPathology(allLeads, pathologyType, params) {
    if (pathologyType.startsWith('stemi-')) {
        return PathologyModifiers.applySTEMI(allLeads, pathologyType, params);
    }
    
    switch(pathologyType) {
        case 'lvh':
            return PathologyModifiers.applyLVH(allLeads, params);
        case 'nstemi':
            // Similar to STEMI but ST depression instead
            return PathologyModifiers.applySTEMI(allLeads, 'nstemi', params);
        default:
            return allLeads;
    }
}
