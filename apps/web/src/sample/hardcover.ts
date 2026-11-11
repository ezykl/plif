import { PAGE_HEIGHT, PAGE_WIDTH, svgWrap } from "./svgUtils";
import type { ImportedPage, TocItem } from "@plif/core";

export const HARDCOVER_TITLE = "The Cartographer's Compass";

export const HARDCOVER_TOC: TocItem[] = [
  { title: "Half-Title", page: 1 },
  { title: "Frontispiece & Title Page", page: 2 },
  { title: "Epigraph & Dedication", page: 4 },
  { title: "Chapter I: The Silent Meridian", page: 6 },
  { title: "Chapter II: Isles of the Solstice", page: 8 },
  { title: "The Windward Chart", page: 10 },
  { title: "Colophon & Printer's Device", page: 12 },
];

function makeBookPage(num: number, svgContent: string): ImportedPage {
  return {
    id: `sample-book-${num}`,
    src: svgWrap(svgContent, "#fdfbf7"),
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    alt: `Hardcover Page ${num}`,
  };
}

export function createHardcoverPages(): ImportedPage[] {
  const pages: ImportedPage[] = [];

  // Page 1: Half-Title
  pages.push(
    makeBookPage(
      1,
      `
      <g transform="translate(240, 260)">
        <text x="0" y="0" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="16" font-weight="600" fill="#24201d" text-anchor="middle" letter-spacing="4">
          THE CARTOGRAPHER'S COMPASS
        </text>
        <line x1="-30" y1="18" x2="30" y2="18" stroke="#78350f" stroke-width="1"/>
      </g>
      `,
    ),
  );

  // Page 2: Frontispiece Engraving (Astrolabe and Compass Rose)
  pages.push(
    makeBookPage(
      2,
      `
      <g transform="translate(240, 300)">
        <!-- Astrolabe Celestial Rings -->
        <circle cx="0" cy="0" r="140" fill="none" stroke="#24201d" stroke-width="2"/>
        <circle cx="0" cy="0" r="132" fill="none" stroke="#78350f" stroke-width="0.8"/>
        <circle cx="0" cy="0" r="100" fill="none" stroke="#24201d" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="60" fill="none" stroke="#24201d" stroke-width="1"/>

        <!-- Compass 16-point star -->
        <polygon points="0,-140 18,-40 0,0 -18,-40" fill="#24201d"/>
        <polygon points="0,-140 0,0 18,-40" fill="#78350f"/>

        <polygon points="0,140 18,40 0,0 -18,40" fill="#24201d"/>
        <polygon points="0,140 0,0 -18,40" fill="#78350f"/>

        <polygon points="140,0 40,18 0,0 40,-18" fill="#24201d"/>
        <polygon points="140,0 0,0 40,18" fill="#78350f"/>

        <polygon points="-140,0 -40,18 0,0 -40,-18" fill="#24201d"/>
        <polygon points="-140,0 0,0 -40,-18" fill="#78350f"/>

        <!-- Center brass boss -->
        <circle cx="0" cy="0" r="10" fill="#fdfbf7" stroke="#24201d" stroke-width="2"/>
        <circle cx="0" cy="0" r="4" fill="#78350f"/>

        <!-- Cardinal labels -->
        <text x="0" y="-150" font-family="'Cinzel', serif" font-size="12" font-weight="700" fill="#24201d" text-anchor="middle">N</text>
        <text x="0" y="166" font-family="'Cinzel', serif" font-size="12" font-weight="700" fill="#24201d" text-anchor="middle">S</text>
        <text x="160" y="5" font-family="'Cinzel', serif" font-size="12" font-weight="700" fill="#24201d">E</text>
        <text x="-166" y="5" font-family="'Cinzel', serif" font-size="12" font-weight="700" fill="#24201d" text-anchor="end">W</text>
      </g>
      <text x="240" y="520" font-family="Georgia, serif" font-size="9" font-style="italic" fill="#78716c" text-anchor="middle">
        Plate I. Navigational astrolabe constructed for the voyage of the Saint Christopher, 1682.
      </text>
      `,
    ),
  );

  // Page 3: Full Classical Title Page
  pages.push(
    makeBookPage(
      3,
      `
      <!-- Classical Title Page Border Frame -->
      <rect x="40" y="40" width="400" height="599" fill="none" stroke="#24201d" stroke-width="1.8"/>
      <rect x="46" y="46" width="388" height="587" fill="none" stroke="#78350f" stroke-width="0.8"/>

      <g transform="translate(240, 110)">
        <text x="0" y="0" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#78350f" text-anchor="middle" letter-spacing="3">
          A CHRONICLE OF UNCHARTED LATITUDES
        </text>

        <text x="0" y="46" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#24201d" text-anchor="middle" letter-spacing="4">
          THE CARTOGRAPHER'S
        </text>
        <text x="0" y="80" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#24201d" text-anchor="middle" letter-spacing="4">
          COMPASS
        </text>

        <line x1="-40" y1="104" x2="40" y2="104" stroke="#78350f" stroke-width="1"/>

        <text x="0" y="132" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#44403c" text-anchor="middle">
          Being an Account of Islands Vanished from the Admiralty Charts,
        </text>
        <text x="0" y="150" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#44403c" text-anchor="middle">
          with Notes on Ocean Currents, Celestial Observations, and Solitude
        </text>

        <text x="0" y="210" font-family="'Cinzel', serif" font-size="11" font-weight="600" fill="#24201d" text-anchor="middle" letter-spacing="2">
          BY JULIAN VANCE
        </text>
        <text x="0" y="226" font-family="Georgia, serif" font-size="9" fill="#78716c" text-anchor="middle">
          Fellow of the Royal Geographical Society
        </text>

        <!-- Woodcut ornament device -->
        <g transform="translate(0, 290)">
          <polygon points="0,-16 14,8 -14,8" fill="none" stroke="#78350f" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="4" fill="#78350f"/>
        </g>

        <!-- Publisher imprint -->
        <g transform="translate(0, 420)">
          <text x="0" y="0" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#24201d" text-anchor="middle" letter-spacing="2">
            LONDON
          </text>
          <text x="0" y="16" font-family="Georgia, serif" font-size="9" fill="#57534e" text-anchor="middle">
            Printed at the Chiswick Press for George Bell &amp; Sons
          </text>
          <text x="0" y="32" font-family="'Cinzel', serif" font-size="8.5" fill="#78350f" text-anchor="middle" letter-spacing="1">
            MDCCCLXXXVIII
          </text>
        </g>
      </g>
      `,
    ),
  );

  // Page 4: Dedication and Epigraph
  pages.push(
    makeBookPage(
      4,
      `
      <g transform="translate(240, 240)">
        <text x="0" y="0" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#78350f" text-anchor="middle" letter-spacing="2">
          IN MEMORIAM
        </text>
        <text x="0" y="36" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#24201d" text-anchor="middle">
          To those navigators who sailed beyond the edge of ink,
        </text>
        <text x="0" y="54" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#24201d" text-anchor="middle">
          and found in the great silence of the deep
        </text>
        <text x="0" y="72" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#24201d" text-anchor="middle">
          the true measure of their souls.
        </text>
      </g>

      <g transform="translate(240, 440)">
        <text x="0" y="0" font-family="Georgia, serif" font-size="10" font-style="italic" fill="#57534e" text-anchor="middle">
          "The earth is surrounded by the ocean, and the ocean is bounded by the heavens."
        </text>
        <text x="0" y="20" font-family="'Cinzel', serif" font-size="8" fill="#78716c" text-anchor="middle" letter-spacing="1">
          CLAUDIUS PTOLEMY • GEOGRAPHIA, LIB. I
        </text>
      </g>
      `,
    ),
  );

  // Page 5: Table of Chapters
  pages.push(
    makeBookPage(
      5,
      `
      <text x="240" y="90" font-family="'Cinzel', serif" font-size="14" font-weight="700" fill="#24201d" text-anchor="middle" letter-spacing="3">
        CONTENTS
      </text>
      <line x1="210" y1="102" x2="270" y2="102" stroke="#78350f" stroke-width="1"/>

      <g transform="translate(70, 150)">
        <!-- Chapter 1 -->
        <g transform="translate(0, 0)">
          <text x="0" y="14" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#78350f">CHAP. I.</text>
          <text x="60" y="14" font-family="Georgia, serif" font-size="10.5" fill="#24201d">The Silent Meridian ..............................................</text>
          <text x="340" y="14" font-family="'Cinzel', serif" font-size="9" fill="#24201d" text-anchor="end">6</text>
        </g>
        <!-- Chapter 2 -->
        <g transform="translate(0, 40)">
          <text x="0" y="14" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#78350f">CHAP. II.</text>
          <text x="60" y="14" font-family="Georgia, serif" font-size="10.5" fill="#24201d">Currents of the Archipelago ................................</text>
          <text x="340" y="14" font-family="'Cinzel', serif" font-size="9" fill="#24201d" text-anchor="end">8</text>
        </g>
        <!-- Chapter 3 -->
        <g transform="translate(0, 80)">
          <text x="0" y="14" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#78350f">CHAP. III.</text>
          <text x="60" y="14" font-family="Georgia, serif" font-size="10.5" fill="#24201d">The Windward Chart ............................................</text>
          <text x="340" y="14" font-family="'Cinzel', serif" font-size="9" fill="#24201d" text-anchor="end">10</text>
        </g>
        <!-- Chapter 4 -->
        <g transform="translate(0, 120)">
          <text x="0" y="14" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#78350f">CHAP. IV.</text>
          <text x="60" y="14" font-family="Georgia, serif" font-size="10.5" fill="#24201d">Colophon &amp; Printer's Device ................................</text>
          <text x="340" y="14" font-family="'Cinzel', serif" font-size="9" fill="#24201d" text-anchor="end">12</text>
        </g>
      </g>
      `,
    ),
  );

  // Page 6: Book Opening (Chapter I - Left Page)
  pages.push(
    makeBookPage(
      6,
      `
      <text x="240" y="48" font-family="'Cinzel', serif" font-size="7.5" font-weight="600" fill="#78716c" text-anchor="middle" letter-spacing="2">
        BOOK THE FIRST
      </text>

      <g transform="translate(68, 110)">
        <text x="172" y="0" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#78350f" text-anchor="middle" letter-spacing="2">
          CHAPTER I
        </text>
        <text x="172" y="24" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="16" font-weight="700" fill="#24201d" text-anchor="middle" letter-spacing="1">
          THE SILENT MERIDIAN
        </text>
        <line x1="142" y1="36" x2="202" y2="36" stroke="#78350f" stroke-width="0.8"/>

        <!-- Text with Drop Cap -->
        <g transform="translate(0, 60)">
          <!-- Classical ornate drop-cap 'W' -->
          <rect x="0" y="0" width="44" height="48" fill="#f4efe6" stroke="#78350f" stroke-width="1"/>
          <text x="22" y="38" font-family="'Cinzel', serif" font-size="38" font-weight="700" fill="#24201d" text-anchor="middle">
            W
          </text>

          <text x="52" y="14" font-family="Georgia, serif" font-size="10" fill="#24201d" line-height="1.7">
            <tspan x="52" y="14">e made landfall three hours before</tspan>
            <tspan x="52" y="30">dawn, guided by nothing more certain</tspan>
            <tspan x="52" y="46">than the breaking of surf upon unseen</tspan>
            <tspan x="0" y="66">reefs. The fog lay thick upon the water, smelling of</tspan>
            <tspan x="0" y="84">crushed cedar and damp kelp, cold as melted snow.</tspan>
            <tspan x="0" y="102">On the charts drawn by Captain Hallowell eighty</tspan>
            <tspan x="0" y="120">years prior, this latitude was marked only by the</tspan>
            <tspan x="0" y="138">words: Here are great soundings and no bottom.</tspan>
            <tspan x="0" y="162">Yet as our bowsprit cut through the veil of mist,</tspan>
            <tspan x="0" y="180">the dark shoulder of an island rose steep into the</tspan>
            <tspan x="0" y="198">night, its ridges crowned with ancient pines that had</tspan>
            <tspan x="0" y="216">never heard the ring of an iron axe.</tspan>
            <tspan x="0" y="240">The compass needle swung erratically in its brass</tspan>
            <tspan x="0" y="258">binnacle, drawn hither and thither by basalt cliffs</tspan>
            <tspan x="0" y="276">rich with magnetic lodestone. Here, at last, was the</tspan>
            <tspan x="0" y="294">boundary where mathematics ended and discovery</tspan>
            <tspan x="0" y="312">began.</tspan>
          </text>
        </g>
      </g>

      <!-- Center Folio -->
      <text x="240" y="620" font-family="'Cinzel', serif" font-size="8.5" fill="#78716c" text-anchor="middle">
        6
      </text>
      `,
    ),
  );

  // Pages 7-11: Narrative & nautical charts
  for (let p = 7; p <= 11; p += 1) {
    const isMap = p === 10;
    pages.push(
      makeBookPage(
        p,
        `
        <text x="240" y="48" font-family="'Cinzel', serif" font-size="7.5" font-weight="600" fill="#78716c" text-anchor="middle" letter-spacing="2">
          ${isMap ? "THE WINDWARD CHART" : "THE CARTOGRAPHER'S COMPASS"}
        </text>

        ${
          isMap
            ? `
          <!-- Full-page vector nautical chart -->
          <g transform="translate(50, 70)">
            <rect width="380" height="510" fill="#f9f6ee" stroke="#24201d" stroke-width="1.5"/>
            <!-- Rhumb lines radiating from compass -->
            <g stroke="#78350f" stroke-width="0.6" opacity="0.4">
              <line x1="190" y1="255" x2="0" y2="50"/>
              <line x1="190" y1="255" x2="0" y2="255"/>
              <line x1="190" y1="255" x2="0" y2="450"/>
              <line x1="190" y1="255" x2="380" y2="50"/>
              <line x1="190" y1="255" x2="380" y2="255"/>
              <line x1="190" y1="255" x2="380" y2="450"/>
              <line x1="190" y1="255" x2="190" y2="0"/>
              <line x1="190" y1="255" x2="190" y2="510"/>
            </g>
            <!-- Archipelago contours -->
            <path d="M120,180 Q160,160 200,190 T260,220 T210,280 T140,240 Z" fill="#e8dfcc" stroke="#24201d" stroke-width="1.2"/>
            <path d="M250,110 Q280,90 310,120 T290,160 Z" fill="#e8dfcc" stroke="#24201d" stroke-width="1.2"/>
            <text x="180" y="230" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#24201d">ISLE OF MERIDIAN</text>
            <text x="270" y="135" font-family="'Cinzel', serif" font-size="7" font-weight="700" fill="#24201d">SOLSTICE REEF</text>

            <!-- Soundings numbers -->
            <text x="80" y="220" font-family="monospace" font-size="6.5" fill="#78716c">14</text>
            <text x="110" y="320" font-family="monospace" font-size="6.5" fill="#78716c">28</text>
            <text x="320" y="260" font-family="monospace" font-size="6.5" fill="#78716c">42</text>
            <text x="240" y="370" font-family="monospace" font-size="6.5" fill="#78716c">85</text>
          </g>
        `
            : `
          <g transform="translate(68, 80)">
            <text x="0" y="20" font-family="Georgia, serif" font-size="10" fill="#24201d" line-height="1.7">
              <tspan x="0" y="20">We dropped anchor in twelve fathoms of crystal water,</tspan>
              <tspan x="0" y="38">sheltered behind a promontory of basalt that curved like</tspan>
              <tspan x="0" y="56">a lobster's claw. By midday the mist had burnt off,</tspan>
              <tspan x="0" y="74">revealing an inner lagoon so tranquil that our vessel</tspan>
              <tspan x="0" y="92">seemed suspended upon green glass.</tspan>
              <tspan x="0" y="116">Mr. Reynolds took his sextant and brass vernier ashore.</tspan>
              <tspan x="0" y="134">Upon the highest knoll he raised our signal tripod and</tspan>
              <tspan x="0" y="152">waited for the sun's meridian transit.</tspan>
              <tspan x="0" y="176">"Forty-four degrees, twelve minutes south," he called</tspan>
              <tspan x="0" y="194">presently, his quill scratching the parchment. "Longitude</tspan>
              <tspan x="0" y="212">one hundred and seventy-eight west. We have found the</tspan>
              <tspan x="0" y="230">lost islands of Captain Vance."</tspan>
              <tspan x="0" y="254">The crew gave three cheers that startled a flock of</tspan>
              <tspan x="0" y="272">white gannets from the cliff crevices. For ten months we</tspan>
              <tspan x="0" y="290">had lived on salt biscuit and brine, enduring gales that</tspan>
              <tspan x="0" y="308">stove in our cutter and split our mainsail. Yet in that</tspan>
              <tspan x="0" y="326">solitary cove, every hardship fell away like shed skin.</tspan>
              <tspan x="0" y="350">We gathered sweet water from a brook that tumbled over</tspan>
              <tspan x="0" y="368">slate stones, tasting of moss and snow. That night, under</tspan>
              <tspan x="0" y="386">the Southern Cross, we slept without watches, knowing</tspan>
              <tspan x="0" y="404">that the world had grown larger by our labor.</tspan>
            </text>
          </g>
        `
        }

        <text x="240" y="620" font-family="'Cinzel', serif" font-size="8.5" fill="#78716c" text-anchor="middle">
          ${p}
        </text>
        `,
      ),
    );
  }

  // Page 12: Colophon & Printer's Device
  pages.push(
    makeBookPage(
      12,
      `
      <g transform="translate(240, 220)">
        <!-- Printer's Emblem: Anchor & Dolphin -->
        <circle cx="0" cy="0" r="44" fill="none" stroke="#24201d" stroke-width="1.5"/>
        <line x1="0" y1="-32" x2="0" y2="32" stroke="#24201d" stroke-width="2"/>
        <line x1="-16" y1="-18" x2="16" y2="-18" stroke="#24201d" stroke-width="2"/>
        <path d="M-28,14 Q0,38 28,14" fill="none" stroke="#24201d" stroke-width="2"/>
        <circle cx="0" cy="-34" r="6" fill="#fdfbf7" stroke="#24201d" stroke-width="1.5"/>

        <!-- Colophon Text -->
        <text x="0" y="80" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#78350f" text-anchor="middle" letter-spacing="3">
          COLOPHON
        </text>
        <text x="0" y="110" font-family="Georgia, serif" font-size="10" fill="#24201d" text-anchor="middle">
          Here ends the first volume of
        </text>
        <text x="0" y="126" font-family="'Cinzel', serif" font-size="10.5" font-weight="600" fill="#24201d" text-anchor="middle">
          THE CARTOGRAPHER'S COMPASS
        </text>
        <text x="0" y="150" font-family="Georgia, serif" font-size="9" fill="#57534e" text-anchor="middle">
          Typeset in Cinzel and Cormorant Garamond.
        </text>
        <text x="0" y="166" font-family="Georgia, serif" font-size="9" fill="#57534e" text-anchor="middle">
          Printed upon handmade cotton rag paper.
        </text>
        <text x="0" y="182" font-family="Georgia, serif" font-size="9" fill="#57534e" text-anchor="middle">
          Bound in natural buckram bookcloth with gold foil impression.
        </text>
        <text x="0" y="210" font-family="'Cinzel', serif" font-size="8" fill="#78716c" text-anchor="middle" letter-spacing="1">
          ALDINE PRESS • LONDON &amp; OXFORD • MDCCCLXXXVIII
        </text>
      </g>
      `,
    ),
  );

  return pages;
}
