// Export Manager for PDF and JPG
class ExportManager {
    constructor() {
        this.setupEventListeners();
    }
    
    /**
     * Setup export button event listeners
     */
    setupEventListeners() {
        const pdfBtn = document.getElementById('export-pdf-btn');
        const jpgBtn = document.getElementById('export-jpg-btn');
        
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => this.exportToPDF());
        }
        
        if (jpgBtn) {
            jpgBtn.addEventListener('click', () => this.exportToJPG());
        }
    }
    
    /**
     * Export ECG to PDF
     */
    async exportToPDF() {
        try {
            const svgElement = document.getElementById('ecg-svg');
            if (!svgElement) {
                alert('No ECG to export');
                return;
            }
            
            const width = svgElement.viewBox.baseVal.width || svgElement.width.baseVal.value;
            const height = svgElement.viewBox.baseVal.height || svgElement.height.baseVal.value;
            
            // Clone SVG and apply inline styles
            const clonedSvg = this.cloneSVGWithStyles(svgElement);
            
            // Create jsPDF instance
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: width > height ? 'l' : 'p',
                unit: 'pt',
                format: [width, height]
            });
            
            // Add title and metadata
            const params = stateManager.getParameters();
            const metrics = stateManager.getState().calculatedMetrics;
            
            pdf.setFontSize(10);
            pdf.text(`ECG Builder - Generated: ${new Date().toLocaleString()}`, 20, height + 20);
            pdf.text(`HR: ${params.heartRate} bpm | Calculated: ${metrics.bpm} bpm`, 20, height + 35);
            
            // Convert SVG to PDF
            const svgString = new XMLSerializer().serializeToString(clonedSvg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                pdf.save('ecg-' + Date.now() + '.pdf');
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
            
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Error exporting PDF: ' + error.message);
        }
    }
    
    /**
     * Clone SVG with inline styles for proper export
     */
    cloneSVGWithStyles(svgElement) {
        const clone = svgElement.cloneNode(true);
        
        // Apply styles to ECG lines
        clone.querySelectorAll('.ecg-line').forEach(path => {
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000000');
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('shape-rendering', 'geometricPrecision');
        });
        
        // Apply styles to minor grid
        clone.querySelectorAll('.minor-grid').forEach(line => {
            line.setAttribute('stroke', '#fce0e0');
            line.setAttribute('stroke-width', '0.5');
            line.setAttribute('shape-rendering', 'crispEdges');
        });
        
        // Apply styles to major grid
        clone.querySelectorAll('.major-grid').forEach(line => {
            line.setAttribute('stroke', '#f0a0a0');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('shape-rendering', 'crispEdges');
        });
        
        // Apply styles to calibration pulse
        clone.querySelectorAll('.calibration-pulse').forEach(path => {
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000000');
            path.setAttribute('stroke-width', '1.5');
        });
        
        // Apply background color
        clone.querySelectorAll('rect[fill]').forEach(rect => {
            const fill = rect.getAttribute('fill');
            if (fill && fill.includes('fff')) {
                rect.setAttribute('fill', '#ffffff');
            }
        });
        
        return clone;
    }
    
    /**
     * Export ECG to JPG
     */
    exportToJPG() {
        try {
            const svgElement = document.getElementById('ecg-svg');
            if (!svgElement) {
                alert('No ECG to export');
                return;
            }
            
            // Clone SVG with inline styles
            const clonedSvg = this.cloneSVGWithStyles(svgElement);
            const svgString = new XMLSerializer().serializeToString(clonedSvg);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width * 2; // Higher resolution
                canvas.height = img.height * 2;
                
                // White background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw SVG
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to blob and download
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'ecg-' + Date.now() + '.jpg';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 'image/jpeg', 0.95);
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
            
        } catch (error) {
            console.error('JPG export error:', error);
            alert('Error exporting JPG: ' + error.message);
        }
    }
}

// Create global export manager instance
const exportManager = new ExportManager();
