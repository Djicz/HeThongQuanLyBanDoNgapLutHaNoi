const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Replace single quotes
            content = content.replace(/'import\.meta\.env\.VITE_API_URL([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
            
            // Replace double quotes
            content = content.replace(/"import\.meta\.env\.VITE_API_URL([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
            
            // Replace backticks (if any)
            content = content.replace(/`import\.meta\.env\.VITE_API_URL([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');

            if (content !== original) {
                console.log(`Fixing quotes in ${fullPath}`);
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    });
}

walkDir(srcDir);
console.log('Done fixing quotes.');
