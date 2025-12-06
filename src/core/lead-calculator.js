// 12-Lead ECG Calculator
// Implements Einthoven's Triangle and Goldberger equations
class LeadCalculator {
    constructor() {
        this.masterVector = null;
    }
    
    /**
     * Generate all 12 leads from base signal
     * @param {Object} baseSignal - Base ECG signal data
     * @param {Object} params - User parameters
     * @returns {Object} All 12-lead signals
     */
    calculateAll12Leads(baseSignal, params) {
        const leads = {};
        
        // Generate master cardiac vector (3D representation)
        this.masterVector = this.generateMasterVector(baseSignal);
        
        // Calculate limb leads (frontal plane)
        leads.D1 = this.calculateLimbLead('D1', this.masterVector);
        leads.D2 = baseSignal; // D2 is typically the reference lead
        leads.D3 = this.calculateLimbLead('D3', this.masterVector);
        
        // Calculate augmented leads (Goldberger)
        leads.aVR = this.calculateAugmentedLead('aVR', leads.D1, leads.D2, leads.D3);
        leads.aVL = this.calculateAugmentedLead('aVL', leads.D1, leads.D2, leads.D3);
        leads.aVF = this.calculateAugmentedLead('aVF', leads.D1, leads.D2, leads.D3);
        
        // Calculate precordial leads (horizontal plane)
        leads.V1 = this.calculatePrecordialLead('V1', this.masterVector, params);
        leads.V2 = this.calculatePrecordialLead('V2', this.masterVector, params);
        leads.V3 = this.calculatePrecordialLead('V3', this.masterVector, params);
        leads.V4 = this.calculatePrecordialLead('V4', this.masterVector, params);
        leads.V5 = this.calculatePrecordialLead('V5', this.masterVector, params);
        leads.V6 = this.calculatePrecordialLead('V6', this.masterVector, params);
        
        return leads;
    }
    
    /**
     * Generate 3D cardiac vector from base signal
     * @param {Object} signal - Base ECG signal
     * @returns {Array} 3D vector time series
     */
    generateMasterVector(signal) {
        const vectors = signal.data.map((point, i) => {
            return {
                time: point.time,
                x: point.mv,
                y: point.mv * 0.8,
                z: point.mv * 0.3
            };
        });
        return vectors;
    }
    
    /**
     * Calculate limb lead using vector projection
     * @param {string} leadName - Lead name (D1, D2, D3)
     * @param {Array} vector - Master cardiac vector
     * @returns {Object} Lead signal
     */
    calculateLimbLead(leadName, vector) {
        const angle = LEAD_VECTORS[leadName] * (Math.PI / 180);
        
        const data = vector.map(v => ({
            time: v.time,
            mv: v.x * Math.cos(angle) + v.y * Math.sin(angle)
        }));
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv)
        };
    }
    
    /**
     * Calculate augmented lead (aVR, aVL, aVF)
     * Uses Goldberger's equations
     * @param {string} leadName - Lead name
     * @param {Object} lead1 - Lead I data
     * @param {Object} lead2 - Lead II data
     * @param {Object} lead3 - Lead III data
     * @returns {Object} Augmented lead signal
     */
    calculateAugmentedLead(leadName, lead1, lead2, lead3) {
        let data;
        
        switch(leadName) {
            case 'aVR':
                // aVR = -(Lead I + Lead II) / 2 or 3/2 * (RA - VW)
                data = lead1.data.map((point, i) => ({
                    time: point.time,
                    mv: -(lead1.data[i].mv + lead2.data[i].mv) / 2
                }));
                break;
                
            case 'aVL':
                // aVL = Lead I - Lead II / 2
                data = lead1.data.map((point, i) => ({
                    time: point.time,
                    mv: lead1.data[i].mv - lead2.data[i].mv / 2
                }));
                break;
                
            case 'aVF':
                // aVF = Lead II - Lead I / 2
                data = lead2.data.map((point, i) => ({
                    time: point.time,
                    mv: lead2.data[i].mv - lead1.data[i].mv / 2
                }));
                break;
                
            default:
                data = lead1.data;
        }
        
        return {
            data: data,
            timeData: data.map(d => d.time),
            voltageData: data.map(d => d.mv)
        };
    }
    
    /**
     * Calculate precordial lead (V1-V6)
     * @param {string} leadName - Lead name (V1-V6)
     * @param {Array} vector - Master cardiac vector
     * @param {Object} params - User parameters
     * @returns {Object} Precordial lead signal
     */
    calculatePrecordialLead(leadName, vector, params) {
        const position = PRECORDIAL_VECTORS[leadName];
        
        // Project 3D vector onto lead position
        const data = vector.map(v => {
            const projection = v.x * position.x + v.y * position.y + v.z * position.z;
            return {
                time: v.time,
                mv: projection
            };
        });
        
        // Apply lead-specific morphology adjustments
        const adjusted = this.adjustPrecordialMorphology(leadName, data, params);
        
        return {
            data: adjusted,
            timeData: adjusted.map(d => d.time),
            voltageData: adjusted.map(d => d.mv)
        };
    }
    
    /**
     * Adjust precordial lead morphology for realistic appearance
     * @param {string} leadName - Lead name
     * @param {Array} data - Raw lead data
     * @param {Object} params - User parameters
     * @returns {Array} Adjusted lead data
     */
    adjustPrecordialMorphology(leadName, data, params) {
        const adjustments = {
            'V1': { rAmplitude: 0.35, sAmplitude: 1.4 },
            'V2': { rAmplitude: 0.45, sAmplitude: 1.2 },
            'V3': { rAmplitude: 0.8, sAmplitude: 0.8 },
            'V4': { rAmplitude: 1.2, sAmplitude: 0.4 },
            'V5': { rAmplitude: 1.0, sAmplitude: 0.2 },
            'V6': { rAmplitude: 0.8, sAmplitude: 0.1 }
        };
        
        const adj = adjustments[leadName];
        
        return data.map((point) => {
            let mv = point.mv;
            
            // Adjust R and S wave amplitudes only
            if (mv > 0.5) {
                mv = mv * adj.rAmplitude;
            } else if (mv < -0.2) {
                mv = mv * adj.sAmplitude;
            }
            
            return {
                time: point.time,
                mv: mv
            };
        });
    }
    
    /**
     * Calculate cardiac axis from leads I and aVF
     * @param {Object} lead1 - Lead I data
     * @param {Object} leadAVF - Lead aVF data
     * @returns {Object} Axis angle and interpretation
     */
    calculateCardiacAxis(lead1, leadAVF) {
        // Find QRS complex amplitude in each lead
        const lead1QRS = this.getQRSAmplitude(lead1.data);
        const leadAVFQRS = this.getQRSAmplitude(leadAVF.data);
        
        // Calculate axis angle
        const angle = Math.atan2(leadAVFQRS, lead1QRS) * (180 / Math.PI);
        
        // Interpret axis
        let interpretation;
        if (angle >= -30 && angle <= 90) {
            interpretation = 'Normal axis';
        } else if (angle > 90 && angle <= 180) {
            interpretation = 'Right axis deviation';
        } else if (angle >= -90 && angle < -30) {
            interpretation = 'Left axis deviation';
        } else {
            interpretation = 'Extreme axis deviation';
        }
        
        return {
            angle: Math.round(angle),
            interpretation: interpretation
        };
    }
    
    /**
     * Get QRS complex amplitude from lead data
     * @param {Array} data - Lead data
     * @returns {number} QRS amplitude
     */
    getQRSAmplitude(data) {
        // Find maximum and minimum in first 30% (where QRS typically is)
        const qrsRegion = data.slice(0, Math.floor(data.length * 0.3));
        const max = Math.max(...qrsRegion.map(d => d.mv));
        const min = Math.min(...qrsRegion.map(d => d.mv));
        return max - min;
    }
}

// Create global lead calculator instance
const leadCalculator = new LeadCalculator();
console.log('Lead Calculator loaded:', leadCalculator);
