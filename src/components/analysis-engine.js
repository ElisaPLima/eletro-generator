// Automated ECG Analysis Engine
class AnalysisEngine {
    constructor() {
        this.setupEventListeners();
    }
    
    /**
     * Setup analysis button event listener
     */
    setupEventListeners() {
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.performAnalysis());
        }
    }
    
    /**
     * Perform automated ECG analysis
     */
    performAnalysis() {
        const params = stateManager.getParameters();
        const metrics = stateManager.getState().calculatedMetrics;
        const leadData = stateManager.getState().leadData;
        
        if (!leadData) {
            alert('Generate ECG first');
            return;
        }
        
        const results = {
            heartRate: this.analyzeHeartRate(params, metrics),
            rhythm: this.analyzeRhythm(params, metrics),
            intervals: this.analyzeIntervals(params),
            axis: this.analyzeAxis(leadData),
            qrs: this.analyzeQRS(params),
            stSegment: this.analyzeSTSegment(params, leadData),
            tWave: this.analyzeTWave(params),
            overall: null
        };
        
        // Generate overall interpretation
        results.overall = this.generateOverallInterpretation(results);
        
        // Store analysis
        stateManager.setAnalysis(results);
        
        // Display results
        this.displayResults(results);
    }
    
    /**
     * Analyze heart rate
     */
    analyzeHeartRate(params, metrics) {
        const hr = metrics.bpm || params.heartRate;
        const normal = MEDICAL_CONSTANTS.NORMAL_RANGES.heartRate;
        
        let status, interpretation;
        if (hr < normal.min) {
            status = 'abnormal';
            interpretation = `Bradicardia (${hr} bpm < ${normal.min})`;
        } else if (hr > normal.max) {
            status = 'abnormal';
            interpretation = `Taquicardia (${hr} bpm > ${normal.max})`;
        } else {
            status = 'normal';
            interpretation = `Normal (${hr} bpm)`;
        }
        
        return { status, interpretation, value: hr };
    }
    
    /**
     * Analyze rhythm
     */
    analyzeRhythm(params, metrics) {
        let status = 'normal';
        let interpretation = 'Ritmo sinusal';
        
        if (params.arrhythmia !== 'none') {
            status = 'abnormal';
            const arrhythmiaNames = {
                'sinus-brady': 'Bradicardia sinusal',
                'afib': 'Fibrilação atrial',
                'aflutter': 'Flutter atrial',
                'vt': 'Taquicardia ventricular',
                'avblock-1': 'Bloqueio AV de 1º grau',
                'avblock-2-mobitz1': 'Bloqueio AV de 2º grau Mobitz I',
                'avblock-2-mobitz2': 'Bloqueio AV de 2º grau Mobitz II'
            };
            interpretation = arrhythmiaNames[params.arrhythmia] || 'Arritmia detectada';
        }
        
        return { status, interpretation };
    }
    
    /**
     * Analyze intervals
     */
    analyzeIntervals(params) {
        const results = [];
        
        // PR interval
        const pr = params.prInterval * 1000; // Convert to ms
        const prNormal = MEDICAL_CONSTANTS.NORMAL_RANGES.prInterval;
        if (pr < prNormal.min) {
            results.push({
                name: 'PR',
                status: 'abnormal',
                interpretation: `PR curto (${pr.toFixed(0)} ms < ${prNormal.min} ms) - possível pré-excitação`
            });
        } else if (pr > prNormal.max) {
            results.push({
                name: 'PR',
                status: 'abnormal',
                interpretation: `PR longo (${pr.toFixed(0)} ms > ${prNormal.max} ms) - bloqueio AV de 1º grau`
            });
        } else {
            results.push({
                name: 'PR',
                status: 'normal',
                interpretation: `PR normal (${pr.toFixed(0)} ms)`
            });
        }
        
        // QRS duration
        const qrs = params.qrsWidth * 1000;
        const qrsNormal = MEDICAL_CONSTANTS.NORMAL_RANGES.qrsDuration;
        if (qrs > qrsNormal.max) {
            results.push({
                name: 'QRS',
                status: 'abnormal',
                interpretation: `QRS alargado (${qrs.toFixed(0)} ms > ${qrsNormal.max} ms) - bloqueio de ramo ou ritmo ventricular`
            });
        } else {
            results.push({
                name: 'QRS',
                status: 'normal',
                interpretation: `QRS normal (${qrs.toFixed(0)} ms)`
            });
        }
        
        // QT interval
        const qt = params.qtInterval * 1000;
        const qtNormal = MEDICAL_CONSTANTS.NORMAL_RANGES.qtInterval;
        if (qt > qtNormal.max) {
            results.push({
                name: 'QT',
                status: 'warning',
                interpretation: `QT prolongado (${qt.toFixed(0)} ms > ${qtNormal.max} ms) - risco de Torsades de Pointes`
            });
        } else if (qt < qtNormal.min) {
            results.push({
                name: 'QT',
                status: 'warning',
                interpretation: `QT curto (${qt.toFixed(0)} ms < ${qtNormal.min} ms)`
            });
        } else {
            results.push({
                name: 'QT',
                status: 'normal',
                interpretation: `QT normal (${qt.toFixed(0)} ms)`
            });
        }
        
        return results;
    }
    
    /**
     * Analyze cardiac axis
     */
    analyzeAxis(leadData) {
        if (!leadData || !leadData.D1 || !leadData.aVF) {
            return { status: 'normal', interpretation: 'Eixo não calculado' };
        }
        
        const axis = leadCalculator.calculateCardiacAxis(leadData.D1, leadData.aVF);
        
        let status = 'normal';
        if (axis.interpretation.includes('deviation')) {
            status = 'abnormal';
        }
        
        return {
            status,
            interpretation: `${axis.interpretation} (${axis.angle}°)`
        };
    }
    
    /**
     * Analyze QRS morphology
     */
    analyzeQRS(params) {
        const results = [];
        
        if (params.bundleBlock !== 'none') {
            const blockNames = {
                'rbbb': 'Bloqueio completo de ramo direito (BCRD)',
                'lbbb': 'Bloqueio completo de ramo esquerdo (BCRE)',
                'lafb': 'Hemibloqueio anterossuperior esquerdo',
                'lpfb': 'Hemibloqueio posteroinferior esquerdo'
            };
            
            results.push({
                status: 'abnormal',
                interpretation: blockNames[params.bundleBlock] || 'Bloqueio de ramo detectado'
            });
        }
        
        return results.length > 0 ? results : [{ status: 'normal', interpretation: 'Morfologia QRS normal' }];
    }
    
    /**
     * Analyze ST segment
     */
    analyzeSTSegment(params, leadData) {
        const results = [];
        
        if (params.stAmplitude > 0.1) {
            results.push({
                status: 'abnormal',
                interpretation: `Supradesnivelamento de ST (${(params.stAmplitude * 10).toFixed(1)} mm) - possível IAM`
            });
        } else if (params.stAmplitude < -0.1) {
            results.push({
                status: 'abnormal',
                interpretation: `Infradesnivelamento de ST (${(params.stAmplitude * 10).toFixed(1)} mm) - possível isquemia`
            });
        } else {
            results.push({
                status: 'normal',
                interpretation: 'Segmento ST isoelétrico'
            });
        }
        
        if (params.pathology && params.pathology.includes('stemi')) {
            const locations = {
                'stemi-anterior': 'IAM anterior',
                'stemi-inferior': 'IAM inferior',
                'stemi-lateral': 'IAM lateral',
                'stemi-posterior': 'IAM posterior'
            };
            
            results.push({
                status: 'abnormal',
                interpretation: locations[params.pathology] || 'IAM detectado'
            });
        }
        
        return results;
    }
    
    /**
     * Analyze T wave
     */
    analyzeTWave(params) {
        if (params.tAmplitude < 0.05) {
            return {
                status: 'abnormal',
                interpretation: 'Ondas T achatadas - possível isquemia ou distúrbio eletrolítico'
            };
        } else if (params.tAmplitude > 0.8) {
            return {
                status: 'warning',
                interpretation: 'Ondas T altas - possível hipercalemia'
            };
        } else {
            return {
                status: 'normal',
                interpretation: 'Ondas T normais'
            };
        }
    }
    
    /**
     * Generate overall interpretation
     */
    generateOverallInterpretation(results) {
        const abnormalities = [];
        
        if (results.heartRate.status === 'abnormal') {
            abnormalities.push(results.heartRate.interpretation);
        }
        
        if (results.rhythm.status === 'abnormal') {
            abnormalities.push(results.rhythm.interpretation);
        }
        
        results.intervals.forEach(interval => {
            if (interval.status === 'abnormal') {
                abnormalities.push(interval.interpretation);
            }
        });
        
        if (results.axis.status === 'abnormal') {
            abnormalities.push(results.axis.interpretation);
        }
        
        results.stSegment.forEach(st => {
            if (st.status === 'abnormal') {
                abnormalities.push(st.interpretation);
            }
        });
        
        if (abnormalities.length === 0) {
            return {
                status: 'normal',
                interpretation: '✅ ECG dentro dos limites normais'
            };
        } else {
            return {
                status: 'abnormal',
                interpretation: '⚠️ Anormalidades detectadas:\n' + abnormalities.join('\n')
            };
        }
    }
    
    /**
     * Display analysis results
     */
    displayResults(results) {
        const panel = document.getElementById('analysis-panel');
        const resultsDiv = document.getElementById('analysis-results');
        
        if (!panel || !resultsDiv) return;
        
        // Show panel
        panel.classList.remove('hidden');
        
        // Build HTML
        let html = '';
        
        // Heart Rate
        html += this.createAnalysisItem('Frequência Cardíaca', results.heartRate.interpretation, results.heartRate.status);
        
        // Rhythm
        html += this.createAnalysisItem('Ritmo', results.rhythm.interpretation, results.rhythm.status);
        
        // Intervals
        results.intervals.forEach(interval => {
            html += this.createAnalysisItem(`Intervalo ${interval.name}`, interval.interpretation, interval.status);
        });
        
        // Axis
        html += this.createAnalysisItem('Eixo Cardíaco', results.axis.interpretation, results.axis.status);
        
        // QRS
        results.qrs.forEach(qrs => {
            html += this.createAnalysisItem('QRS', qrs.interpretation, qrs.status);
        });
        
        // ST Segment
        results.stSegment.forEach(st => {
            html += this.createAnalysisItem('Segmento ST', st.interpretation, st.status);
        });
        
        // T Wave
        html += this.createAnalysisItem('Onda T', results.tWave.interpretation, results.tWave.status);
        
        // Overall
        html += `<div class="analysis-item ${results.overall.status}" style="margin-top: 1rem; border: 2px solid;">
            <h4>Interpretação Geral</h4>
            <p style="white-space: pre-line;">${results.overall.interpretation}</p>
        </div>`;
        
        resultsDiv.innerHTML = html;
    }
    
    /**
     * Create analysis item HTML
     */
    createAnalysisItem(title, text, status) {
        return `
            <div class="analysis-item ${status}">
                <h4>${title}</h4>
                <p>${text}</p>
            </div>
        `;
    }
}

// Create global analysis engine instance
const analysisEngine = new AnalysisEngine();
