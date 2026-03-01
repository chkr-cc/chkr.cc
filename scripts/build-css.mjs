import fs from "node:fs/promises";
import path from "node:path";
import { PurgeCSS } from "purgecss";
import postcss from "postcss";
import cssnano from "cssnano";

const projectRoot = process.cwd();
const srcCssPath = path.join(projectRoot, "public/assets/css/style.css");
const outCssPath = path.join(projectRoot, "public/assets/css/style.min.css");
const bootstrapSrcPath = path.join(projectRoot, "node_modules/bootstrap/dist/css/bootstrap.min.css");
const bootstrapOutPath = path.join(projectRoot, "public/assets/css/bootstrap.min.css");

const content = [
  path.join(projectRoot, "src/**/*.astro"),
  path.join(projectRoot, "src/**/*.js"),
  path.join(projectRoot, "dist/**/*.html"),
];

const dynamicSafelist = {
  standard: [
    'show','fade','active','sticky','menu-open','collapse','collapsing','modal-open','modal-backdrop','open'
  ],
  deep: [
    /^header--/, /^popup-mobile-menu/, /^mainmenu-nav/, /^primary-menu/, /^rn-header/, /^rn-btn/, /^backto-top/, /^section-separator/, /^navigation-wrapper/, /^tab-pane/, /^nav-link/, /^modal/, /^close/, /^logo/, /^header-wrapper/, /^hamberger-menu/, /^humberger-menu/, /^social-share-style-1/, /^smoth-animation/, /^template-color-1/
  ],
};

async function purgeAndMinify(rawCss) {
  const purge = new PurgeCSS();
  const purgeResult = await purge.purge({
    content,
    css: [{ raw: rawCss }],
    safelist: dynamicSafelist,
  });
  const purgedCss = purgeResult?.[0]?.css || rawCss;
  const minified = await postcss([cssnano({ preset: 'default' })]).process(purgedCss, { from: undefined });
  return minified.css;
}

const rawCss = await fs.readFile(srcCssPath, "utf8");
const cssNoExternalFonts = rawCss
  .split("\n")
  .filter((line) => !line.includes("fonts.googleapis.com"))
  .join("\n");

const optimizedStyle = await purgeAndMinify(cssNoExternalFonts);
await fs.writeFile(outCssPath, optimizedStyle, "utf8");

const rawBootstrap = await fs.readFile(bootstrapSrcPath, "utf8");
const optimizedBootstrap = await purgeAndMinify(rawBootstrap);
await fs.writeFile(bootstrapOutPath, optimizedBootstrap, "utf8");

console.log(`CSS optimized: ${path.relative(projectRoot, outCssPath)}`);
console.log(`Bootstrap optimized: ${path.relative(projectRoot, bootstrapOutPath)}`);
