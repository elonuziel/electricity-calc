/**
 * Build script: bundles src/index.html + all CSS/JS into a single standalone HTML file.
 * Also copies all assets into dist/ for use by Capacitor (APK builds).
 * 
 * Features:
 *   - Inlines all CSS and JavaScript files
 *   - Purges unused Tailwind CSS classes (reduces 300KB → 30KB)
 *   - Generates single-file standalone HTML
 *   - Copies files to dist/ for Capacitor
 *
 * Output:
 *   - electricity_calc_standalone.html   (single-file version for direct use)
 *   - dist/                              (directory used by Capacitor for APK builds)
 *
 * Usage: 
 *   npm install    (first time only)
 *   npm run build
 */

const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');

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

// Purge unused CSS classes (for Tailwind optimization)
async function purgeCSS(css, htmlContent) {
    // Only purge larger CSS files (Tailwind, Font Awesome, etc.)
    if (css.length < 10000) return css;
    
    console.log(`  Purging unused CSS (${(css.length / 1024).toFixed(0)} KB)...`);
    
    // Collect all JS files to scan for class names
    const jsFiles = [];
    function collectJS(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                collectJS(fullPath);
            } else if (entry.name.endsWith('.js')) {
                jsFiles.push(fullPath);
            }
        }
    }
    collectJS(SRC_DIR);
    
    const purgeCSSResults = await new PurgeCSS().purge({
        content: [
            { raw: htmlContent, extension: 'html' },
            ...jsFiles.map(f => f)
        ],
        css: [{ raw: css }],
        safelist: {
            // Preserve dynamic classes that might not appear in static code
            standard: [/^fa-/, /^hover:/, /^focus:/, /^active:/],
            deep: [/^transition/, /^duration/, /^ease/],
        },
    });
    
    const purgedCSS = purgeCSSResults[0].css;
    console.log(`  Reduced to ${(purgedCSS.length / 1024).toFixed(0)} KB (${((1 - purgedCSS.length / css.length) * 100).toFixed(0)}% smaller)`);
    return purgedCSS;
}

async function build() {
    let html = readSrc('index.html');

    // Inline all <link rel="stylesheet" href="..."> tags (handles any attribute order)
    html = html.replace(/<link\b[^>]*\bhref="([^"]+)"[^>]*>/g, (match, href) => {
        if (!/rel=["']stylesheet["']/.test(match)) return match;
        try {
            const css = readSrc(href);
            return `<style data-href="${href}">\n${css}\n</style>`;
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

    // Purge unused CSS from large stylesheets (Tailwind optimization)
    const styleMatches = [...html.matchAll(/<style data-href="([^"]+)">\n([\s\S]*?)\n<\/style>/g)];
    for (const match of styleMatches) {
        const [fullMatch, href, css] = match;
        const purgedCSS = await purgeCSS(css, html);
        html = html.replace(fullMatch, `<style>\n${purgedCSS}\n</style>`);
    }

    fs.writeFileSync(OUT_FILE, html, 'utf8');
    console.log(`Built: ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB)`);

    // Also copy src/ to dist/ for Capacitor
    copyDir(SRC_DIR, DIST_DIR);
    console.log(`Copied src/ to dist/ for Capacitor`);
}

// Run build
build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});

