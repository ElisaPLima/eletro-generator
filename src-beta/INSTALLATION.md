# Installation and Usage Guide - Beta v2.0

## Quick Start

### 1. View the Demo

Open `demo-beta.html` in your web browser to see all available patterns.

**No installation required** - just open the HTML file!

---

## Integration with Existing App

### Option 1: Replace Production Files (Testing Only)

⚠️ **Backup first!**

```bash
# Backup original files
cp -r src src-backup

# Copy beta files
cp -r src-beta/* src/
```

### Option 2: Use Beta Alongside Production (Recommended)

Keep both versions and switch with HTML imports.

---

## HTML Integration

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>ECG Generator Beta</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    <div id="ecg-canvas"></div>
    
    <!-- Load Beta Version -->
    <script src="src-beta/core/ecg-generator-beta.js"></script>
    <script src="src-beta/core/noise-generator.js"></script>
    <script src="src-beta/models/acls-rhythms.js"></script>
    <script src="src-beta/models/pathologies-beta.js"></script>
    <script src="src-beta/models/arrhythmias-beta.js"></script>
    
    <!-- Your code -->
    <script>
        // Your ECG generation code here
    </script>
</body>
</html>
```

---

## Usage Examples

### Generate Normal ECG with Realism

```javascript
// Parameters
const params = {
    heartRate: 75,
    prInterval: 0.16,
    qrsWidth: 0.08,
    qtInterval: 0.40,
    pWaveAmplitude: 0.15,
    qrsAmplitude: 10,
    tAmplitude: 0.3,
    uAmplitude: 0.05,
    stAmplitude: 0,
    prLevel: 0,
    pWaveDuration: 0.08,
    hrvEnabled: true  // Enable heart rate variability
};

// Generate base signal
const signal = ecgGeneratorBeta.generateECG(params, 10);

// Add realistic noise
const realistic = noiseGenerator.addClinicalNoise(signal.data, {
    baseline: true,      // Respiratory artifact
    powerline: true,     // 60 Hz interference
    white: true,         // General noise
    muscle: false,       // Muscle tremor (off for good ECG)
    electrode: false     // Electrode artifact (off)
});
```

---

### Generate ACLS Critical Rhythms

#### Ventricular Fibrillation

```javascript
const params = {
    heartRate: 75,
    vfibType: 'coarse'  // or 'fine'
};

const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const vfib = applyACLSRhythm(baseSignal, 'vfib-coarse', params);

// VFib doesn't need additional noise (already chaotic)
```

#### Complete Heart Block

```javascript
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const chb = applyACLSRhythm(baseSignal, 'complete-heart-block', params);

// Shows independent P waves (75 bpm) and QRS (35 bpm)
```

#### Torsades de Pointes

```javascript
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const torsades = applyACLSRhythm(baseSignal, 'torsades', params);

// Shows "twisting of the points" pattern
```

---

### Generate STEMI Patterns

#### Acute Anterior STEMI

```javascript
const params = {
    heartRate: 75,
    miStage: 'acute'    // Hyperacute changes
};

const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);

// Apply STEMI
const stemi = applyPathologyBeta(allLeads, 'stemi-anterior', params);

// Add noise to all leads
Object.keys(stemi).forEach(leadName => {
    stemi[leadName].data = noiseGenerator.addClinicalNoise(
        stemi[leadName].data,
        { baseline: true, white: true }
    );
});

// Render
gridRenderer.render12LeadECG(stemi, params);
```

**Result**: 
- V1-V4: Tombstone ST elevation (4mm)
- V2-V4: Hyperacute peaked T waves
- II, III, aVF: Reciprocal ST depression

#### Evolved MI (with Q waves)

```javascript
const params = {
    heartRate: 75,
    miStage: 'evolved'  // Days old, with Q waves
};

// Same as above but with pathologic Q waves
```

---

### Generate Electrolyte Abnormalities

#### Severe Hyperkalemia

```javascript
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);

const hyperK = applyPathologyBeta(allLeads, 'hyperkalemia-severe', params);

// Shows sine wave pattern, wide QRS, peaked T waves
```

#### Moderate Hypokalemia

```javascript
const hypoK = applyPathologyBeta(allLeads, 'hypokalemia-moderate', params);

// Shows prominent U waves, ST depression, flat T waves
```

---

### Generate Enhanced Arrhythmias

#### Atrial Fibrillation

```javascript
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const afib = applyArrhythmiaBeta(baseSignal, 'afib', params);

// Irregularly irregular rhythm, no P waves, fibrillatory waves
```

#### Atrial Flutter (2:1)

```javascript
const aflutter = applyArrhythmiaBeta(baseSignal, 'aflutter-2to1', params);

// Sawtooth flutter waves at 300 bpm, ventricular rate 150 bpm
```

#### Mobitz I (Wenckebach)

```javascript
const mobitz1 = applyArrhythmiaBeta(baseSignal, 'wenckebach', params);

// Progressive PR lengthening until dropped QRS, then cycle repeats
```

---

## Complete Example: ACLS Training Scenario

```javascript
// Scenario: Cardiac arrest with VFib → Shock → PEA → ROSC

// Step 1: Patient in VFib
const vfibParams = { heartRate: 75, vfibType: 'coarse' };
const signal1 = ecgGeneratorBeta.generateECG(vfibParams, 5);
const vfib = applyACLSRhythm(signal1, 'vfib-coarse', vfibParams);
console.log("Patient in VFib - DEFIBRILLATE!");
// Display vfib...

// Wait 5 seconds (simulated)

// Step 2: After shock, converts to PEA
const peaParams = { heartRate: 50 };
const signal2 = ecgGeneratorBeta.generateECG(peaParams, 5);
const pea = applyACLSRhythm(signal2, 'pea', peaParams);
console.log("Post-shock: PEA - Continue CPR, Epinephrine");
// Display pea...

// Wait 5 seconds

// Step 3: After treatment, ROSC with normal sinus
const normalParams = { heartRate: 85 };
const signal3 = ecgGeneratorBeta.generateECG(normalParams, 10);
const normal = noiseGenerator.addClinicalNoise(signal3.data);
console.log("ROSC achieved! Normal sinus rhythm");
// Display normal...
```

---

## Adding Noise Realistically

### Clean Hospital ECG

```javascript
const cleanECG = noiseGenerator.addClinicalNoise(data, {
    baseline: true,      // Minimal baseline wander
    baselineAmplitude: 0.02,
    powerline: true,     // Some 60Hz
    powerlineAmplitude: 0.005,
    white: true,
    whiteAmplitude: 0.002,
    muscle: false,       // No muscle artifact
    electrode: false     // No electrode issues
});
```

### Ambulance/Field ECG

```javascript
const fieldECG = noiseGenerator.addClinicalNoise(data, {
    baseline: true,
    baselineAmplitude: 0.06,  // More baseline wander
    powerline: false,          // No AC power
    muscle: true,              // Patient moving
    muscleAmplitude: 0.04,
    electrode: true,           // Possible poor contact
    electrodeProb: 0.001,
    white: true,
    whiteAmplitude: 0.005
});
```

### CPR in Progress

```javascript
const cprECG = noiseGenerator.addClinicalNoise(data, {
    baseline: true,
    baselineAmplitude: 0.15,   // Significant artifact
    powerline: false,
    muscle: true,
    muscleAmplitude: 0.1,      // Chest compressions
    white: true,
    whiteAmplitude: 0.01
});
```

---

## Rendering

### With Existing Grid Renderer

```javascript
// Assuming you have gridRenderer from original code
gridRenderer.render12LeadECG(allLeads, params);
```

### Custom Rendering

```javascript
// Extract data for custom rendering
const leadData = stemi.D2.data;  // Array of {time, mv}

// Plot with your library (e.g., Chart.js, Plotly, etc.)
```

---

## Testing Your Integration

### Test Checklist

- [ ] Normal ECG generates correctly
- [ ] VFib appears chaotic
- [ ] Complete heart block shows AV dissociation
- [ ] STEMI shows ST elevation in correct leads
- [ ] Hyperkalemia shows peaked T waves
- [ ] Noise appears realistic
- [ ] All 34+ patterns work
- [ ] 12-lead display correct

### Validation

Compare your output with:
1. Provided documentation (VALIDATION.md)
2. Real ECG examples from textbooks
3. ECG databases (PhysioNet)

---

## Troubleshooting

### Pattern Not Showing

```javascript
// Check that beta modules are loaded
console.log(typeof ecgGeneratorBeta);  // Should be 'object'
console.log(typeof applyACLSRhythm);   // Should be 'function'
console.log(typeof noiseGenerator);    // Should be 'object'
```

### No Visible Changes

```javascript
// Make sure you're using the beta version
const signal = ecgGeneratorBeta.generateECG(params, 10);
// NOT: ecgGenerator.generateECG(...)
```

### Leads Not Calculated

```javascript
// Make sure to calculate all 12 leads for pathologies
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);
// THEN apply pathology
const modified = applyPathologyBeta(allLeads, 'stemi-anterior', params);
```

---

## Performance Tips

### For Real-Time Applications

```javascript
// Disable HRV for faster generation
params.hrvEnabled = false;

// Use shorter duration for preview
const signal = ecgGeneratorBeta.generateECG(params, 2.5); // 2.5s instead of 10s

// Minimize noise calculations
const minimalNoise = noiseGenerator.addClinicalNoise(data, {
    baseline: true,
    white: true
    // Other noise types disabled
});
```

### For Batch Generation

```javascript
// Generate multiple patterns
const patterns = ['vfib-coarse', 'pea', 'asystole', 'torsades'];

patterns.forEach(pattern => {
    const signal = ecgGeneratorBeta.generateECG(params, 10);
    const ecg = applyACLSRhythm(signal, pattern, params);
    
    // Save or display
    saveECG(pattern, ecg);
});
```

---

## API Reference

### ecgGeneratorBeta

```javascript
// Generate ECG signal
.generateECG(params, duration)

// Find R peaks
.findPeaks(data, samplingRate)

// Calculate BPM
.calculateBPM(peaks)

// Calculate QTc
.calculateQTc(qt, rr)
```

### noiseGenerator

```javascript
// Add clinical noise (all types)
.addClinicalNoise(data, options)

// Individual noise types
.addBaselineWander(data, amplitude, frequency)
.addPowerlineNoise(data, amplitude, frequency)
.addMuscleTremor(data, amplitude)
.addWhiteNoise(data, amplitude)
.addElectrodeArtifact(data, probability, amplitude)
.addPacemakerSpikes(data, peaks, spikeHeight)
```

### applyACLSRhythm

```javascript
applyACLSRhythm(baseSignal, rhythmType, params)

// rhythmType options:
// 'vfib', 'vfib-coarse', 'vfib-fine'
// 'pea', 'asystole', 'ventricular-standstill'
// 'complete-heart-block', '3rd-degree-av-block'
// 'torsades', 'polymorphic-vt'
// 'pulseless-vt', 'agonal'
```

### applyPathologyBeta

```javascript
applyPathologyBeta(allLeads, pathologyType, params)

// STEMI: 'stemi-anterior', 'stemi-inferior', 'stemi-lateral', 
//        'stemi-posterior', 'stemi-septal'
// Electrolytes: 'hyperkalemia-mild/moderate/severe'
//               'hypokalemia-mild/moderate/severe'
// Other: 'pericarditis', 'rbbb', 'lbbb'
```

### applyArrhythmiaBeta

```javascript
applyArrhythmiaBeta(baseSignal, arrhythmiaType, params)

// Options: 'afib', 'aflutter-2to1', 'aflutter-3to1'
//          'vt', 'monomorphic-vt'
//          '1st-degree-av-block', 'wenckebach', 'avblock-2-mobitz2'
```

---

## Further Reading

- **VALIDATION.md** - Medical references and validation
- **COMPARISON.md** - Beta vs Production differences
- **QUICK_REFERENCE.md** - Quick pattern guide for educators
- **PATTERN_LIBRARY.md** - Complete list of all patterns
- **README.md** - Beta version overview

---

## Support

For questions or issues:
1. Check documentation files
2. Review code comments
3. Compare with examples in this guide
4. Test with demo-beta.html

---

**Version**: 2.0.0-beta  
**Last Updated**: December 2025  
**Status**: Ready for Educational Testing
