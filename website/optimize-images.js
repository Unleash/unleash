const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directory containing images
const IMG_DIR = path.join(__dirname, 'static/img');
const OUTPUT_DIR = IMG_DIR; // Save WebP versions alongside originals

// Function to convert image to WebP
async function convertToWebP(inputPath, outputPath) {
    try {
        const metadata = await sharp(inputPath).metadata();
        
        // Skip if already WebP
        if (metadata.format === 'webp') {
            return null;
        }

        // Convert to WebP with quality settings
        await sharp(inputPath)
            .webp({ 
                quality: 85, // Adjust quality (0-100)
                effort: 6 // Compression effort (0-6)
            })
            .toFile(outputPath);
            
        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(2);
        
        return {
            original: inputPath,
            webp: outputPath,
            originalSize: inputStats.size,
            webpSize: outputStats.size,
            savings: `${savings}%`
        };
    } catch (error) {
        console.error(`Error converting ${inputPath}:`, error.message);
        return null;
    }
}

// Function to recursively find and convert images
async function processImages(dir) {
    const results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursively process subdirectories
            const subResults = await processImages(fullPath);
            results.push(...subResults);
        } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
            // Convert PNG and JPEG images to WebP
            const webpPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
            
            // Skip if WebP version already exists
            if (!fs.existsSync(webpPath)) {
                console.log(`Converting: ${file}`);
                const result = await convertToWebP(fullPath, webpPath);
                if (result) {
                    results.push(result);
                }
            }
        }
    }
    
    return results;
}

// Main function
async function main() {
    console.log('Starting image optimization...\n');
    
    // Check if sharp is installed
    try {
        require('sharp');
    } catch (error) {
        console.error('Please install sharp first: yarn add -D sharp');
        process.exit(1);
    }
    
    const results = await processImages(IMG_DIR);
    
    if (results.length > 0) {
        console.log('\n=== Conversion Results ===\n');
        
        let totalOriginalSize = 0;
        let totalWebPSize = 0;
        
        results.forEach(result => {
            console.log(`✓ ${path.basename(result.original)}`);
            console.log(`  Original: ${(result.originalSize / 1024).toFixed(2)} KB`);
            console.log(`  WebP: ${(result.webpSize / 1024).toFixed(2)} KB`);
            console.log(`  Savings: ${result.savings}\n`);
            
            totalOriginalSize += result.originalSize;
            totalWebPSize += result.webpSize;
        });
        
        const totalSavings = ((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(2);
        console.log('=== Summary ===');
        console.log(`Total images converted: ${results.length}`);
        console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Total WebP size: ${(totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Total savings: ${totalSavings}%`);
    } else {
        console.log('No images to convert or all images already converted.');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { convertToWebP, processImages };