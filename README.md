# ECG Builder - Interactive 12-Lead ECG Generator

A web-based application for generating realistic, medically accurate 12-lead ECG visualizations for medical education. Built with D3.js and Gaussian-based waveform generation.

## Features

### Core Functionality
- **12-Lead ECG Rendering**: Displays all standard ECG leads (D1, D2, D3, aVR, aVL, aVF, V1-V6) with medically accurate grid
- **Gaussian Waveform Generation**: Mathematical model using Gaussian summation for realistic ECG morphology
- **Real-time Parameter Adjustment**: Modify heart rate, intervals, amplitudes, and see immediate updates
- **Calculated BPM Display**: Automatic beat detection and BPM calculation from generated waveform

### Medical Patterns
- **Arrhythmias**:
  - Sinus Tachycardia/Bradycardia
  - Atrial Fibrillation
  - Atrial Flutter
  - Ventricular Tachycardia
  - AV Blocks (1st degree, 2nd degree Mobitz I & II)

- **Bundle Blocks**:
  - RBBB (Right Bundle Branch Block)
  - LBBB (Left Bundle Branch Block)
  - Hemiblocks (LAFB, LPFB)

- **Pathologies**:
  - STEMI (Anterior, Inferior, Lateral, Posterior)
  - NSTEMI
  - Left Ventricular Hypertrophy
  - Right Ventricular Hypertrophy

### Advanced Features
- **Automated ECG Analysis**: Click "Análise Automática" button for AI-powered interpretation
  - Heart rate analysis
  - Rhythm assessment
  - Interval measurements (PR, QRS, QT)
  - Cardiac axis calculation
  - ST segment analysis
  - Overall interpretation

- **Template Presets**: Quick-load common ECG patterns
  - Normal ECG
  - Various MIs
  - Arrhythmias
  - Bundle blocks
  - Hypertrophy patterns

- **Export Options**:
  - PDF export with metadata
  - High-resolution JPG export

## Project Structure

```
ecg-builder/
├── index.html                          # Main HTML file
├── styles/
│   └── ecg-builder.css                 # Application styles
├── src/
│   ├── utils/
│   │   ├── constants.js                # Medical constants and defaults
│   │   └── state-manager.js            # Application state management
│   ├── core/
│   │   ├── ecg-generator.js            # Gaussian-based ECG generation
│   │   ├── lead-calculator.js          # 12-lead mathematical relationships
│   │   └── grid-renderer.js            # D3.js grid and waveform rendering
│   ├── models/
│   │   ├── arrhythmias.js              # Arrhythmia pattern modifiers
│   │   └── pathologies.js              # Pathology pattern modifiers
│   ├── components/
│   │   ├── parameter-panel.js          # UI parameter controls
│   │   ├── ecg-canvas.js               # ECG rendering component
│   │   ├── export-manager.js           # PDF/JPG export
│   │   ├── analysis-engine.js          # Automated ECG analysis
│   │   └── templates.js                # Template presets manager
│   └── app.js                          # Main application entry point
```

## Technical Details

### ECG Generation Algorithm
The application uses Gaussian summation to generate realistic ECG waveforms:

1. **Base Waveform**: Each cardiac cycle is composed of P, Q, R, S, T, and U waves
2. **Gaussian Components**: Each wave is modeled as a Gaussian function with specific amplitude, position, and width
3. **12-Lead Calculation**: Einthoven's Triangle and Goldberger equations derive all leads from the master cardiac vector
4. **Modifications**: Arrhythmias and pathologies modify the base waveform mathematically

### Medical Accuracy
- **Paper Speed**: 25 mm/s (standard)
- **Amplitude**: 10 mm/mV calibration
- **Grid**: 1mm minor boxes, 5mm major boxes (pink ECG paper style)
- **Sampling Rate**: 500 Hz
- **Normal Ranges**: Based on AHA/ESC guidelines

### Lead Relationships
- **Limb Leads**: D1, D2, D3 using Einthoven's Triangle
- **Augmented Leads**: aVR, aVL, aVF using Goldberger equations
- **Precordial Leads**: V1-V6 using 3D cardiac vector projections

## Usage

### Basic Usage
1. Open `index.html` in a modern web browser
2. Adjust parameters in the left panel
3. ECG updates automatically
4. Use templates for quick common patterns

### Parameter Controls
- **Frequência Cardíaca**: Heart rate (30-200 bpm)
- **Intervalos**: PR, QT, QRS durations
- **Amplitudes**: P, QRS, T, U wave heights
- **Arritmias**: Select rhythm abnormalities
- **Bloqueios**: Bundle branch blocks
- **Patologias**: Myocardial infarction patterns

### Analysis
1. Generate desired ECG pattern
2. Click "📊 Análise Automática"
3. View detailed interpretation including:
   - Rate and rhythm
   - Intervals
   - Axis
   - Morphology
   - ST/T wave changes
   - Overall diagnosis

### Export
- **PDF**: Vector quality, includes metadata
- **JPG**: High-resolution raster image

### Keyboard Shortcuts
- `Ctrl+Z`: Undo last change
- `Ctrl+S`: Export to PDF
- `Ctrl+R`: Reset to defaults
- `Ctrl+A`: Run automated analysis

## Dependencies

- **D3.js v7**: SVG rendering and visualization
- **jsPDF**: PDF export functionality
- No build tools required - pure JavaScript

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with SVG and ES6 support

## Educational Use

This tool is designed for:
- Medical students learning ECG interpretation
- Teachers creating lecture materials
- Clinicians demonstrating pathological patterns
- Self-study and practice

## Debug Console

Open browser console and use `window.debugECG` for debugging:

```javascript
debugECG.getState()           // View current state
debugECG.getParameters()      // View parameters
debugECG.analyze()            // Run analysis
debugECG.exportPDF()          // Export PDF
debugECG.loadTemplate('afib') // Load template
debugECG.templates            // List templates
```

## Future Enhancements

Potential additions:
- More arrhythmias (PACs, PVCs, complete heart block)
- Drug effects simulation
- Electrolyte abnormalities
- Pacemaker patterns
- Comparison view (before/after)
- Quiz mode for education
- Save/load custom configurations

## License

Educational use - open source

## Credits

Built with:
- D3.js for visualization
- Gaussian mathematical model for ECG synthesis
- Medical accuracy based on cardiology guidelines

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: Production Ready
