const fs = require('fs');
const path = require('path');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

// Function to get all HTML files recursively
async function getHtmlFiles(dir) {
    const files = [];
    const items = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...await getHtmlFiles(fullPath));
        } else if (item.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Function to extract unique characters from files
async function extractUniqueChars(files) {
    const chars = new Set();
    // Add ASCII characters (32-126)
    for (let i = 32; i <= 126; i++) {
        chars.add(String.fromCharCode(i));
    }

    for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf8');
        for (const char of content) {
            chars.add(char);
        }
    }
    return Array.from(chars).join('');
}

// Main function
async function minifyFont() {
    try {
        // 1. Get all HTML files from docs folder
        const htmlFiles = await getHtmlFiles('./docs');

        // 2. Extract unique characters and add ASCII chars
        const uniqueChars = await extractUniqueChars(htmlFiles);

        // 3. Create temporary HTML file
        const tempHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @font-face {
            font-family: '仓耳今楷3';
            src: url('./static/fonts/仓耳今楷03-W03.ttf') format('truetype');
        }
        body {
            font-family: '仓耳今楷3';
        }
    </style>
</head>
<body>
    ${uniqueChars}
</body>
</html>`;

        await fs.promises.writeFile('temp.html', tempHtml);

        // 4. Run fontspider
        await exec('font-spider temp.html');

        // Move generated fonts to static/fonts
        // await fs.promises.mkdir('./static/fonts', { recursive: true });
        // Remove 
        // await fs.promises.rename(
        //     './static/fonts/camgerjinkai.ttf.tmp', 
        //     './static/fonts/camgerjinkai.ttf'
        // );

        // 5. Clean up and run hugo
        await fs.promises.unlink('temp.html');
        await exec('hugo');

        console.log('Font minification completed successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

minifyFont();