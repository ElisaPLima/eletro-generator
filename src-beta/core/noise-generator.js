// Realistic ECG Noise and Artifact Generator
// Adds clinical realism to simulated ECGs

class NoiseGenerator {
    constructor() {
        this.fs = 500; // Sampling rate
    }
    
    /**
     * Add baseline wander (respiratory artifact)
     * Frequency: 0.15-0.3 Hz
     */
    addBaselineWander(data, amplitude = 0.05, frequency = 0.25) {
        return data.map(point => ({
            ...point,
            mv: point.mv + amplitude * Math.sin(2 * Math.PI * frequency * point.time)
        }));
    }
    
    /**
     * Add AC interference (50/60 Hz powerline)
     * Common in clinical ECGs
     */
    addPowerlineNoise(data, amplitude = 0.01, frequency = 60) {
        return data.map(point => ({
            ...point,
            mv: point.mv + amplitude * Math.sin(2 * Math.PI * frequency * point.time)
        }));
    }
    
    /**
     * Add muscle tremor artifact
     * High frequency (25-50 Hz) irregular oscillations
     */
    addMuscleTremor(data, amplitude = 0.03) {
        return data.map(point => {
            // Random high-frequency noise
            const tremor = amplitude * (Math.random() - 0.5) * 
                          Math.sin(2 * Math.PI * (35 + Math.random() * 15) * point.time);
            return {
                ...point,
                mv: point.mv + tremor
            };
        });
    }
    
    /**
     * Add electrode movement artifact
     * Sudden baseline shifts
     */
    addElectrodeArtifact(data, probability = 0.001, amplitude = 0.1) {
        let baselineShift = 0;
        
        return data.map(point => {
            // Random chance of electrode movement
            if (Math.random() < probability) {
                baselineShift = (Math.random() - 0.5) * amplitude;
            }
            
            // Exponential decay back to baseline
            baselineShift *= 0.99;
            
            return {
                ...point,
                mv: point.mv + baselineShift
            };
        });
    }
    
    /**
     * Add white noise (general measurement noise)
     */
    addWhiteNoise(data, amplitude = 0.005) {
        return data.map(point => ({
            ...point,
            mv: point.mv + (Math.random() - 0.5) * amplitude
        }));
    }
    
    /**
     * Add realistic clinical noise (combination)
     * @param {Object} options - Noise configuration
     */
    addClinicalNoise(data, options = {}) {
        const {
            baseline = true,
            baselineAmplitude = 0.04,
            powerline = true,
            powerlineAmplitude = 0.008,
            muscle = false, // Usually off for good ECGs
            muscleAmplitude = 0.02,
            electrode = false, // Usually off
            electrodeProb = 0.0005,
            white = true,
            whiteAmplitude = 0.003
        } = options;
        
        let noisyData = [...data];
        
        if (baseline) {
            noisyData = this.addBaselineWander(noisyData, baselineAmplitude);
        }
        
        if (powerline) {
            noisyData = this.addPowerlineNoise(noisyData, powerlineAmplitude);
        }
        
        if (muscle) {
            noisyData = this.addMuscleTremor(noisyData, muscleAmplitude);
        }
        
        if (electrode) {
            noisyData = this.addElectrodeArtifact(noisyData, electrodeProb);
        }
        
        if (white) {
            noisyData = this.addWhiteNoise(noisyData, whiteAmplitude);
        }
        
        return noisyData;
    }
    
    /**
     * Add motion artifact (patient movement)
     * Large, slow baseline shifts
     */
    addMotionArtifact(data, startTime, duration = 1.0, amplitude = 0.3) {
        return data.map(point => {
            if (point.time >= startTime && point.time < startTime + duration) {
                const t = (point.time - startTime) / duration;
                // Bell-shaped artifact
                const artifact = amplitude * Math.exp(-Math.pow((t - 0.5) * 4, 2));
                return {
                    ...point,
                    mv: point.mv + artifact
                };
            }
            return point;
        });
    }
    
    /**
     * Add pacemaker spikes
     * Sharp, narrow spikes before QRS
     */
    addPacemakerSpikes(data, peaks, spikeHeight = 2.0) {
        const spikeData = [...data];
        
        peaks.forEach(peak => {
            // Add spike 20ms before R peak
            const spikeIndex = peak.index - Math.floor(0.02 * this.fs);
            
            if (spikeIndex >= 0 && spikeIndex < spikeData.length) {
                // Sharp spike (1-2ms wide)
                for (let i = -1; i <= 1; i++) {
                    const idx = spikeIndex + i;
                    if (idx >= 0 && idx < spikeData.length) {
                        spikeData[idx].mv += spikeHeight * (1 - Math.abs(i) / 2);
                    }
                }
            }
        });
        
        return spikeData;
    }
    
    /**
     * Simulate poor electrode contact
     * Intermittent signal loss
     */
    addPoorContact(data, probability = 0.01) {
        let signalLost = false;
        let lossCounter = 0;
        
        return data.map(point => {
            // Random signal loss
            if (!signalLost && Math.random() < probability) {
                signalLost = true;
                lossCounter = Math.floor(Math.random() * 50); // 100ms max
            }
            
            if (signalLost) {
                lossCounter--;
                if (lossCounter <= 0) {
                    signalLost = false;
                }
                return {
                    ...point,
                    mv: 0
                };
            }
            
            return point;
        });
    }
}

// Create global instance
const noiseGenerator = new NoiseGenerator();
