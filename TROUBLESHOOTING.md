# ECG Builder - Troubleshooting Guide

## Common Issues and Solutions

### 🚨 ECG Not Rendering

**Symptoms**: Blank white canvas, no ECG visible

**Solutions**:
1. **Check browser console** (F12) for errors
2. **Verify D3.js loaded**: Check network tab for d3.v7.min.js
3. **Clear browser cache**: Ctrl+Shift+Del
4. **Try different browser**: Chrome/Edge recommended
5. **Check file paths**: Ensure all files are in correct folders

**Quick Fix**:
```javascript
// Open console (F12) and type:
debugECG.getState()
// If this returns data, the app is working
```

---

### 📊 Analysis Button Not Working

**Symptoms**: Clicking "Análise Automática" does nothing

**Solutions**:
1. **Generate ECG first**: Adjust any parameter to trigger generation
2. **Check console**: Look for JavaScript errors
3. **Verify lead data**: Type `debugECG.getLeadData()` in console
4. **Reload page**: Sometimes state gets corrupted

**Manual Analysis**:
```javascript
debugECG.analyze()  // Run analysis from console
```

---

### 💾 Export Buttons Not Working

**Symptoms**: PDF/JPG export fails or produces blank files

**Solutions**:

#### PDF Export Issues:
1. **Check jsPDF loaded**: Look in network tab for jspdf.umd.min.js
2. **Popup blocker**: Disable for this site
3. **Try alternative**: Use JPG export instead
4. **Check browser support**: Update to latest version

#### JPG Export Issues:
1. **Canvas security**: If using file:// protocol, try http://
2. **SVG rendering**: Ensure ECG is visible before exporting
3. **Browser compatibility**: Chrome/Edge work best

**Alternative Export**:
- Right-click on ECG → "Save Image As"
- Use browser print → "Save as PDF"

---

### 🎛️ Parameters Not Updating

**Symptoms**: Changing values doesn't update ECG

**Solutions**:
1. **Wait for debounce**: Changes take ~300ms
2. **Check input focus**: Click outside input after changing
3. **Refresh page**: Sometimes event listeners detach
4. **Use templates**: Click a template button to reset

**Force Update**:
```javascript
ecgCanvas.render()  // Manually trigger render
```

---

### 📱 Mobile/Responsive Issues

**Symptoms**: Layout broken on smaller screens

**Solutions**:
1. **Rotate device**: App works best in landscape
2. **Zoom out**: Browser zoom might affect layout
3. **Use desktop**: Full features require larger screen
4. **Check CSS**: Ensure ecg-builder.css is loaded

**Desktop Recommended**: For best experience, use desktop browser (1024px+ width)

---

### 🔄 Template Loading Failed

**Symptoms**: Template buttons don't change ECG

**Solutions**:
1. **Check console**: Look for errors
2. **Verify template data**: Type `debugECG.templates`
3. **Manual load**: 
```javascript
debugECG.loadTemplate('normal')
```
4. **Reset state**: Ctrl+R to reset to defaults

---

### 🎨 Grid Not Displaying Correctly

**Symptoms**: Missing grid lines or wrong colors

**Solutions**:
1. **Check CSS**: Verify ecg-builder.css loaded
2. **Browser compatibility**: Update browser
3. **SVG support**: Ensure browser supports SVG
4. **Zoom level**: Reset browser zoom to 100%

**Expected Grid Colors**:
- Minor lines: Light pink (#fce0e0)
- Major lines: Darker pink (#f0a0a0)
- ECG line: Black (#000000)

---

### 📏 Incorrect BPM Calculation

**Symptoms**: Calculated BPM doesn't match input

**Solutions**:
1. **This is normal**: Calculated BPM is detected from waveform
2. **Check arrhythmia**: Some arrhythmias alter rate
3. **Verify peaks**: Algorithm detects R-wave peaks
4. **Expected variation**: ±5 bpm is normal

**Understanding BPM**:
- **Input HR**: Your target heart rate
- **Calculated BPM**: Detected from generated waveform
- **May differ**: Due to arrhythmias or rounding

---

### 🔗 D3.js or jsPDF Not Loading

**Symptoms**: Console errors about D3 or jsPDF undefined

**Solutions**:
1. **Check internet**: Libraries load from CDN
2. **Firewall**: Ensure CDN access allowed
3. **Download locally**: Save libraries to project folder
4. **Update URLs**: Check for latest CDN versions

**Local Installation**:
```html
<!-- Download and use local copies -->
<script src="lib/d3.v7.min.js"></script>
<script src="lib/jspdf.umd.min.js"></script>
```

---

### ⚠️ Analysis Results Incorrect

**Symptoms**: Analysis shows wrong interpretations

**Solutions**:
1. **Parameter-based**: Analysis uses input parameters, not image
2. **Check parameters**: Verify all inputs are correct
3. **Known limitation**: Complex patterns may not analyze perfectly
4. **Educational tool**: Not for clinical diagnosis

**Important**: ECG Builder is for **education only**, not clinical use.

---

### 🖱️ Keyboard Shortcuts Not Working

**Symptoms**: Ctrl+Z, Ctrl+S, etc. don't work

**Solutions**:
1. **Focus page**: Click on page content first
2. **Browser override**: Some browsers block shortcuts
3. **Use buttons**: Use UI buttons instead
4. **Check OS**: Some OS shortcuts override browser

**Available Shortcuts**:
- Ctrl+Z: Undo
- Ctrl+S: Export PDF
- Ctrl+R: Reset (with confirmation)
- Ctrl+A: Analysis

---

### 🐛 General Debugging Steps

1. **Open Console**: Press F12
2. **Check for errors**: Look in Console tab
3. **Verify state**: Type `debugECG.getState()`
4. **Check network**: Ensure all files loaded
5. **Clear cache**: Hard refresh (Ctrl+Shift+R)
6. **Try different browser**: Chrome, Edge, Firefox
7. **Check file integrity**: Ensure all files present

---

### 🔍 Debug Console Commands

```javascript
// Get current state
debugECG.getState()

// Get parameters
debugECG.getParameters()

// Get lead data
debugECG.getLeadData()

// Force render
ecgCanvas.render()

// Run analysis
debugECG.analyze()

// List templates
debugECG.templates

// Load template
debugECG.loadTemplate('normal')

// Export
debugECG.exportPDF()
debugECG.exportJPG()

// Check components
console.log(stateManager)
console.log(ecgGenerator)
console.log(leadCalculator)
console.log(gridRenderer)
```

---

### 📂 File Structure Check

**Required Files**:
```
ecg-builder/
├── index.html ✅
├── styles/
│   └── ecg-builder.css ✅
└── src/
    ├── utils/
    │   ├── constants.js ✅
    │   └── state-manager.js ✅
    ├── core/
    │   ├── ecg-generator.js ✅
    │   ├── lead-calculator.js ✅
    │   └── grid-renderer.js ✅
    ├── models/
    │   ├── arrhythmias.js ✅
    │   └── pathologies.js ✅
    ├── components/
    │   ├── parameter-panel.js ✅
    │   ├── ecg-canvas.js ✅
    │   ├── export-manager.js ✅
    │   ├── analysis-engine.js ✅
    │   └── templates.js ✅
    └── app.js ✅
```

**Missing File**: Check console for 404 errors

---

### 🌐 Browser Compatibility

**Fully Supported**:
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

**Limited Support**:
- ⚠️ Internet Explorer: Not supported
- ⚠️ Older browsers: May have issues

**Recommended**: Chrome or Edge (latest version)

---

### 🆘 Still Not Working?

1. **Check all files present**: Verify file structure
2. **Review console errors**: Read error messages carefully
3. **Test in incognito**: Rule out extension conflicts
4. **Try clean install**: Delete and re-download all files
5. **Check permissions**: Ensure files are readable
6. **Contact support**: Provide console error logs

---

### 💡 Tips for Best Performance

1. **Use local server**: Run `start-server.ps1` instead of file://
2. **Modern browser**: Keep browser updated
3. **Disable extensions**: Some extensions interfere
4. **Sufficient RAM**: Close other tabs
5. **Clear cache**: Periodically clear browser cache

---

### 🎯 Known Limitations

1. **File protocol**: Some features need http:// (not file://)
2. **Complex arrhythmias**: Some patterns simplified
3. **Export quality**: PDF better than JPG for quality
4. **Mobile experience**: Desktop recommended
5. **Educational only**: Not for clinical diagnosis

---

### ✅ Quick Checklist

Before reporting issues:
- [ ] All files in correct locations
- [ ] Browser console checked for errors
- [ ] Internet connection active (for CDN libraries)
- [ ] Browser is up to date
- [ ] Tried in incognito mode
- [ ] Cache cleared
- [ ] Different browser tested
- [ ] Debug commands tried

---

### 📞 Getting Help

1. **Check README.md**: Technical documentation
2. **Read quick-start.html**: User guide
3. **Use debug console**: `debugECG` commands
4. **Review this guide**: Common solutions
5. **Check browser console**: Error messages

---

**Most Common Fix**: Clear cache and hard refresh (Ctrl+Shift+R)

**99% of issues**: Related to file paths or CDN loading

**Remember**: This is an educational tool - perfect ECG accuracy not always needed!
