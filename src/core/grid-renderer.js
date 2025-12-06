// D3.js Grid Renderer for Medical-Accurate ECG Display
class ECGGridRenderer {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.svg = null;
        this.width = 0;
        this.height = 0;
        this.pixelsPerMM = 3.78; // 96 DPI standard
    }
    
    /**
     * Initialize the main SVG container
     */
    initialize() {
        this.container.selectAll('*').remove();
        
        // Calculate dimensions
        const containerWidth = this.container.node().getBoundingClientRect().width;
        this.width = containerWidth - 40;
        this.height = 1000; // Fixed height for 12-lead display
        
        this.svg = this.container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('id', 'ecg-svg');
    }
    
    /**
     * Render all 12 ECG leads in standard format
     * @param {Object} leadData - All 12-lead data
     * @param {Object} params - User parameters
     */
    render12LeadECG(leadData, params) {
        this.initialize();
        
        // Ensure we have valid width
        if (!this.width || this.width <= 0) {
            console.error('Invalid SVG width');
            return;
        }
        
        const leadOrder = MEDICAL_CONSTANTS.LEAD_ORDER;
        const leadsPerRow = 3;
        const rowHeight = 200;
        
        // Use available width and calculate pixels per second for accurate timing
        const colWidth = this.width / leadsPerRow;
        const leadDuration = 2.5; // seconds
        const pixelsPerSecond = colWidth / leadDuration; // This gives us the actual time scale
        
        // Update pixelsPerMM based on paper speed to match the display
        // At 25mm/s, we need: pixels/second ÷ 25mm/s = pixels/mm
        this.pixelsPerMM = pixelsPerSecond / MEDICAL_CONSTANTS.PAPER_SPEED_MM_PER_SEC;
        
        const leadWidth = colWidth;
        const leadHeight = rowHeight;
        
        // Draw continuous background grid for all 12 leads
        this.drawContinuousGrid(this.width, 800);
        
        // Render each lead on top of continuous grid
        leadOrder.forEach((leadName, index) => {
            const row = Math.floor(index / leadsPerRow);
            const col = index % leadsPerRow;
            
            const xOffset = col * colWidth;
            const yOffset = row * rowHeight;
            
            this.renderSingleLead(
                leadData[leadName],
                leadName,
                xOffset,
                yOffset,
                leadWidth,
                leadHeight,
                params
            );
        });
        
        // Add rhythm strip at bottom
        this.renderRhythmStrip(
            leadData.D2,
            'D2 (Rhythm Strip)',
            0,
            800,
            this.width,
            200,
            params
        );
    }
    
    /**
     * Render a single ECG lead
     * @param {Object} leadSignal - Lead signal data
     * @param {string} leadLabel - Lead label
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} width - Lead width
     * @param {number} height - Lead height
     * @param {Object} params - User parameters
     */
    renderSingleLead(leadSignal, leadLabel, x, y, width, height, params) {
        const leadGroup = this.svg.append('g')
            .attr('class', `lead-${leadLabel}`)
            .attr('transform', `translate(${x}, ${y})`);
        
        // Create scales based on paper speed (25mm/s)
        const duration = 2.5; // seconds
        const paperWidthMM = duration * MEDICAL_CONSTANTS.PAPER_SPEED_MM_PER_SEC; // 2.5s * 25mm/s = 62.5mm
        const paperWidthPixels = paperWidthMM * this.pixelsPerMM; // 62.5mm in pixels
        
        // Use actual paper width for accurate timing
        const xScale = d3.scaleLinear()
            .domain([0, duration])
            .range([0, Math.min(paperWidthPixels, width)]); // Use exact paper width or available width
        
        const yScale = d3.scaleLinear()
            .domain([-1.5, 1.5])
            .range([height, 0]);
        
        const displayData = leadSignal.data.slice(0, Math.floor(duration * MEDICAL_CONSTANTS.SAMPLING_RATE));
        
        // Use smooth curve for all leads
        const lineGenerator = d3.line()
            .curve(d3.curveBasis)
            .defined(d => d.mv !== null && d.mv !== undefined)
            .x(d => xScale(d.time))
            .y(d => yScale(d.mv));
        
        leadGroup.append('path')
            .datum(displayData)
            .attr('class', 'ecg-line')
            .attr('fill', 'none')
            .attr('stroke', '#000000')
            .attr('stroke-width', '1.5')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', lineGenerator);
        
        // Draw label
        leadGroup.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .attr('class', 'lead-label')
            .style('font-weight', 'bold')
            .style('font-size', '12px')
            .style('fill', COLORS.leadLabel)
            .text(leadLabel);
    }
    
    /**
     * Render rhythm strip
     * @param {Object} leadSignal - Lead signal data
     * @param {string} label - Strip label
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} width - Strip width
     * @param {number} height - Strip height
     * @param {Object} params - User parameters
     */
    renderRhythmStrip(leadSignal, label, x, y, width, height, params) {
        const stripGroup = this.svg.append('g')
            .attr('class', 'rhythm-strip')
            .attr('transform', `translate(${x}, ${y})`);
        
        // Draw grid for rhythm strip
        this.drawGrid(stripGroup, width, height);
        
        // Create scales based on paper speed (25mm/s)
        const duration = 10; // seconds for rhythm strip
        const paperWidthMM = duration * MEDICAL_CONSTANTS.PAPER_SPEED_MM_PER_SEC; // 10s * 25mm/s = 250mm
        const paperWidthPixels = paperWidthMM * this.pixelsPerMM;
        
        const xScale = d3.scaleLinear()
            .domain([0, duration])
            .range([5, Math.min(paperWidthPixels, width - 5)]);
        
        const yScale = d3.scaleLinear()
            .domain([-1.5, 1.5])
            .range([height, 0]);
        
        // Draw ECG line
        const line = d3.line()
            .curve(d3.curveBasis)
            .defined(d => d.mv !== null && d.mv !== undefined)
            .x(d => xScale(d.time))
            .y(d => yScale(d.mv));
        
        stripGroup.append('path')
            .datum(leadSignal.data)
            .attr('class', 'ecg-line')
            .attr('fill', 'none')
            .attr('stroke', '#000000')
            .attr('stroke-width', '1.5')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', line);
        
        // Draw label
        stripGroup.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .attr('class', 'lead-label')
            .style('font-weight', 'bold')
            .style('font-size', '12px')
            .style('fill', COLORS.leadLabel)
            .text(label);
    }
    
    /**
     * Draw continuous grid for entire ECG area
     * @param {number} width - Total width
     * @param {number} height - Total height
     */
    drawContinuousGrid(width, height) {
        const gridGroup = this.svg.append('g')
            .attr('class', 'continuous-grid');
        
        const smallBox = this.pixelsPerMM;
        const largeBox = this.pixelsPerMM * 5;
        
        // Background
        gridGroup.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', COLORS.background);
        
        // Minor grid lines (1mm)
        for (let x = 0; x <= width; x += smallBox) {
            gridGroup.append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', 0)
                .attr('y2', height)
                .attr('class', 'minor-grid');
        }
        
        for (let y = 0; y <= height; y += smallBox) {
            gridGroup.append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y)
                .attr('y2', y)
                .attr('class', 'minor-grid');
        }
        
        // Major grid lines (5mm)
        for (let x = 0; x <= width; x += largeBox) {
            gridGroup.append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', 0)
                .attr('y2', height)
                .attr('class', 'major-grid');
        }
        
        for (let y = 0; y <= height; y += largeBox) {
            gridGroup.append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y)
                .attr('y2', y)
                .attr('class', 'major-grid');
        }
    }
    
    /**
     * Draw grid for individual section
     * @param {Object} group - D3 group element
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     */
    drawGrid(group, width, height) {
        const smallBox = this.pixelsPerMM * MEDICAL_CONSTANTS.SMALL_BOX_MM;
        const largeBox = this.pixelsPerMM * MEDICAL_CONSTANTS.LARGE_BOX_MM;
        
        // Background
        group.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', COLORS.background)
            .attr('stroke', COLORS.gridMajor)
            .attr('stroke-width', 1);
        
        // Minor grid lines (1mm)
        const minorGrid = group.append('g').attr('class', 'grid-minor');
        
        for (let x = 0; x <= width; x += smallBox) {
            minorGrid.append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', 0)
                .attr('y2', height)
                .attr('class', 'minor-grid');
        }
        
        for (let y = 0; y <= height; y += smallBox) {
            minorGrid.append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y)
                .attr('y2', y)
                .attr('class', 'minor-grid');
        }
        
        // Major grid lines (5mm)
        const majorGrid = group.append('g').attr('class', 'grid-major');
        
        for (let x = 0; x <= width; x += largeBox) {
            majorGrid.append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', 0)
                .attr('y2', height)
                .attr('class', 'major-grid');
        }
        
        for (let y = 0; y <= height; y += largeBox) {
            majorGrid.append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y)
                .attr('y2', y)
                .attr('class', 'major-grid');
        }
    }
    
    /**
     * Draw calibration pulse (1mV standard)
     * @param {Object} group - D3 group element
     * @param {number} xPos - X position
     * @param {number} height - Lead height
     */
    drawCalibrationPulse(group, xPos, height) {
        const pulseHeight = this.pixelsPerMM * MEDICAL_CONSTANTS.AMPLITUDE_MM_PER_MV;
        const pulseWidth = this.pixelsPerMM * 5;
        const yBaseline = height / 2;
        
        const pulsePath = `
            M ${xPos},${yBaseline}
            L ${xPos},${yBaseline - pulseHeight}
            L ${xPos + pulseWidth},${yBaseline - pulseHeight}
            L ${xPos + pulseWidth},${yBaseline}
        `;
        
        group.append('path')
            .attr('d', pulsePath)
            .attr('class', 'calibration-pulse')
            .attr('fill', 'none')
            .attr('stroke', COLORS.calibrationPulse)
            .attr('stroke-width', 1.5);
    }
    
    /**
     * Export SVG as data URL
     * @returns {string} SVG data URL
     */
    getSVGDataURL() {
        const svgElement = document.getElementById('ecg-svg');
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
}

// Create global grid renderer instance
const gridRenderer = new ECGGridRenderer('ecg-canvas');
