// Medical Constants and Default Values
const MEDICAL_CONSTANTS = {
    // Standard ECG Paper Properties
    PAPER_SPEED_MM_PER_SEC: 25, // Standard paper speed
    AMPLITUDE_MM_PER_MV: 10,    // Standard amplitude calibration
    SMALL_BOX_MM: 1,            // 1mm x 1mm
    LARGE_BOX_MM: 5,            // 5mm x 5mm
    SMALL_BOX_TIME_SEC: 0.04,   // 1mm = 0.04s at 25mm/s
    LARGE_BOX_TIME_SEC: 0.20,   // 5mm = 0.20s at 25mm/s
    SMALL_BOX_VOLTAGE_MV: 0.1,  // 1mm = 0.1mV
    LARGE_BOX_VOLTAGE_MV: 0.5,  // 5mm = 0.5mV
    
    // Sampling
    SAMPLING_RATE: 500,         // 500 Hz (standard for ECG)
    
    // Normal Ranges (in milliseconds where applicable)
    NORMAL_RANGES: {
        heartRate: { min: 60, max: 100, unit: 'bpm' },
        prInterval: { min: 120, max: 200, unit: 'ms' },
        qrsDuration: { min: 60, max: 100, unit: 'ms' },
        qtInterval: { min: 350, max: 450, unit: 'ms' },
        qtcInterval: { min: 350, max: 450, unit: 'ms' },
        pWaveDuration: { min: 60, max: 120, unit: 'ms' },
        pWaveAmplitude: { min: 0.05, max: 0.25, unit: 'mV' },
        qrsAmplitude: { min: 0.5, max: 2.5, unit: 'mV' },
        tWaveAmplitude: { min: 0.1, max: 0.6, unit: 'mV' }
    },
    
    // ECG Lead Labels
    LEAD_LABELS: {
        limb: ['D1', 'D2', 'D3'],
        augmented: ['aVR', 'aVL', 'aVF'],
        precordial: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6']
    },
    
    // Lead Display Order (standard 12-lead format)
    LEAD_ORDER: ['D1', 'D2', 'D3', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'],
    
    // Lead Layout (3x4 or 12-channel strip)
    LEAD_LAYOUT: {
        rows: 4,
        cols: 3,
        longStrip: 'D2' // Long rhythm strip at bottom
    }
};

// Default ECG Parameters
const DEFAULT_PARAMETERS = {
    heartRate: 76,
    pWaveDuration: 0.12,
    pWaveAmplitude: 0.15,
    prInterval: 0.12,
    prLevel: 0,
    qrsWidth: 0.175,
    qrsAmplitude: 10,
    qtInterval: 0.15,
    stAmplitude: 0.15,
    tAmplitude: 0.15,
    uAmplitude: 0,
    arrhythmia: 'none',
    bundleBlock: 'none',
    pathology: 'none',
    pacemaker: 'none'
};

// Gaussian Wave Component Templates
const WAVE_COMPONENTS = {
    P: {
        name: 'P',
        defaultAmplitude: 0.15,
        defaultDuration: 80,    // ms
        defaultSigma: 0.03,
        description: 'Atrial depolarization'
    },
    Q: {
        name: 'Q',
        defaultAmplitude: -0.1,
        defaultDuration: 40,
        defaultSigma: 0.01,
        description: 'Septal depolarization'
    },
    R: {
        name: 'R',
        defaultAmplitude: 1.3,
        defaultDuration: 50,
        defaultSigma: 0.008,
        description: 'Ventricular depolarization (upward)'
    },
    S: {
        name: 'S',
        defaultAmplitude: -0.25,
        defaultDuration: 40,
        defaultSigma: 0.01,
        description: 'Late ventricular depolarization'
    },
    T: {
        name: 'T',
        defaultAmplitude: 0.35,
        defaultDuration: 160,
        defaultSigma: 0.06,
        description: 'Ventricular repolarization'
    },
    U: {
        name: 'U',
        defaultAmplitude: 0.05,
        defaultDuration: 100,
        defaultSigma: 0.04,
        description: 'Purkinje fiber repolarization'
    }
};

// Lead Vector Angles (in degrees) - Hexaxial Reference System
const LEAD_VECTORS = {
    'D1': 0,      // Lead I
    'D2': 60,     // Lead II
    'D3': 120,    // Lead III
    'aVR': -150,  // aVR
    'aVL': -30,   // aVL
    'aVF': 90     // aVF
};

// Precordial Lead Position Vectors (3D spatial positions)
const PRECORDIAL_VECTORS = {
    'V1': { x: 0.8, y: 0.4, z: 0.45, description: 'Right ventricle' },
    'V2': { x: 0.7, y: 0.5, z: 0.5, description: 'Interventricular septum' },
    'V3': { x: 0.5, y: 0.65, z: 0.5, description: 'Between V2 and V4' },
    'V4': { x: 0.3, y: 0.8, z: 0.5, description: 'Left ventricle (apex)' },
    'V5': { x: 0.2, y: 0.7, z: 0.6, description: 'Left ventricle (lateral)' },
    'V6': { x: 0.1, y: 0.6, z: 0.7, description: 'Left ventricle (lateral)' }
};

// Color Scheme
const COLORS = {
    gridMajor: '#f0a0a0',
    gridMinor: '#fce0e0',
    ecgLine: '#000000',
    background: '#ffffff',
    calibrationPulse: '#000000',
    leadLabel: '#8B0000',
    abnormal: '#dc3545',
    warning: '#ffc107',
    normal: '#28a745'
};
