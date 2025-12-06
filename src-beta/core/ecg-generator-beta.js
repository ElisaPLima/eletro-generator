// Enhanced ECG Waveform Generator - Beta Version
// Improved realism for medical accuracy
// Based on AHA/ACC guidelines and real ECG characteristics

class ECGGeneratorBeta {
    constructor() {
        this.fs = 500; // Sampling rate 500 Hz
    }
    
    /**
     * Improved Gaussian function with asymmetry for realistic T waves
     * @param {number} x - Time point
     * @param {number} amp - Amplitude
     * @param {number} mu - Center position
     * @param {number} sigma - Width
     * @param {number} skew - Skewness factor for asymmetric waves
     */
    gaussian(x, amp, mu, sigma, skew = 0) {
        const normalized = (x - mu) / sigma;
        const gaussian = Math.exp(-0.5 * Math.pow(normalized, 2));
        
        // Add skewness for asymmetric waves (realistic T waves)
        if (skew !== 0) {
            const skewFactor = 1 + skew * normalized;
            return amp * gaussian * Math.max(0, skewFactor);
        }
        
        return amp * gaussian;
    }
    
    /**
     * Generate improved wave parameters with realistic morphology
     */
    generateWaveParams(params) {
        const beatDuration = 60 / params.heartRate;
        const prInterval = params.prInterval;
        const qrsWidth = params.qrsWidth;
        const qtInterval = params.qtInterval;
        
        // More accurate positioning based on cardiac physiology
        const pPosition = 0.12; // P wave starts at 12% of cycle
        const qrsStart = pPosition + prInterval;
        const tPosition = qrsStart + qtInterval - 0.04; // T wave peak
        const uPosition = tPosition + 0.18;
        
        return [
            { 
                name: 'P', 
                amp: params.pWaveAmplitude, 
                mu: pPosition, 
                sigma: params.pWaveDuration / 5,
                skew: 0.1 // Slight asymmetry for realistic P wave
            },
            { 
                name: 'Q', 
                amp: -0.12 * (params.qrsAmplitude / 10), 
                mu: qrsStart, 
                sigma: 0.008 
            },
            { 
                name: 'R', 
                amp: params.qrsAmplitude / 10, 
                mu: qrsStart + 0.015, // Sharp peak
                sigma: 0.006, // Narrower for sharp R wave
                skew: 0
            },
            { 
                name: 'S', 
                amp: -0.28 * (params.qrsAmplitude / 10), 
                mu: qrsStart + 0.035, 
                sigma: 0.009 
            },
            { 
                name: 'T', 
                amp: params.tAmplitude, 
                mu: tPosition, 
                sigma: 0.08, // Wider than QRS
                skew: -0.15 // Asymmetric T wave (steeper upslope, gradual downslope)
            },
            { 
                name: 'U', 
                amp: params.uAmplitude, 
                mu: uPosition, 
                sigma: 0.05,
                skew: 0
            }
        ];
    }
    
    /**
     * Generate single heartbeat with improved morphology
     */
    generateSingleBeat(params) {
        const beatDuration = 60 / params.heartRate;
        const samplesPerBeat = Math.floor(beatDuration * this.fs);
        const waveParams = this.generateWaveParams(params);
        
        const singleBeat = [];
        for (let i = 0; i < samplesPerBeat; i++) {
            const t = i / this.fs;
            let voltage = 0;
            
            // Sum all wave components with improved Gaussian
            waveParams.forEach(wave => {
                voltage += this.gaussian(t, wave.amp, wave.mu, wave.sigma, wave.skew || 0);
            });
            
            // Improved ST segment with smooth transition
            const stStart = waveParams[3].mu + 0.02; // After S wave
            const stEnd = waveParams[4].mu - 0.05; // Before T wave
            
            if (t > stStart && t < stEnd) {
                const stProgress = (t - stStart) / (stEnd - stStart);
                // Smooth transition using cosine interpolation
                const stLevel = params.stAmplitude / 10;
                const smoothFactor = 0.5 * (1 - Math.cos(Math.PI * stProgress));
                voltage += stLevel * (1 - smoothFactor * 0.3);
            }
            
            // Improved PR segment (isoelectric)
            const prStart = waveParams[0].mu + 0.08;
            const prEnd = waveParams[1].mu;
            
            if (t > prStart && t < prEnd) {
                voltage += params.prLevel / 10;
            }
            
            singleBeat.push(voltage);
        }
        
        return singleBeat;
    }
    
    /**
     * Generate complete ECG with realistic variability
     */
    generateECG(params, duration = 10) {
        const beatDuration = 60 / params.heartRate;
        const totalSamples = Math.floor(this.fs * duration);
        
        let voltageData = [];
        let currentTime = 0;
        
        // Add beat-to-beat variability for realism (heart rate variability)
        const hrvEnabled = params.hrvEnabled !== false; // Default true
        
        while (voltageData.length < totalSamples) {
            // Generate beat with slight HR variation
            const hrVariation = hrvEnabled ? (Math.random() - 0.5) * 0.05 : 0;
            const modifiedParams = {
                ...params,
                heartRate: params.heartRate * (1 + hrVariation)
            };
            
            const singleBeat = this.generateSingleBeat(modifiedParams);
            voltageData = voltageData.concat(singleBeat);
        }
        
        voltageData = voltageData.slice(0, totalSamples);
        
        // Create time array
        const timeData = [];
        for (let i = 0; i < totalSamples; i++) {
            timeData.push(i / this.fs);
        }
        
        // Combine into data objects
        const data = timeData.map((t, i) => ({
            time: t,
            mv: voltageData[i]
        }));
        
        return {
            data: data,
            timeData: timeData,
            voltageData: voltageData,
            samplingRate: this.fs,
            duration: duration,
            beatDuration: beatDuration
        };
    }
    
    /**
     * Enhanced peak detection with better threshold
     */
    findPeaks(data, fs) {
        const peaks = [];
        
        // Calculate dynamic threshold based on signal amplitude
        const voltages = data.map(d => d.mv);
        const maxVoltage = Math.max(...voltages);
        const minHeight = maxVoltage * 0.6; // 60% of max
        const minDist = 0.25 * fs; // Minimum 250ms between peaks
        
        for (let i = 2; i < data.length - 2; i++) {
            // Better peak detection: check 2 points on each side
            if (data[i].mv > data[i-1].mv && 
                data[i].mv > data[i-2].mv &&
                data[i].mv > data[i+1].mv && 
                data[i].mv > data[i+2].mv) {
                
                if (data[i].mv > minHeight) {
                    if (peaks.length === 0 || (i - peaks[peaks.length-1].index) > minDist) {
                        peaks.push({
                            index: i,
                            time: data[i].time,
                            mv: data[i].mv
                        });
                    }
                }
            }
        }
        
        return peaks;
    }
    
    /**
     * Calculate BPM with improved accuracy
     */
    calculateBPM(peaks) {
        if (peaks.length < 2) {
            return { bpm: 0, rrInterval: 0, rrIntervals: [], hrv: 0 };
        }
        
        // Calculate RR intervals
        const rrIntervals = [];
        for (let i = 1; i < peaks.length; i++) {
            rrIntervals.push(peaks[i].time - peaks[i-1].time);
        }
        
        // Calculate mean RR interval
        const meanRR = rrIntervals.reduce((sum, val) => sum + val, 0) / rrIntervals.length;
        
        // Calculate heart rate variability (SDNN)
        const variance = rrIntervals.reduce((sum, val) => {
            return sum + Math.pow(val - meanRR, 2);
        }, 0) / rrIntervals.length;
        const hrv = Math.sqrt(variance) * 1000; // in ms
        
        // Calculate BPM
        const bpm = Math.round(60 / meanRR);
        
        return {
            bpm: bpm,
            rrInterval: meanRR,
            rrIntervals: rrIntervals,
            peakCount: peaks.length,
            hrv: Math.round(hrv)
        };
    }
    
    /**
     * Calculate QTc using Bazett's formula (improved)
     */
    calculateQTc(qt, rr) {
        if (rr <= 0) return 0;
        return (qt / Math.sqrt(rr)) * 1000; // Convert to ms
    }
}

// Create global instance for beta version
const ecgGeneratorBeta = new ECGGeneratorBeta();
