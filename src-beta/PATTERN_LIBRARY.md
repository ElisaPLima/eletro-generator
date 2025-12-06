# ECG Pattern Library - Beta v2.0

## Complete Pattern Reference

This document lists all available ECG patterns in the beta version with their codes, characteristics, and use cases.

---

## 🚨 ACLS Critical Rhythms (Cardiac Arrest)

### Shockable Rhythms

| Pattern | Code | Rate | Key Features | ACLS Treatment |
|---------|------|------|--------------|----------------|
| **VFib Coarse** | `vfib-coarse` | N/A | Chaotic, amplitude >0.3mV | Defibrillate → CPR → Epi → Amio |
| **VFib Fine** | `vfib-fine` | N/A | Chaotic, amplitude <0.2mV | CPR → Epi → Defibrillate |
| **Pulseless VT** | `pulseless-vt` | 180-220 | Wide QRS, regular, no pulse | Defibrillate → CPR → Epi → Amio |

### Non-Shockable Rhythms

| Pattern | Code | Rate | Key Features | ACLS Treatment |
|---------|------|------|--------------|----------------|
| **PEA** | `pea` | 40-60 | Organized, no pulse | CPR → Epi → Treat cause |
| **Asystole** | `asystole` | 0 | Flat line | CPR → Epi → Treat cause |
| **V. Standstill** | `ventricular-standstill` | P:60 | P waves only, no QRS | CPR → Pacing |

### Other Critical Rhythms

| Pattern | Code | Rate | Key Features | Treatment |
|---------|------|------|--------------|-----------|
| **Complete Heart Block** | `complete-heart-block` | P:75, V:35 | AV dissociation | Pacemaker |
| **Torsades** | `torsades` | 200-250 | Twisting QRS | Magnesium 2g IV |
| **Agonal** | `agonal` | <20 | Irregular, wide, dying heart | Aggressive CPR |

---

## 🫀 Acute Coronary Syndromes (STEMI)

### By Location

| Pattern | Code | Leads with ST↑ | Reciprocal | Coronary Artery |
|---------|------|---------------|------------|-----------------|
| **Anterior STEMI** | `stemi-anterior` | V1-V4 | II, III, aVF | LAD |
| **Inferior STEMI** | `stemi-inferior` | II, III, aVF | I, aVL | RCA or LCx |
| **Lateral STEMI** | `stemi-lateral` | I, aVL, V5-V6 | II, III, aVF | LCx |
| **Posterior STEMI** | `stemi-posterior` | V7-V9 | V1-V3 (ST↓, tall R) | LCx |
| **Septal STEMI** | `stemi-septal` | V1-V2 | - | LAD (proximal) |

### By Stage

Configure with `params.miStage`:
- `'acute'` - Hyperacute T waves, tombstone ST elevation
- `'evolved'` - Pathologic Q waves, T wave inversion

---

## 💊 Electrolyte Abnormalities

### Hyperkalemia (High Potassium)

| Severity | Code | K+ Level | ECG Changes |
|----------|------|----------|-------------|
| **Mild** | `hyperkalemia-mild` | 5.5-6.5 | Peaked T waves |
| **Moderate** | `hyperkalemia-moderate` | 6.5-8.0 | Peaked T, wide QRS, flat P |
| **Severe** | `hyperkalemia-severe` | >8.0 | Sine wave, very wide QRS |

**Clinical Correlation**:
- Mild: Monitor
- Moderate: Treat urgently
- Severe: EMERGENCY (risk of asystole)

### Hypokalemia (Low Potassium)

| Severity | Code | K+ Level | ECG Changes |
|----------|------|----------|-------------|
| **Mild** | `hypokalemia-mild` | 3.0-3.5 | Small U waves, slight ST↓ |
| **Moderate** | `hypokalemia-moderate` | 2.5-3.0 | Prominent U, ST↓, flat T |
| **Severe** | `hypokalemia-severe` | <2.5 | Large U > T, significant ST↓ |

**Clinical Correlation**:
- All levels: Arrhythmia risk
- Increases digoxin toxicity
- Replace potassium

---

## ⚡ Arrhythmias (Enhanced)

### Atrial Arrhythmias

| Pattern | Code | Rate | Rhythm | Key Features |
|---------|------|------|--------|--------------|
| **Atrial Fibrillation** | `afib` | Variable | Irregularly irregular | No P waves, fibrillatory waves |
| **Atrial Flutter 2:1** | `aflutter-2to1` | V:150 | Regular | Sawtooth F waves, 300 bpm |
| **Atrial Flutter 3:1** | `aflutter-3to1` | V:100 | Regular | Sawtooth F waves, 300 bpm |
| **Atrial Flutter (var)** | `aflutter-variable` | Variable | Irregular | Variable AV conduction |

### Ventricular Arrhythmias

| Pattern | Code | Rate | QRS | Key Features |
|---------|------|------|-----|--------------|
| **Monomorphic VT** | `monomorphic-vt` | 150-200 | Wide | Regular, wide QRS, AV dissociation |

### AV Blocks

| Pattern | Code | PR Interval | Conduction | Key Features |
|---------|------|-------------|------------|--------------|
| **1st Degree** | `1st-degree-av-block` | >200ms | All P conducted | Prolonged PR |
| **2nd Degree Mobitz I** | `wenckebach` | Progressive↑ | Grouped beating | PR lengthens until drop |
| **2nd Degree Mobitz II** | `avblock-2-mobitz2` | Constant | Intermittent drop | Fixed PR, dropped QRS |
| **3rd Degree** | `complete-heart-block` | Variable | None | Complete AV dissociation |

---

## 🔌 Bundle Branch Blocks (Enhanced)

### Right Bundle Branch Block

| Code | QRS Width | V1 Pattern | V6 Pattern |
|------|-----------|------------|------------|
| `rbbb` | >120ms | RSR' (M shape) | Wide S (W shape) |

**Mnemonic**: MaRRoW

**Features**:
- R' wave taller than initial r in V1
- Slurred S wave in V5, V6, I
- Secondary ST-T changes

### Left Bundle Branch Block

| Code | QRS Width | V1 Pattern | V5-V6 Pattern |
|------|-----------|------------|---------------|
| `lbbb` | >120ms | QS or rS | Broad notched R |

**Mnemonic**: WiLLiaM MaRRoW

**Features**:
- No septal Q waves in lateral leads
- Monophasic R in V5, V6
- Discordant ST-T changes

---

## 🔥 Other Pathologies

### Pericarditis

| Code | ST Changes | PR Changes | Distribution |
|------|------------|------------|--------------|
| `pericarditis` | Concave ST↑ | PR↓ (except aVR) | Diffuse |

**vs STEMI**:
- Pericarditis: Concave ST, diffuse, PR depression
- STEMI: Convex ST, regional, reciprocal changes

---

## 📊 Pattern Characteristics Summary

### Timing Intervals

| Interval | Normal | Pathologic Examples |
|----------|--------|---------------------|
| **PR** | 120-200ms | >200ms (1° AV block) |
| **QRS** | 80-120ms | >120ms (BBB, VT) |
| **QT** | 350-440ms | >500ms (Torsades risk) |

### Amplitude Criteria

| Finding | Voltage | Significance |
|---------|---------|--------------|
| **Hyperacute T** | >0.5mV | Early STEMI |
| **ST Elevation** | >0.1mV limb, >0.2mV precordial | STEMI |
| **Peaked T** | Narrow, tall | Hyperkalemia |
| **U Wave** | >T wave | Hypokalemia |

---

## 🎓 Educational Use Cases

### ACLS Training Scenarios

**Scenario 1: Cardiac Arrest**
```javascript
// Simulate arrest sequence
1. Generate: vfib-coarse
2. After shock: pea
3. After treatment: normal sinus
```

**Scenario 2: Bradycardia**
```javascript
// Progressive AV block
1. Generate: 1st-degree-av-block
2. Worsens to: avblock-2-mobitz2
3. Worsens to: complete-heart-block
```

### ECG Interpretation Practice

**Skill Level 1 - Basics**
- Rate and rhythm recognition
- Normal vs abnormal identification
- Basic arrhythmias (afib, vt)

**Skill Level 2 - Intermediate**
- Bundle branch blocks
- AV blocks
- STEMI recognition

**Skill Level 3 - Advanced**
- STEMI localization
- Electrolyte abnormalities
- ACLS critical rhythms

### Clinical Correlation Exercises

**Exercise 1: K+ Level from ECG**
```
Show: hyperkalemia-severe
Ask: What is the K+ level?
Answer: Likely >8.0 mEq/L (sine wave pattern)
```

**Exercise 2: Coronary Artery Occlusion**
```
Show: stemi-anterior
Ask: Which coronary artery is occluded?
Answer: LAD (ST elevation V1-V4)
```

**Exercise 3: ACLS Algorithm**
```
Show: vfib-coarse
Ask: What is your first action?
Answer: Defibrillate (shockable rhythm)
```

---

## 💻 Integration Examples

### Example 1: Generate VFib

```javascript
// Load beta generator
const params = getDefaultParams();
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);

// Apply VFib
const vfib = applyACLSRhythm(baseSignal, 'vfib-coarse', params);

// Add realistic noise
vfib.data = noiseGenerator.addClinicalNoise(vfib.data, {
    baseline: true,
    powerline: false, // No powerline in arrest
    muscle: true      // Artifact from CPR
});
```

### Example 2: Generate Anterior STEMI

```javascript
// Base ECG
const params = getDefaultParams();
const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);

// Apply acute STEMI
const stemi = applyPathologyBeta(allLeads, 'stemi-anterior', {
    ...params,
    miStage: 'acute'  // Hyperacute changes
});

// Add subtle noise
Object.keys(stemi).forEach(leadName => {
    stemi[leadName].data = noiseGenerator.addClinicalNoise(
        stemi[leadName].data,
        { baseline: true, white: true }
    );
});
```

### Example 3: Progressive Hyperkalemia

```javascript
// Simulate K+ rising
const levels = [
    { k: 5.8, code: 'hyperkalemia-mild' },
    { k: 7.2, code: 'hyperkalemia-moderate' },
    { k: 8.5, code: 'hyperkalemia-severe' }
];

levels.forEach(level => {
    const baseSignal = ecgGeneratorBeta.generateECG(params, 10);
    const allLeads = leadCalculator.calculateAll12Leads(baseSignal, params);
    const ecg = applyPathologyBeta(allLeads, level.code, params);
    
    // Display with K+ level annotation
    console.log(`K+ = ${level.k} mEq/L`);
    // Render ECG
});
```

---

## 🔬 Validation Status

### Validated Against

✅ AHA ACLS Guidelines 2020
✅ ACC/AHA STEMI Guidelines
✅ Dubin's Rapid Interpretation of EKGs
✅ Braunwald's Heart Disease Textbook
✅ Published ECG case studies
✅ PhysioNet ECG databases

### Pending Validation

⏳ Formal cardiologist review
⏳ Side-by-side comparison with real patient ECGs
⏳ Student usability testing
⏳ Clinical educator feedback

---

## 📝 Usage Notes

### Combining Patterns

Some patterns can be combined:
```javascript
// STEMI + RBBB (common combination)
const leads = applyPathologyBeta(allLeads, 'stemi-inferior', params);
const final = applyPathologyBeta(leads, 'rbbb', params);
```

**Warning**: Not all combinations are physiologically realistic!

### Contraindicated Combinations

❌ VFib + any organized rhythm
❌ LBBB + STEMI criteria (unreliable)
❌ Asystole + any waves
❌ Multiple electrolyte abnormalities

---

## 🚀 Future Patterns (Planned)

- [ ] Supraventricular Tachycardia (SVT)
- [ ] Multifocal Atrial Tachycardia (MAT)
- [ ] Premature beats (PACs, PVCs)
- [ ] Bigeminy/Trigeminy
- [ ] Hypercalcemia
- [ ] Hypocalcemia
- [ ] Digoxin effect/toxicity
- [ ] Hypothermia (Osborn waves)
- [ ] Pulmonary embolism
- [ ] Brugada syndrome
- [ ] Long QT syndrome
- [ ] WPW syndrome
- [ ] Pacemaker rhythms

---

**Pattern Library Version**: 2.0.0-beta
**Total Patterns**: 34+
**Last Updated**: December 2025
