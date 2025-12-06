# Quick Reference Guide - Beta ECG Patterns

## 🚑 AHA ACLS Critical Rhythms

### Cardiac Arrest Rhythms

| Rhythm | Shockable? | Rate | Key Features | Code |
|--------|-----------|------|--------------|------|
| **VFib (Coarse)** | ✅ Yes | N/A | Chaotic, large amplitude | `vfib-coarse` |
| **VFib (Fine)** | ✅ Yes | N/A | Chaotic, small amplitude | `vfib-fine` |
| **Pulseless VT** | ✅ Yes | 180-220 | Wide QRS, regular | `pulseless-vt` |
| **Asystole** | ❌ No | None | Flat line | `asystole` |
| **PEA** | ❌ No | 40-60 | Organized, no pulse | `pea` |

### Bradycardia/Block

| Rhythm | Pacemaker? | Rate | Key Features | Code |
|--------|-----------|------|--------------|------|
| **Complete Heart Block** | Yes | A:75, V:35 | AV dissociation | `complete-heart-block` |
| **Agonal Rhythm** | No | <20 | Dying heart | `agonal` |

### Tachycardia

| Rhythm | Treatment | Rate | Key Features | Code |
|--------|-----------|------|--------------|------|
| **Torsades** | Magnesium | 200-250 | Twisting QRS | `torsades` |

---

## 💊 Electrolyte Abnormalities

### Hyperkalemia (High K+)

| Level | ECG Changes | Clinical Priority | Code |
|-------|-------------|------------------|------|
| **Mild** (5.5-6.5) | Peaked T waves | Monitor | `hyperkalemia-mild` |
| **Moderate** (6.5-8.0) | Wide QRS, flat P | Treat urgently | `hyperkalemia-moderate` |
| **Severe** (>8.0) | Sine wave | EMERGENCY | `hyperkalemia-severe` |

**Mnemonic**: "PEAKED T waves"

---

### Hypokalemia (Low K+)

| Level | ECG Changes | Clinical Priority | Code |
|-------|-------------|------------------|------|
| **Mild** (3.0-3.5) | Small U waves | Replace K+ | `hypokalemia-mild` |
| **Moderate** (2.5-3.0) | Prominent U waves, ST↓ | Monitor closely | `hypokalemia-moderate` |
| **Severe** (<2.5) | Large U waves, flat T | Arrhythmia risk | `hypokalemia-severe` |

**Mnemonic**: "U waves are UNDER normal K+"

---

## 🫀 STEMI Patterns

### Localization by Leads

| MI Location | ST Elevation Leads | Reciprocal ST↓ | Coronary Artery | Code |
|-------------|-------------------|----------------|-----------------|------|
| **Anterior** | V1-V4 | II, III, aVF | LAD | `stemi-anterior` |
| **Inferior** | II, III, aVF | I, aVL | RCA or LCx | `stemi-inferior` |
| **Lateral** | I, aVL, V5-V6 | II, III, aVF | LCx | `stemi-lateral` |
| **Posterior** | V7-V9 | V1-V3 (tall R) | LCx | `stemi-posterior` |
| **Septal** | V1-V2 | - | LAD | `stemi-septal` |

### STEMI Evolution Stages

| Stage | Timing | ECG Changes |
|-------|--------|-------------|
| **Hyperacute** | Minutes-Hours | Peaked T waves, minimal ST↑ |
| **Acute** | Hours | Tombstone ST↑, Q waves starting |
| **Evolved** | Days | Pathologic Q, T inversion |
| **Old** | Weeks-Months | Persistent Q, normalized ST-T |

**Usage**:
```javascript
params.miStage = 'acute'; // or 'evolved'
```

---

## 🔌 Bundle Branch Blocks

### RBBB (Right Bundle Branch Block)

**Mnemonic**: "**MarroW**" (M in V1, W in V6)

| Lead | Pattern | Description |
|------|---------|-------------|
| V1, V2 | RSR' | "Rabbit ears" - M shape |
| V5, V6, I | Wide S | W shape |
| All | QRS >120ms | Wide complex |

**Code**: `rbbb`

---

### LBBB (Left Bundle Branch Block)

**Mnemonic**: "**WiLLiaM MarroW**" (W in V1, M in V6)

| Lead | Pattern | Description |
|------|---------|-------------|
| V1, V2 | QS or rS | Deep S, small r |
| V5, V6, I | Broad R | Monophasic, notched |
| All | QRS >120ms | No septal Q |

**Code**: `lbbb`

**⚠️ LBBB + Chest Pain**: Use Sgarbossa criteria for STEMI

---

## 🔥 Pericarditis

**Classic Triad**:
1. Diffuse ST elevation (concave ⌣)
2. PR depression (except aVR)
3. aVR: ST↓ + PR↑

**vs STEMI Differences**:

| Feature | Pericarditis | STEMI |
|---------|--------------|-------|
| ST shape | Concave ⌣ | Convex ⌢ |
| Distribution | Diffuse | Regional |
| Reciprocal | None | Yes |
| PR segment | Depressed | Normal |

**Code**: `pericarditis`

---

## 📊 ECG Parameter Reference

### Normal Values

| Parameter | Normal Range | Units |
|-----------|-------------|-------|
| Heart Rate | 60-100 | bpm |
| PR Interval | 120-200 | ms |
| QRS Duration | 80-120 | ms |
| QT Interval | 350-440 | ms |
| QTc | <450 (M), <460 (F) | ms |

### Pathologic Values

| Finding | Threshold | Significance |
|---------|-----------|--------------|
| Bradycardia | <60 bpm | Slow heart rate |
| Tachycardia | >100 bpm | Fast heart rate |
| 1° AV Block | PR >200ms | Delayed conduction |
| Wide QRS | >120ms | Bundle block or VT |
| Long QT | QTc >500ms | Torsades risk |

---

## 🎯 Quick Clinical Correlations

### VFib
- **Conscious?** No (cardiac arrest)
- **Pulse?** No
- **Treatment**: Immediate CPR + defibrillation
- **Drugs**: Epinephrine, amiodarone

### PEA
- **Conscious?** No (cardiac arrest)
- **Pulse?** No (despite electrical activity)
- **Treatment**: CPR + treat cause (H's & T's)
- **Reversible causes**: 
  - Hypovolemia, Hypoxia, H+ (acidosis), Hypo/hyperkalemia
  - Hypothermia, Tension pneumothorax, Tamponade, Toxins, Thrombosis

### Complete Heart Block
- **Conscious?** Possibly (depends on rate)
- **Pulse?** Yes (slow)
- **Treatment**: Pacemaker (temporary → permanent)
- **Risk**: Syncope (Stokes-Adams attacks)

### Hyperkalemia
- **Symptoms**: Weakness, paresthesias
- **ECG Progression**: T peaked → P flat → QRS wide → Sine wave → Asystole
- **Treatment**: 
  1. Calcium (stabilize membrane)
  2. Insulin + Glucose (shift K+ into cells)
  3. Dialysis (remove K+)

### STEMI
- **Symptoms**: Chest pain, dyspnea, diaphoresis
- **Time is muscle**: Door-to-balloon <90 min
- **Treatment**: 
  - Aspirin
  - Antiplatelet (P2Y12 inhibitor)
  - Anticoagulation
  - PCI or fibrinolysis

---

## 💡 Teaching Tips

### For ACLS Training

1. **Practice Recognition**:
   - Generate each rhythm
   - Time students to identify
   - Practice shock vs no-shock decision

2. **Algorithm Practice**:
   - VFib/Pulseless VT → Shock → CPR → Epinephrine
   - Asystole/PEA → CPR → Epinephrine → Find cause

3. **Scenario Building**:
   ```javascript
   // Simulate VFib → Shock → Organized rhythm → ROSC
   Step 1: vfib-coarse
   Step 2: After shock → pea
   Step 3: After treatment → normal sinus
   ```

---

### For ECG Interpretation

1. **Systematic Approach**:
   - Rate
   - Rhythm
   - Axis
   - Intervals (PR, QRS, QT)
   - Morphology (P, QRS, ST, T)

2. **Pattern Recognition**:
   - Generate each pathology
   - Compare side-by-side
   - Identify key differences

3. **Progressive Learning**:
   ```
   Week 1: Normal ECG + rate/rhythm
   Week 2: Bundle blocks
   Week 3: MI patterns
   Week 4: Electrolyte abnormalities
   Week 5: ACLS rhythms
   ```

---

### For Exam Preparation

**Common Exam Questions**:

1. ❓ "This ECG shows ST elevation in V1-V4. What is the diagnosis?"
   - Answer: Anterior STEMI (LAD occlusion)

2. ❓ "Peaked T waves and wide QRS. What lab abnormality?"
   - Answer: Hyperkalemia

3. ❓ "RSR' in V1. What is this?"
   - Answer: RBBB

4. ❓ "Diffuse ST elevation with PR depression. Diagnosis?"
   - Answer: Pericarditis

5. ❓ "Rate 220, twisting QRS. What rhythm?"
   - Answer: Torsades de Pointes

---

## 🔍 Troubleshooting

### Pattern Not Showing Correctly?

1. Check code spelling
2. Verify parameters are set
3. Ensure beta version loaded
4. Check console for errors

### Want to Combine Patterns?

```javascript
// Example: STEMI + LBBB
const leads = applyPathologyBeta(allLeads, 'stemi-anterior', params);
const final = applyPathologyBeta(leads, 'lbbb', params);
```

**Note**: Some combinations not physiologically realistic!

---

## 📚 Additional Resources

- **AHA ACLS Manual**: Official guidelines
- **Dubin's Rapid Interpretation**: ECG fundamentals
- **Life in the Fast Lane**: ECG library (lifeinthefastlane.com)
- **ECGpedia**: Free ECG course (ecgpedia.org)

---

**Quick Reference Version**: 2.0.0-beta  
**For Full Details**: See VALIDATION.md  
**For Code Examples**: See COMPARISON.md
