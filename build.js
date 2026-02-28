/**
 * Build script: bundles src/index.html + all CSS/JS into a single standalone HTML file.
 * Also copies all assets into dist/ for use by Capacitor (APK builds).
 *
 * Output:
 *   - electricity_calc_standalone.html   (single-file version for direct use)
 *   - dist/                              (directory used by Capacitor for APK builds)
 *
 * Usage: node build.js
 * No npm install required — uses only Node.js built-ins.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const OUT_FILE = path.join(__dirname, 'electricity_calc_standalone.html');

// Read file relative to src/
function readSrc(relPath) {
    return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8');
}

// Copy directory recursively
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

let html = readSrc('index.html');

// Inline all <link rel="stylesheet" href="..."> tags (handles any attribute order)
html = html.replace(/<link\b[^>]*\bhref="([^"]+)"[^>]*>/g, (match, href) => {
    if (!/rel=["']stylesheet["']/.test(match)) return match;
    try {
        const css = readSrc(href);
        return `<style>\n${css}\n</style>`;
    } catch (e) {
        console.warn(`  Warning: could not inline CSS "${href}" — skipping`);
        return match;
    }
});

// Inline all <script src="..."></script> tags (no type or type="text/javascript")
html = html.replace(/<script\b([^>]*)>\s*<\/script\s*>/g, (match, attrs) => {
    const srcMatch = attrs.match(/\bsrc="([^"]+)"/);
    if (!srcMatch) return match;
    const src = srcMatch[1];
    try {
        const js = readSrc(src);
        return `<script>\n${js}\n</script>`;
    } catch (e) {
        console.warn(`  Warning: could not inline JS "${src}" — skipping`);
        return match;
    }
});

fs.writeFileSync(OUT_FILE, html, 'utf8');
console.log(`Built: ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB)`);

// Also copy src/ to dist/ for Capacitor
copyDir(SRC_DIR, DIST_DIR);
console.log(`Copied src/ to dist/ for Capacitor`);
