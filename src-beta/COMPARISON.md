# Beta vs Production Comparison

## Feature Comparison Matrix

| Feature | Production | Beta | Improvement |
|---------|-----------|------|-------------|
| **Basic ECG Generation** | ✅ | ✅ | Enhanced morphology |
| **Heart Rate Variability** | ❌ | ✅ | **NEW** |
| **Asymmetric T waves** | ❌ | ✅ | **NEW** |
| **Realistic noise** | Limited | ✅ | Multiple types |
| **Bundle blocks** | Basic | ✅ | Accurate morphology |
| **STEMI patterns** | Basic | ✅ | Hyperacute T, tombstone ST |
| **Electrolyte abnormalities** | ❌ | ✅ | **NEW** K+ patterns |
| **ACLS rhythms** | Limited | ✅ | **7 critical rhythms** |
| **Pericarditis** | ❌ | ✅ | **NEW** |
| **Documentation** | Good | ✅ | Medical references |

---

## New Pathologies in Beta

### AHA ACLS Critical Rhythms (**NEW**)

1. **Ventricular Fibrillation** (Coarse & Fine)
2. **Pulseless Electrical Activity (PEA)**
3. **Asystole** (Complete & Ventricular Standstill)
4. **Complete Heart Block** (3rd Degree AV Block)
5. **Torsades de Pointes** (Polymorphic VT)
6. **Pulseless VT**
7. **Agonal Rhythm**

### Enhanced Pathologies

8. **Hyperkalemia** (Mild/Moderate/Severe)
9. **Hypokalemia** (Mild/Moderate/Severe)
10. **Pericarditis** (with PR depression)
11. **STEMI** (with hyperacute changes)

### Improved Bundle Blocks

- **RBBB**: RSR' pattern in V1, wide S in lateral leads
- **LBBB**: Broad R in lateral, deep S in V1

---

## Code Architecture Improvements

### Production Version

```
src/
├── core/
│   ├── ecg-generator.js          (Gaussian model)
│   └── lead-calculator.js        (12-lead math)
└── models/
    ├── arrhythmias.js            (8 arrhythmias)
    └── pathologies.js            (Basic STEMI, blocks)
```

### Beta Version

```
src-beta/
├── core/
│   ├── ecg-generator-beta.js     (Enhanced Gaussian with skew)
│   ├── lead-calculator-beta.js   (Improved lead calculations)
│   └── noise-generator.js        ⭐ NEW
└── models/
    ├── acls-rhythms.js           ⭐ NEW - 7 critical rhythms
    ├── pathologies-beta.js       (Enhanced with electrolytes)
    └── arrhythmias-beta.js       (Improved patterns)
```

---

## Technical Improvements

### 1. Enhanced Waveform Generation

**Production**:
```javascript
gaussian(x, amp, mu, sigma) {
    return amp * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
}
```

**Beta**:
```javascript
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
```

**Improvement**: Asymmetric T waves match real ECGs (steeper upslope, gradual downslope)

---

### 2. Heart Rate Variability

**Production**: Fixed RR intervals

**Beta**:
```javascript
// Add beat-to-beat variability
const hrVariation = hrvEnabled ? (Math.random() - 0.5) * 0.05 : 0;
const modifiedParams = {
    ...params,
    heartRate: params.heartRate * (1 + hrVariation)
};
```

**Improvement**: More realistic, natural variation (±5%)

---

### 3. Noise and Artifacts

**Production**: Basic white noise only

**Beta**: Multiple artifact types
- Baseline wander (0.15-0.3 Hz)
- Powerline interference (60 Hz)
- Muscle tremor (25-50 Hz)
- Electrode movement
- Motion artifact

**Usage**:
```javascript
// Add realistic clinical noise
const noisyData = noiseGenerator.addClinicalNoise(data, {
    baseline: true,
    powerline: true,
    muscle: false,
    electrode: false
});
```

---

### 4. STEMI Patterns

**Production**:
- Basic ST elevation
- Reciprocal depression

**Beta**:
- ✅ Tombstone ST elevation (convex)
- ✅ Hyperacute T waves (early MI)
- ✅ Pathologic Q waves (evolved MI)
- ✅ Lead-specific patterns
- ✅ Severity stages

**Example** - Anterior STEMI:
```javascript
applySTEMI(allLeads, 'stemi-anterior', {
    miStage: 'acute'  // or 'evolved'
})
```

Results in:
- V1-V4: 4mm ST elevation (tombstone)
- V2-V4: Hyperacute T waves
- II, III, aVF: Reciprocal depression

---

### 5. Electrolyte Abnormalities

**Production**: Not available

**Beta**: Severity-based progression

**Hyperkalemia**:
```javascript
applyHyperkalemia(allLeads, 'severe', params)
```

Results in:
- Peaked T waves
- Wide QRS
- Flattened P waves
- Sine wave pattern (severe)

**Hypokalemia**:
```javascript
applyHypokalemia(allLeads, 'moderate', params)
```

Results in:
- Prominent U waves
- ST depression
- T wave flattening

---

## Usage Examples

### Example 1: Generate VFib (ACLS)

```javascript
// Create base signal
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);

// Apply VFib
const vfib = applyACLSRhythm(baseSignal, 'vfib-coarse', params);

// Render
gridRenderer.render12LeadECG(vfib, params);
```

**Output**: Chaotic ventricular fibrillation (coarse)

---

### Example 2: Generate Complete Heart Block

```javascript
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const chb = applyACLSRhythm(baseSignal, 'complete-heart-block', params);
```

**Output**: 
- P waves: 75 bpm (independent)
- QRS: 35 bpm (escape rhythm)
- No AV relationship

---

### Example 3: Anterior STEMI with Hyperacute Changes

```javascript
// Generate base ECG
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);

// Apply acute anterior STEMI
const stemi = applyPathologyBeta(allLeads, 'stemi-anterior', {
    ...params,
    miStage: 'acute'
});

// Add realistic noise
Object.keys(stemi).forEach(lead => {
    stemi[lead].data = noiseGenerator.addClinicalNoise(stemi[lead].data);
});
```

**Output**:
- V2-V4: Tombstone ST elevation (4mm)
- Hyperacute peaked T waves
- Reciprocal changes in inferior leads
- Realistic baseline wander

---

### Example 4: Severe Hyperkalemia

```javascript
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);

const hyperK = applyPathologyBeta(allLeads, 'hyperkalemia-severe', params);
```

**Output**:
- Peaked T waves (tented)
- Wide QRS (>200ms)
- Absent P waves
- Sine wave pattern

---

## Migration Guide

### For Developers

To switch from production to beta:

1. **Update HTML imports**:
```html
<!-- Production -->
<script src="src/core/ecg-generator.js"></script>

<!-- Beta -->
<script src="src-beta/core/ecg-generator-beta.js"></script>
<script src="src-beta/core/noise-generator.js"></script>
<script src="src-beta/models/acls-rhythms.js"></script>
```

2. **Use beta generator**:
```javascript
// Production
const signal = ecgGenerator.generateECG(params, 10);

// Beta
const signal = ecgGeneratorBeta.generateECG(params, 10);
```

3. **Apply new rhythms**:
```javascript
// ACLS rhythms
const vfib = applyACLSRhythm(signal, 'vfib', params);

// Enhanced pathologies
const hyperK = applyPathologyBeta(leads, 'hyperkalemia-severe', params);
```

4. **Add noise (optional)**:
```javascript
const noisy = noiseGenerator.addClinicalNoise(data);
```

---

## Performance Impact

| Metric | Production | Beta | Change |
|--------|-----------|------|--------|
| Generation time | ~200ms | ~250ms | +25% |
| Memory usage | ~50MB | ~60MB | +20% |
| File size | ~15KB | ~45KB | +200% |
| Features | 23 | 34 | +48% |

**Note**: Slightly slower due to enhanced realism, but still real-time.

---

## Limitations

### Beta Version Limitations

1. **Not validated by cardiologists** - Educational use only
2. **Some patterns simplified** - Real ECGs more complex
3. **No automatic detection** - Analysis engine needs update
4. **Performance overhead** - More computationally intensive

### When NOT to Use Beta

- ❌ Production medical devices
- ❌ Clinical decision support
- ❌ Patient care
- ❌ Diagnosis

### When TO Use Beta

- ✅ Medical education
- ✅ ACLS training
- ✅ Student practice
- ✅ Research demonstrations
- ✅ Pattern recognition training

---

## Roadmap

### Planned Enhancements

- [ ] Automatic pattern detection for ACLS rhythms
- [ ] More electrolyte abnormalities (Ca++, Mg++)
- [ ] Drug effects (digoxin, beta blockers)
- [ ] Pacemaker patterns (DDD, VVI)
- [ ] Exercise stress test progression
- [ ] Pediatric ECG patterns
- [ ] Lead misplacement artifacts

---

## Contributing

Found an inaccuracy? Want to add a pattern?

1. Review medical references
2. Create pattern in appropriate file
3. Add validation documentation
4. Submit with references

---

**Version**: 2.0.0-beta  
**Last Updated**: December 2025  
**Stability**: Experimental
