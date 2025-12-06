// ECG Waveform Generator using Gaussian Summation
class ECGGenerator {
    constructor() {
        this.fs = MEDICAL_CONSTANTS.SAMPLING_RATE;
    }
    
    /**
     * Gaussian function for wave component generation
     * @param {number} x - Time point
     * @param {number} amp - Amplitude
     * @param {number} mu - Center position (mean)
     * @param {number} sigma - Width (standard deviation)
     * @returns {number} Gaussian value at x
     */
    gaussian(x, amp, mu, sigma) {
        return amp * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
    }
    
    /**
     * Generate wave parameters based on user input
     * @param {Object} params - User parameters
     * @returns {Array} Wave component parameters
     */
    generateWaveParams(params) {
        const beatDuration = 60 / params.heartRate; // Duration of one beat in seconds
        const prInterval = params.prInterval;
        const qrsWidth = params.qrsWidth;
        const qtInterval = params.qtInterval;
        
        // Calculate positions in time (seconds from beat start)
        const pPosition = 0.15; // P wave starts early in beat
        const qrsStart = pPosition + prInterval;
        const tPosition = qrsStart + qrsWidth + (qtInterval - qrsWidth);
        const uPosition = tPosition + 0.16;
        
        return [
            { 
                name: 'P', 
                amp: params.pWaveAmplitude, 
                mu: pPosition, 
                sigma: params.pWaveDuration / 6 
            },
            { 
                name: 'Q', 
                amp: -0.1 * (params.qrsAmplitude / 10), 
                mu: qrsStart, 
                sigma: 0.01 
            },
            { 
                name: 'R', 
                amp: params.qrsAmplitude / 10, 
                mu: qrsStart + 0.02, 
                sigma: 0.008 
            },
            { 
                name: 'S', 
                amp: -0.25 * (params.qrsAmplitude / 10), 
                mu: qrsStart + 0.04, 
                sigma: 0.01 
            },
            { 
                name: 'T', 
                amp: params.tAmplitude, 
                mu: tPosition, 
                sigma: 0.06 
            },
            { 
                name: 'U', 
                amp: params.uAmplitude, 
                mu: uPosition, 
                sigma: 0.04 
            }
        ];
    }
    
    /**
     * Generate a single heartbeat
     * @param {Object} params - User parameters
     * @returns {Array} Voltage data for one beat
     */
    generateSingleBeat(params) {
        const beatDuration = 60 / params.heartRate;
        const samplesPerBeat = Math.floor(beatDuration * this.fs);
        const waveParams = this.generateWaveParams(params);
        
        const singleBeat = [];
        for (let i = 0; i < samplesPerBeat; i++) {
            const t = i / this.fs;
            let voltage = 0;
            
            // Sum all Gaussian components
            waveParams.forEach(wave => {
                voltage += this.gaussian(t, wave.amp, wave.mu, wave.sigma);
            });
            
            // Add baseline offset for ST segment
            if (t > (waveParams[3].mu + 0.02) && t < waveParams[4].mu) {
                voltage += params.stAmplitude / 10;
            }
            
            // Add PR segment level
            if (t > waveParams[0].mu + 0.08 && t < waveParams[1].mu) {
                voltage += params.prLevel / 10;
            }
            
            singleBeat.push(voltage);
        }
        
        return singleBeat;
    }
    
    /**
     * Generate complete ECG signal for specified duration
     * @param {Object} params - User parameters
     * @param {number} duration - Duration in seconds (default 10s)
     * @returns {Object} Time and voltage data
     */
    generateECG(params, duration = 10) {
        const beatDuration = 60 / params.heartRate;
        const totalSamples = Math.floor(this.fs * duration);
        const singleBeat = this.generateSingleBeat(params);
        
        // Repeat beat to fill duration
        let voltageData = [];
        while (voltageData.length < totalSamples) {
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
     * Find R-peaks in ECG signal for BPM calculation
     * @param {Array} data - ECG data array
     * @param {number} fs - Sampling frequency
     * @returns {Array} Detected peak objects
     */
    findPeaks(data, fs) {
        const peaks = [];
        const minHeight = 0.6;
        const minDist = 0.3 * fs; // Minimum 0.3s between peaks
        
        for (let i = 1; i < data.length - 1; i++) {
            // Local maximum detection
            if (data[i].mv > data[i-1].mv && data[i].mv > data[i+1].mv) {
                if (data[i].mv > minHeight) {
                    // Check minimum distance from last peak
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
     * Calculate BPM from detected peaks
     * @param {Array} peaks - Array of detected peaks
     * @returns {Object} BPM and RR interval data
     */
    calculateBPM(peaks) {
        if (peaks.length < 2) {
            return { bpm: 0, rrInterval: 0, rrIntervals: [] };
        }
        
        // Calculate RR intervals
        const rrIntervals = [];
        for (let i = 1; i < peaks.length; i++) {
            rrIntervals.push(peaks[i].time - peaks[i-1].time);
        }
        
        // Calculate mean RR interval
        const meanRR = rrIntervals.reduce((sum, val) => sum + val, 0) / rrIntervals.length;
        
        // Calculate BPM
        const bpm = Math.round(60 / meanRR);
        
        return {
            bpm: bpm,
            rrInterval: meanRR,
            rrIntervals: rrIntervals,
            peakCount: peaks.length
        };
    }
    
    /**
     * Calculate QTc (corrected QT interval) using Bazett's formula
     * @param {number} qt - QT interval in seconds
     * @param {number} rr - RR interval in seconds
     * @returns {number} QTc in milliseconds
     */
    calculateQTc(qt, rr) {
        if (rr <= 0) return 0;
        return (qt / Math.sqrt(rr)) * 1000; // Convert to ms
    }
    
    /**
     * Add noise to simulate realistic ECG
     * @param {Array} data - Clean ECG data
     * @param {number} noiseLevel - Noise amplitude (default 0.01)
     * @returns {Array} Noisy ECG data
     */
    addNoise(data, noiseLevel = 0.01) {
        return data.map(point => ({
            ...point,
            mv: point.mv + (Math.random() - 0.5) * noiseLevel
        }));
    }
    
    /**
     * Apply baseline wander
     * @param {Array} data - ECG data
     * @param {number} amplitude - Wander amplitude
     * @param {number} frequency - Wander frequency in Hz
     * @returns {Array} ECG data with baseline wander
     */
    addBaselineWander(data, amplitude = 0.05, frequency = 0.3) {
        return data.map(point => ({
            ...point,
            mv: point.mv + amplitude * Math.sin(2 * Math.PI * frequency * point.time)
        }));
    }
}

// Create global ECG generator instance
const ecgGenerator = new ECGGenerator();
