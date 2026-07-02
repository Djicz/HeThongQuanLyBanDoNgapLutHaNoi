const fs = require('fs');
const path = require('path');

const targetStr = "http://localhost:8080/api";
const replacementStr = "import.meta.env.VITE_API_URL";
const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(targetStr)) {
                console.log(`Replacing in ${fullPath}`);
                content = content.split(targetStr).join(replacementStr);
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    });
}

walkDir(srcDir);
console.log('Done replacing.');
