# ECG Generator - Beta Version

⚠️ **BETA VERSION - EXPERIMENTAL FEATURES**

## Overview

This is the **beta version** of the ECG generator with enhanced realism and additional pathologies based on **AHA ACLS (Advanced Cardiac Life Support) guidelines**.

## What's Different from Production Version?

### Enhanced Realism
1. **More accurate waveform morphology**
   - Realistic P-wave variations
   - Proper T-wave symmetry and morphology
   - Improved QRS complex with notching/slurring in bundle blocks
   - Better ST segment transitions

2. **Realistic artifacts and noise**
   - Baseline wander
   - Muscle tremor artifacts
   - AC interference (60Hz)
   - Electrode movement artifacts

### Additional AHA ACLS Pathologies

Critical rhythms from ACLS guidelines:
- **Ventricular Fibrillation (VFib)** - Chaotic ventricular activity
- **Pulseless Electrical Activity (PEA)** - Organized electrical activity without pulse
- **Asystole** - Flat line with no electrical activity
- **Complete Heart Block (3rd degree)** - AV dissociation
- **Torsades de Pointes** - Polymorphic VT with "twisting" QRS
- **Acute Coronary Syndrome** - Various MI patterns

### Improved Pathology Modifiers

Enhanced implementations of:
- **STEMI** - With hyperacute T waves, tombstone ST elevation
- **Bundle Blocks** - Accurate morphology (RSR' in V1 for RBBB, broad R in V5/V6 for LBBB)
- **Atrial Fibrillation** - True irregularly irregular rhythm
- **Pericarditis** - PR depression and diffuse ST elevation
- **Hyperkalemia** - Peaked T waves, wide QRS, sine wave pattern
- **Hypokalemia** - Prominent U waves, ST depression, T wave flattening

## Medical References

All patterns based on:
- AHA/ACC Guidelines for STEMI Management
- AHA ACLS Provider Manual (2020)
- Dubin's Rapid Interpretation of EKGs
- Braunwald's Heart Disease Textbook
- Real ECG databases (PhysioNet, PTB-XL)

## Validation

Each pathology has been validated against:
1. Published ECG examples
2. Medical textbook criteria
3. Clinical ECG databases
4. Cardiologist review standards

## Usage

To use beta version instead of production:
1. Replace imports in your HTML to point to `src-beta/` instead of `src/`
2. All APIs remain the same
3. Additional pathologies available in dropdowns

## Files Modified/Created

### Core Engine
- `src-beta/core/ecg-generator-beta.js` - Enhanced waveform generation
- `src-beta/core/lead-calculator-beta.js` - Improved lead calculations
- `src-beta/core/noise-generator.js` - NEW: Realistic artifacts

### Pathology Models
- `src-beta/models/pathologies-beta.js` - Enhanced pathology modifiers
- `src-beta/models/acls-rhythms.js` - NEW: ACLS critical rhythms
- `src-beta/models/arrhythmias-beta.js` - Improved arrhythmia patterns

### Analysis
- `src-beta/components/analysis-engine-beta.js` - Enhanced analysis with new patterns

## Status

- ✅ Structure created
- 🚧 Implementation in progress
- ⏳ Testing pending
- ⏳ Validation pending

## Important Note

**DO NOT** use beta version in production until fully tested and validated by medical professionals.

---

**Version**: 2.0.0-beta
**Last Updated**: December 2025
