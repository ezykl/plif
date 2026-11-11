import { PAGE_HEIGHT, PAGE_WIDTH, svgWrap } from "./svgUtils";
import type { ImportedPage, TocItem } from "@plif/core";

export const ZINE_TITLE = "Kinetic Risograph & Sound";

export const ZINE_TOC: TocItem[] = [
  { title: "Zine Cover", page: 1 },
  { title: "Manifesto & Frequency", page: 2 },
  { title: "Modular Synthesizer Patch", page: 4 },
  { title: "Tape Collage: Echo & Decay", page: 6 },
  { title: "Underground Interview", page: 8 },
  { title: "Field Recordings Catalog", page: 10 },
  { title: "Back Cover & Imprint", page: 12 },
];

function makeZinePage(num: number, svgContent: string, bg: string = "#0b1120"): ImportedPage {
  return {
    id: `sample-zine-${num}`,
    src: svgWrap(svgContent, bg),
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    alt: `Zine Page ${num}`,
  };
}

export function createZinePages(): ImportedPage[] {
  const pages: ImportedPage[] = [];

  // Page 1: Zine Cover (Dark Studio, Bold Risograph Typography)
  pages.push(
    makeZinePage(
      1,
      `
      <rect width="480" height="679" fill="#0b1120"/>

      <!-- Diagonal accent ribbon -->
      <polygon points="0,180 480,40 480,120 0,260" fill="#0284c7" opacity="0.85"/>
      <polygon points="0,270 480,130 480,145 0,285" fill="#f59e0b" opacity="0.9"/>

      <text x="44" y="68" font-family="'Courier New', monospace" font-size="10" font-weight="700" fill="#38bdf8" letter-spacing="2">
        ISSUE 08 • LIMITED RUN OF 250
      </text>

      <!-- Bold Brutalist Masthead -->
      <text x="44" y="160" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="900" fill="#ffffff" letter-spacing="-2">
        KINETIC
      </text>
      <text x="44" y="210" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#f59e0b" letter-spacing="3">
        SOUND • ARCHIVE • RISOGRAPH
      </text>

      <!-- Cassette & Soundwave Graphic -->
      <g transform="translate(44, 250)">
        <rect width="392" height="230" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="12"/>
        <!-- Tape spools -->
        <circle cx="120" cy="115" r="45" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
        <circle cx="120" cy="115" r="20" fill="#38bdf8"/>
        <circle cx="272" cy="115" r="45" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
        <circle cx="272" cy="115" r="20" fill="#38bdf8"/>
        <!-- Window -->
        <rect x="90" y="85" width="212" height="60" fill="none" stroke="#f59e0b" stroke-width="1.5" rx="4"/>
        <!-- Waveform lines inside window -->
        <path d="M100,115 Q120,95 140,115 T180,115 T220,95 T260,115 T290,115" fill="none" stroke="#ffffff" stroke-width="2"/>
      </g>

      <!-- Feature topics -->
      <g transform="translate(44, 520)">
        <text x="0" y="20" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="800" fill="#ffffff">
          MAGNETIC TAPE DECAY AS COMPOSITION
        </text>
        <text x="0" y="42" font-family="'Courier New', monospace" font-size="10" fill="#94a3b8">
          Modular synthesis, tape loops, and analog resonances in Berlin
        </text>

        <text x="0" y="76" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="800" fill="#ffffff">
          SUB-BASS ACOUSTICS IN INDUSTRIAL CONCRETE
        </text>
        <text x="0" y="98" font-family="'Courier New', monospace" font-size="10" fill="#94a3b8">
          Field recordings inside subterranean stormwater tanks
        </text>
      </g>
      `,
      "#0b1120",
    ),
  );

  // Pages 2-11: Riso layout, schematics, tracklist, and interviews
  for (let p = 2; p <= 11; p += 1) {
    const isOdd = p % 2 !== 0;
    pages.push(
      makeZinePage(
        p,
        `
        <!-- Top header bar -->
        <text x="44" y="44" font-family="'Courier New', monospace" font-size="8.5" font-weight="700" fill="#38bdf8" letter-spacing="1">
          KINETIC // VOL. 08
        </text>
        <text x="436" y="44" font-family="'Courier New', monospace" font-size="8.5" font-weight="700" fill="#f59e0b" text-anchor="end">
          PAGE ${p < 10 ? `0${p}` : p}
        </text>
        <line x1="44" y1="54" x2="436" y2="54" stroke="#1e293b" stroke-width="2"/>

        <text x="44" y="94" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="900" fill="#ffffff">
          ${isOdd ? "ANALOGUE HARMONICS" : "CIRCUIT BENDING &amp; RESONANCE"}
        </text>
        <text x="44" y="118" font-family="'Courier New', monospace" font-size="10" fill="#38bdf8">
          SECTION 0${Math.floor(p / 2)} • FREQUENCY MODULATION
        </text>

        <!-- Graphic Modular Patch or Waveform Visual -->
        <g transform="translate(44, 140)">
          <rect width="392" height="210" fill="#1e293b" stroke="#334155" rx="6"/>
          <!-- Modular patch cables vector lines -->
          <circle cx="80" cy="60" r="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="200" cy="150" r="12" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="320" cy="70" r="12" fill="#0f172a" stroke="#ec4899" stroke-width="2"/>
          <path d="M80,60 C80,180 200,80 200,150" fill="none" stroke="#38bdf8" stroke-width="3"/>
          <path d="M200,150 C200,220 320,180 320,70" fill="none" stroke="#f59e0b" stroke-width="3"/>
          <text x="20" y="195" font-family="'Courier New', monospace" font-size="9" font-weight="700" fill="#94a3b8">
            VOLTAGE-CONTROLLED OSCILLATOR PATCH MAP // 440 HZ
          </text>
        </g>

        <!-- 2-column Zine text -->
        <g transform="translate(44, 380)">
          <text x="0" y="14" font-family="'Courier New', monospace" font-size="10" fill="#cbd5e1" line-height="1.6">
            <tspan x="0" y="14">When tape loops run continuously</tspan>
            <tspan x="0" y="32">for 72 hours, the iron oxide</tspan>
            <tspan x="0" y="50">slowly detaches from the polyester</tspan>
            <tspan x="0" y="68">backing. High frequencies soften</tspan>
            <tspan x="0" y="86">first, followed by a warm, grainy</tspan>
            <tspan x="0" y="104">distortion that digital algorithms</tspan>
            <tspan x="0" y="122">cannot replicate.</tspan>
            <tspan x="0" y="148">In our Berlin recording lab, we</tspan>
            <tspan x="0" y="166">preserve this physical decay as an</tspan>
            <tspan x="0" y="184">instrument in its own right.</tspan>
          </text>

          <text x="204" y="14" font-family="'Courier New', monospace" font-size="10" fill="#cbd5e1">
            <tspan x="204" y="14">Every imperfection is an authentic</tspan>
            <tspan x="204" y="32">signature of time. The risograph</tspan>
            <tspan x="204" y="50">printing process mirrors this same</tspan>
            <tspan x="204" y="68">physical honesty: soy-based inks,</tspan>
            <tspan x="204" y="86">drum misalignments, and vibrant</tspan>
            <tspan x="204" y="104">fluorescent tones on uncoated paper.</tspan>
            <tspan x="204" y="130">KINETIC AUDIO CATALOGUE // 2026</tspan>
          </text>
        </g>

        <line x1="44" y1="620" x2="436" y2="620" stroke="#1e293b" stroke-width="1"/>
        <text x="240" y="642" font-family="'Courier New', monospace" font-size="9" fill="#64748b" text-anchor="middle">
          KINETIC • DIY INDEPENDENT AUDIO PRESS
        </text>
        `,
        "#0b1120",
      ),
    );
  }

  // Page 12: Back Cover (Risograph Stamp, Colophon)
  pages.push(
    makeZinePage(
      12,
      `
      <rect width="480" height="679" fill="#090d16"/>

      <g transform="translate(240, 260)">
        <circle cx="0" cy="0" r="70" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8,6"/>
        <text x="0" y="-12" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">
          KINETIC
        </text>
        <text x="0" y="16" font-family="'Courier New', monospace" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">
          BERLIN // 2026
        </text>
        <text x="0" y="32" font-family="'Courier New', monospace" font-size="8" fill="#94a3b8" text-anchor="middle">
          PRINTED ON RISO RZ-990
        </text>
      </g>

      <g transform="translate(240, 460)">
        <text x="0" y="0" font-family="'Courier New', monospace" font-size="9.5" fill="#cbd5e1" text-anchor="middle">
          PRINTED IN A LIMITED RUN OF 250 COPIES
        </text>
        <text x="0" y="20" font-family="'Courier New', monospace" font-size="9" fill="#64748b" text-anchor="middle">
          DUAL-DRUM SOY INK ON 120GSM UNCOATED FLINT
        </text>
        <text x="0" y="40" font-family="'Courier New', monospace" font-size="9" fill="#64748b" text-anchor="middle">
          ALL AUDIO COMPOSITIONS CC-BY-NC 4.0
        </text>
      </g>
      `,
      "#090d16",
    ),
  );

  return pages;
}
