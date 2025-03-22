const fs = require('fs');
const path = require('path');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

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

async function minifyFont() {
    try {
        const htmlFiles = await getHtmlFiles('./docs');
        const uniqueChars = await extractUniqueChars(htmlFiles);
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
        await exec('font-spider --no-backup temp.html');
        await fs.promises.unlink('temp.html');

        console.log('Font minification completed successfully!');
        const { stdout } = await exec('ls -l ./static/fonts/');
        console.log(stdout);
    } catch (error) {
        console.error('Error:', error);
    }
}

minifyFont();