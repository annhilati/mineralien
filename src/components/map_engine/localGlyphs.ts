// @ts-ignore
const pbfReq = require('pbf');
// @ts-ignore
const sdfReq = require('@mapbox/tiny-sdf');

const Pbf = pbfReq.PbfWriter || pbfReq.default || pbfReq;
const TinySDF = sdfReq.default || sdfReq;

function writeFontstacks(glyphs: any[], pbf: any) {
  pbf.writeMessage(1, writeFontstack, glyphs);
}

function writeFontstack(glyphs: any[], pbf: any) {
  for (let i = 0; i < glyphs.length; i++) {
    pbf.writeMessage(3, writeGlyph, glyphs[i]);
  }
}

function writeGlyph(glyph: any, pbf: any) {
  pbf.writeVarintField(1, glyph.id);
  pbf.writeBytesField(2, glyph.data);
  const border = 3;
  // Kompatibilität mit TinySDF v1 und v2
  const width = glyph.glyphWidth !== undefined ? glyph.glyphWidth : (glyph.width - 2 * border);
  const height = glyph.glyphHeight !== undefined ? glyph.glyphHeight : (glyph.height - 2 * border);
  
  pbf.writeVarintField(3, width);
  pbf.writeVarintField(4, height);
  pbf.writeSVarintField(5, glyph.glyphLeft);
  pbf.writeSVarintField(6, glyph.glyphTop);
  pbf.writeVarintField(7, glyph.glyphAdvance);
}

function generateGlyphs(fontstack: string, rangeString: string) {
  const range = rangeString.split("-").map(Number);
  
  // Extrahiere den primären Font aus dem Fontstack (z.B. "Roboto Regular, Arial" -> "Roboto")
  const primaryFont = fontstack.split(',')[0].trim();
  
  // Entferne bekannte Suffixe für font-weight/style
  let family = primaryFont.replace(/\s+(Regular|Bold|Italic|Medium|Light|Semibold|Black)/gi, '');
  
  // CSS Variablen auflösen (z.B. var(--font-headings))
  if (family.includes('var(') && typeof document !== 'undefined') {
      const tempEl = document.createElement('div');
      tempEl.style.fontFamily = family;
      document.body.appendChild(tempEl);
      
      const computedFont = getComputedStyle(tempEl).fontFamily;
      if (computedFont && computedFont !== '""' && computedFont !== "''") {
          // Extrahiere den ersten konkreten Font (lösche alle Quotes)
          family = computedFont.split(',')[0].replace(/['"]/g, '').trim();
      }
      
      document.body.removeChild(tempEl);
  }
  
  const tinySdf = new TinySDF({
    fontSize: 24,
    fontFamily: `"${family}", sans-serif`, // Dynamische CSS Font-Family
    fontWeight: primaryFont.match(/Bold|Black|Semibold/i) ? "bold" : (primaryFont.match(/Medium/i) ? "500" : "normal"),
    fontStyle: primaryFont.match(/Italic/i) ? "italic" : "normal",
    buffer: 3,
    radius: 8,
    cutoff: 0.25,
  });

  const pbf = new Pbf();
  const glyphs = [];
  for (let i = range[0]; i <= range[1] + 1; i++) {
    const char = String.fromCharCode(i);
    const sdf = tinySdf.draw(char);
    (sdf as any).id = i;
    glyphs.push(sdf);
  }
  writeFontstacks(glyphs, pbf);
  return pbf.finish();
}

export function localGlyphProtocol(params: any): Promise<{ data: ArrayBuffer }> {
  return new Promise((resolve, reject) => {
    try {
      const pattern = /local:\/\/(.*)\/(.*)/i;
      const match = params.url.match(pattern);
      if (!match) throw new Error("Invalid local glyph URL");
      
      const font = decodeURIComponent(match[1]);
      const range = match[2].replace('.pbf', '');

      const glyphPbf = generateGlyphs(font, range);
      resolve({ data: glyphPbf.buffer });
    } catch (error) {
      console.error("Local glyph generation error:", error);
      reject(error);
    }
  });
}
