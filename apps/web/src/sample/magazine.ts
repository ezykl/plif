import { PAGE_HEIGHT, PAGE_WIDTH, svgWrap } from "./svgUtils";
import type { ImportedPage, TocItem } from "@plif/core";

export const MAGAZINE_TITLE = "Sample Magazine";

export const MAGAZINE_TOC: TocItem[] = [
  { title: "Front Cover", page: 1 },
  { title: "Editor's Letter", page: 2 },
  { title: "Campus News & Articles", page: 3 },
  { title: "The Concrete Pavilion", page: 4 },
  { title: "Visual Essay: Stone & Light", page: 6 },
  { title: "Interview: Density & Void", page: 8 },
  { title: "Urban Monograph", page: 10 },
  { title: "Back Cover", page: 12 },
];

function makePage(num: number, svgContent: string, bg: string = "#fbfaf6"): ImportedPage {
  return {
    id: `sample-mag-${num}`,
    src: svgWrap(svgContent, bg),
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    alt: `Magazine Page ${num}`,
  };
}

export function createMagazinePages(): ImportedPage[] {
  const pages: ImportedPage[] = [];

  // Page 1: Magazine Cover (Dark, Architectural, Sophisticated)
  pages.push(
    makePage(
      1,
      `
      <defs>
        <linearGradient id="coverSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#181e29"/>
          <stop offset="100%" stop-color="#0f131a"/>
        </linearGradient>
        <linearGradient id="wallShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#374151"/>
          <stop offset="100%" stop-color="#1f2937"/>
        </linearGradient>
      </defs>
      <rect width="480" height="679" fill="url(#coverSky)"/>

      <!-- Header category line -->
      <text x="240" y="58" font-family="'Cinzel', Georgia, serif" font-size="9" font-weight="600" fill="#9ca3af" text-anchor="middle" letter-spacing="3.5">
        QUARTERLY JOURNAL OF ARCHITECTURE &amp; URBAN FORM
      </text>

      <!-- Bold Serif Masthead -->
      <text x="240" y="112" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="52" font-weight="700" fill="#f9fafb" text-anchor="middle" letter-spacing="8">
        APERTURE
      </text>

      <!-- Sub-masthead bar -->
      <line x1="44" y1="128" x2="436" y2="128" stroke="#4b5563" stroke-width="1"/>
      <text x="44" y="142" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#d1d5db" letter-spacing="1.5">
        ISSUE 42 • WINTER EDITION
      </text>
      <text x="436" y="142" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="600" fill="#9ca3af" text-anchor="end" letter-spacing="1">
        VOL. XVIII • $18 USD / €16 EUR
      </text>

      <!-- Architectural Hero Illustration: Concrete Cantilever & Sky Light -->
      <g transform="translate(44, 168)">
        <!-- Sun angle accent -->
        <circle cx="280" cy="90" r="60" fill="#c25e3e" opacity="0.85"/>
        <!-- Monolith concrete tower -->
        <polygon points="120,40 250,10 250,260 120,290" fill="url(#wallShade)"/>
        <!-- Cantilevered pavilion roof -->
        <polygon points="40,110 350,50 340,90 30,150" fill="#4b5563"/>
        <polygon points="40,110 350,50 350,58 40,118" fill="#9ca3af"/>
        <!-- Recessed glass atrium -->
        <polygon points="120,150 250,115 250,260 120,290" fill="#1e293b" opacity="0.95"/>
        <!-- Vertical mullions -->
        <line x1="150" y1="142" x2="150" y2="282" stroke="#60a5fa" stroke-width="1" opacity="0.6"/>
        <line x1="180" y1="134" x2="180" y2="274" stroke="#60a5fa" stroke-width="1" opacity="0.6"/>
        <line x1="210" y1="126" x2="210" y2="266" stroke="#60a5fa" stroke-width="1" opacity="0.6"/>
        <!-- Horizon shadow -->
        <rect x="0" y="270" width="392" height="4" fill="#c25e3e"/>
      </g>

      <!-- Headline Block -->
      <g transform="translate(44, 480)">
        <text x="0" y="0" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e" letter-spacing="2">
          COVER FEATURE
        </text>
        <text x="0" y="30" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#ffffff" line-height="1.2">
          The Concrete Pavilion
        </text>
        <text x="0" y="58" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#ffffff">
          in the Forest of Kyoto
        </text>
        <text x="0" y="86" font-family="Georgia, serif" font-size="12" fill="#d1d5db" font-style="italic">
          How raw stone and shadow redefine modern contemplation.
        </text>
      </g>

      <!-- Secondary story bullets + Barcode -->
      <line x1="44" y1="590" x2="436" y2="590" stroke="#374151" stroke-width="1"/>
      <g transform="translate(44, 610)">
        <text x="0" y="10" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#ffffff">
          TIMBER TOWERS OF OSLO
        </text>
        <text x="0" y="24" font-family="Helvetica, Arial, sans-serif" font-size="8.5" fill="#9ca3af">
          Cross-laminated wood and sustainable horizons
        </text>

        <text x="0" y="42" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#ffffff">
          SACRED GEOMETRIES
        </text>
        <text x="0" y="56" font-family="Helvetica, Arial, sans-serif" font-size="8.5" fill="#9ca3af">
          The quiet churches of Alvaro Siza
        </text>
      </g>

      <!-- Clean vector barcode -->
      <g transform="translate(366, 610)">
        <rect width="70" height="42" fill="#ffffff" rx="2"/>
        <g fill="#111827">
          <rect x="6" y="5" width="2" height="26"/>
          <rect x="10" y="5" width="4" height="26"/>
          <rect x="16" y="5" width="1" height="26"/>
          <rect x="19" y="5" width="3" height="26"/>
          <rect x="24" y="5" width="1" height="26"/>
          <rect x="27" y="5" width="4" height="26"/>
          <rect x="33" y="5" width="2" height="26"/>
          <rect x="37" y="5" width="2" height="26"/>
          <rect x="41" y="5" width="4" height="26"/>
          <rect x="47" y="5" width="1" height="26"/>
          <rect x="50" y="5" width="3" height="26"/>
          <rect x="55" y="5" width="2" height="26"/>
          <rect x="59" y="5" width="4" height="26"/>
        </g>
        <text x="35" y="38" font-family="monospace" font-size="6" fill="#111827" text-anchor="middle">
          0 74470 99420 5
        </text>
      </g>
      `,
      "#0f131a",
    ),
  );

  // Page 2: Editor's Letter
  pages.push(
    makePage(
      2,
      `
      <!-- Running header -->
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        APERTURE • WINTER 2026
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        NOTEBOOK / 02
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <!-- Headline -->
      <text x="44" y="90" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e" letter-spacing="2">
        EDITOR'S LETTER
      </text>
      <text x="44" y="125" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#111827">
        On Dwelling &amp; Light
      </text>

      <!-- Portrait Silhouette and byline -->
      <g transform="translate(44, 150)">
        <circle cx="28" cy="28" r="28" fill="#e5e7eb"/>
        <path d="M16,48 C16,36 22,32 28,32 C34,32 40,36 40,48 Z" fill="#4b5563"/>
        <circle cx="28" cy="22" r="10" fill="#4b5563"/>
        <text x="68" y="24" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="700" fill="#111827">
          Elena Rostova
        </text>
        <text x="68" y="38" font-family="Georgia, serif" font-size="9" font-style="italic" fill="#6b7280">
          Editor-in-Chief, Zurich
        </text>
      </g>

      <!-- 2-column editorial text -->
      <g transform="translate(44, 230)">
        <!-- Left Column -->
        <g transform="translate(0, 0)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="10.5" fill="#374151" line-height="1.6">
            <tspan x="0" y="14">When we inhabit a space, we rarely</tspan>
            <tspan x="0" y="32">measure its boundaries in meters.</tspan>
            <tspan x="0" y="50">We measure it in the trajectory of the</tspan>
            <tspan x="0" y="68">afternoon sun as it traces across a bare</tspan>
            <tspan x="0" y="86">plaster wall, in the quiet resonance</tspan>
            <tspan x="0" y="104">of timber floorboards beneath our feet,</tspan>
            <tspan x="0" y="122">and in the threshold where enclosure</tspan>
            <tspan x="0" y="140">yields to open horizon.</tspan>
            <tspan x="0" y="166">In this forty-second volume of</tspan>
            <tspan x="0" y="184">Aperture, our contributors examine</tspan>
            <tspan x="0" y="202">what remains when the non-essential</tspan>
            <tspan x="0" y="220">is stripped away. From Tadao Ando's</tspan>
            <tspan x="0" y="238">forested shrines in Kyoto to cross-</tspan>
            <tspan x="0" y="256">laminated timber towers in Oslo,</tspan>
            <tspan x="0" y="274">modern architecture is rediscovering</tspan>
            <tspan x="0" y="292">humility and material truth.</tspan>
          </text>
        </g>

        <!-- Right Column -->
        <g transform="translate(204, 0)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="10.5" fill="#374151">
            <tspan x="0" y="14">True craftsmanship does not shout.</tspan>
            <tspan x="0" y="32">It offers composure. It frames the</tspan>
            <tspan x="0" y="50">landscape rather than dominating it.</tspan>
            <tspan x="0" y="76">As cities face unprecedented density,</tspan>
            <tspan x="0" y="94">the most precious commodity is not</tspan>
            <tspan x="0" y="112">sheer floor space, but visual calm.</tspan>
            <tspan x="0" y="130">A window placed at eye level toward</tspan>
            <tspan x="0" y="148">a solitary maple can transform an</tspan>
            <tspan x="0" y="166">apartment into a sanctuary.</tspan>
            <tspan x="0" y="192">We invite you to turn these pages</tspan>
            <tspan x="0" y="210">slowly. Observe the textures, note the</tspan>
            <tspan x="0" y="228">silences, and consider how the forms</tspan>
            <tspan x="0" y="246">we shape end up shaping our lives.</tspan>
          </text>

          <!-- Signature block -->
          <g transform="translate(0, 290)">
            <path d="M10,20 Q40,5 70,18 T120,10 T160,22" fill="none" stroke="#111827" stroke-width="1.5"/>
            <text x="0" y="42" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#111827">
              ELENA ROSTOVA
            </text>
            <text x="0" y="54" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#6b7280">
              Zurich, November 2026
            </text>
          </g>
        </g>
      </g>

      <!-- Bottom Folio -->
      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        02
      </text>
      `,
    ),
  );

  // Page 3: Table of Contents
  pages.push(
    makePage(
      3,
      `
      <!-- Running header -->
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        APERTURE • CONTENTS
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        VOLUME 42
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <text x="44" y="96" font-family="'Playfair Display', Georgia, serif" font-size="34" font-weight="700" fill="#111827">
        Table of Contents
      </text>

      <!-- TOC entries -->
      <g transform="translate(44, 130)">
        <!-- Section 1 -->
        <g transform="translate(0, 0)">
          <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="700" fill="#c25e3e">04</text>
          <text x="40" y="12" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">The Concrete Pavilion: Kyoto</text>
          <text x="40" y="28" font-family="Georgia, serif" font-size="9.5" fill="#6b7280">Monograph by Kenzo Tange Studio</text>
          <line x1="0" y1="42" x2="392" y2="42" stroke="#f3f4f6" stroke-width="1"/>
        </g>

        <!-- Section 2 -->
        <g transform="translate(0, 56)">
          <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="700" fill="#c25e3e">06</text>
          <text x="40" y="12" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">Visual Essay: Stone, Glass &amp; Light</text>
          <text x="40" y="28" font-family="Georgia, serif" font-size="9.5" fill="#6b7280">Photographs by Hélène Binet in Vals</text>
          <line x1="0" y1="42" x2="392" y2="42" stroke="#f3f4f6" stroke-width="1"/>
        </g>

        <!-- Section 3 -->
        <g transform="translate(0, 112)">
          <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="700" fill="#c25e3e">08</text>
          <text x="40" y="12" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">Dialogue: Density &amp; The Void</text>
          <text x="40" y="28" font-family="Georgia, serif" font-size="9.5" fill="#6b7280">In conversation with Balkrishna Doshi</text>
          <line x1="0" y1="42" x2="392" y2="42" stroke="#f3f4f6" stroke-width="1"/>
        </g>

        <!-- Section 4 -->
        <g transform="translate(0, 168)">
          <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="700" fill="#c25e3e">10</text>
          <text x="40" y="12" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">Monograph: The Nordic Timber Spine</text>
          <text x="40" y="28" font-family="Georgia, serif" font-size="9.5" fill="#6b7280">Engineering the tallest wooden structures</text>
          <line x1="0" y1="42" x2="392" y2="42" stroke="#f3f4f6" stroke-width="1"/>
        </g>

        <!-- Section 5 -->
        <g transform="translate(0, 224)">
          <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="700" fill="#c25e3e">12</text>
          <text x="40" y="12" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">Colophon, Archive &amp; Imprint</text>
          <text x="40" y="28" font-family="Georgia, serif" font-size="9.5" fill="#6b7280">Credits, typeface catalog, and publishing notes</text>
          <line x1="0" y1="42" x2="392" y2="42" stroke="#f3f4f6" stroke-width="1"/>
        </g>
      </g>

      <!-- Decorative vignette block -->
      <g transform="translate(44, 430)">
        <rect width="392" height="170" fill="#f4efe6" rx="4"/>
        <text x="24" y="36" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#78350f" letter-spacing="1.5">
          CURATOR'S SPOTLIGHT
        </text>
        <text x="24" y="64" font-family="'Playfair Display', Georgia, serif" font-size="18" font-weight="700" fill="#1c1917">
          "Architecture is not about space, but about time."
        </text>
        <text x="24" y="92" font-family="Georgia, serif" font-size="10.5" fill="#44403c">
          An exploration into weathering materials, patinated copper, and concrete that gains nobility across decades of rain and sun.
        </text>
        <text x="24" y="132" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e">
          CONTINUE TO PAGE 04 →
        </text>
      </g>

      <!-- Bottom Folio -->
      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        03
      </text>
      `,
    ),
  );

  // Page 4: Feature Story (Left page of spread)
  pages.push(
    makePage(
      4,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        MONOGRAPH • KYOTO
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        04
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <!-- Category & Headline -->
      <text x="44" y="86" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e" letter-spacing="2">
        FEATURE ARTICLE
      </text>
      <text x="44" y="122" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="700" fill="#111827">
        The Concrete Pavilion
      </text>
      <text x="44" y="148" font-family="Georgia, serif" font-size="12" fill="#4b5563" font-style="italic">
        Silence, water, and geometry along the eastern hills of Kyoto.
      </text>
      <line x1="44" y1="164" x2="160" y2="164" stroke="#c25e3e" stroke-width="2"/>

      <!-- 2-column text with illuminated drop-cap -->
      <g transform="translate(44, 186)">
        <!-- Giant drop cap 'A' -->
        <rect x="0" y="0" width="48" height="52" fill="#1e293b" rx="2"/>
        <text x="24" y="40" font-family="'Playfair Display', serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle">
          A
        </text>

        <!-- Column 1 -->
        <g transform="translate(0, 0)">
          <text x="56" y="16" font-family="Georgia, serif" font-size="10" fill="#374151">
            <tspan x="56" y="16">long the moss-covered slope of</tspan>
            <tspan x="56" y="32">Mount Hiei, the concrete structure</tspan>
            <tspan x="56" y="48">appears not as an intrusion,</tspan>
            <tspan x="0" y="70">but as an ancient outcropping of stone</tspan>
            <tspan x="0" y="88">revealed by centuries of rain.</tspan>
            <tspan x="0" y="112">Designed as a private tea sanctuary and</tspan>
            <tspan x="0" y="130">study, the pavilion occupies a rectangular</tspan>
            <tspan x="0" y="148">footprint carved directly into granite.</tspan>
            <tspan x="0" y="166">Its outer walls are board-formed concrete,</tspan>
            <tspan x="0" y="184">poured against cedar planks that left deep</tspan>
            <tspan x="0" y="202">grain impressions in the aggregate.</tspan>
            <tspan x="0" y="228">There are no ornamental moldings,</tspan>
            <tspan x="0" y="246">no baseboards, no painted surfaces.</tspan>
            <tspan x="0" y="264">The material itself is the narrative.</tspan>
            <tspan x="0" y="282">Light enters solely through a ceiling</tspan>
            <tspan x="0" y="300">aperture four meters above the floor.</tspan>
          </text>
        </g>

        <!-- Column 2 -->
        <g transform="translate(204, 0)">
          <text x="0" y="16" font-family="Georgia, serif" font-size="10" fill="#374151">
            <tspan x="0" y="16">"We wanted the building to age with</tspan>
            <tspan x="0" y="32">the mountain," explains lead architect</tspan>
            <tspan x="0" y="48">Takahashi Morimoto. "Concrete is often</tspan>
            <tspan x="0" y="66">treated as cold and indifferent, but when</tspan>
            <tspan x="0" y="84">given the touch of cedar and the moisture</tspan>
            <tspan x="0" y="102">of forest air, it acquires moss, lichen,</tspan>
            <tspan x="0" y="120">and a profound sense of time."</tspan>
            <tspan x="0" y="146">A shallow reflecting pool of basalt</tspan>
            <tspan x="0" y="164">stone mirrors the cedar canopies above,</tspan>
            <tspan x="0" y="182">creating an undulating ripple of sky</tspan>
            <tspan x="0" y="200">across the recessed ceiling.</tspan>
            <tspan x="0" y="226">The pavilion requires no artificial cooling:</tspan>
            <tspan x="0" y="244">the thermal mass of the mountain</tspan>
            <tspan x="0" y="262">maintains a constant interior temperature</tspan>
            <tspan x="0" y="280">of 18 degrees Celsius year-round.</tspan>
            <tspan x="0" y="306">CONTINUED ON SPREAD 05 →</tspan>
          </text>
        </g>
      </g>

      <!-- Architectural detail sketch -->
      <g transform="translate(44, 520)">
        <rect width="392" height="96" fill="#f4efe6" rx="2"/>
        <line x1="20" y1="48" x2="372" y2="48" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3"/>
        <polygon points="40,70 120,30 200,30 280,70" fill="none" stroke="#334155" stroke-width="1.5"/>
        <circle cx="160" cy="30" r="4" fill="#c25e3e"/>
        <text x="175" y="34" font-family="monospace" font-size="8" fill="#475569">ZENITH SKYLIGHT APERTURE</text>
        <text x="24" y="84" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#64748b">
          CROSS SECTION SCALE 1:100 • EAST-WEST ELEVATION
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        04
      </text>
      `,
    ),
  );

  // Page 5: Feature Story (Right page of spread)
  pages.push(
    makePage(
      5,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        MONOGRAPH • KYOTO
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        05
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <!-- Large Pull Quote Box -->
      <g transform="translate(44, 80)">
        <rect width="392" height="150" fill="#181e29" rx="4"/>
        <text x="28" y="42" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#c25e3e">“</text>
        <text x="48" y="52" font-family="'Playfair Display', Georgia, serif" font-size="18" font-style="italic" fill="#ffffff" line-height="1.4">
          Light does not merely illuminate space;
        </text>
        <text x="48" y="78" font-family="'Playfair Display', Georgia, serif" font-size="18" font-style="italic" fill="#ffffff">
          it invents it anew at every hour
        </text>
        <text x="48" y="104" font-family="'Playfair Display', Georgia, serif" font-size="18" font-style="italic" fill="#ffffff">
          of the changing season.
        </text>
        <text x="48" y="132" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#9ca3af" letter-spacing="1">
          TAKAHASHI MORIMOTO • ARCHITECTURAL DISPATCH
        </text>
      </g>

      <!-- 2-column text continuation -->
      <g transform="translate(44, 255)">
        <g transform="translate(0, 0)">
          <text x="0" y="14" font-family="Georgia, serif" font-size="10" fill="#374151">
            <tspan x="0" y="14">The construction required eight months</tspan>
            <tspan x="0" y="32">of preparation before the first cubic</tspan>
            <tspan x="0" y="50">meter of concrete was poured. Because</tspan>
            <tspan x="0" y="68">the site sits inside a protected nature</tspan>
            <tspan x="0" y="86">reserve, no heavy machinery could enter</tspan>
            <tspan x="0" y="104">the forest path. Every bucket of sand,</tspan>
            <tspan x="0" y="122">every cedar plank, and every reinforcing</tspan>
            <tspan x="0" y="140">bar was hauled by hand and cable.</tspan>
            <tspan x="0" y="166">This physical constraint imposed a</tspan>
            <tspan x="0" y="184">disciplined frugality on the design.</tspan>
            <tspan x="0" y="202">Every wall thickness corresponds to the</tspan>
            <tspan x="0" y="220">exact bearing load required, creating</tspan>
            <tspan x="0" y="238">tapered profiles that soften the visual</tspan>
            <tspan x="0" y="256">bulk of the pavilion.</tspan>
          </text>
        </g>

        <g transform="translate(204, 0)">
          <text x="0" y="14" font-family="Georgia, serif" font-size="10" fill="#374151">
            <tspan x="0" y="14">At dusk, as the mountain mists gather,</tspan>
            <tspan x="0" y="32">a single recessed bronze lamp glows</tspan>
            <tspan x="0" y="50">at the water's edge. The concrete takes</tspan>
            <tspan x="0" y="68">on the hue of deep charcoal, fading</tspan>
            <tspan x="0" y="86">gracefully into the surrounding pines.</tspan>
            <tspan x="0" y="112">Visitors describe an immediate drop in</tspan>
            <tspan x="0" y="130">pulse rate upon entering the threshold.</tspan>
            <tspan x="0" y="148">In an era dominated by glass towers and</tspan>
            <tspan x="0" y="166">frenetic digital displays, the pavilion</tspan>
            <tspan x="0" y="184">stands as a profound affirmation of</tspan>
            <tspan x="0" y="202">silence and solid form.</tspan>
            <tspan x="0" y="228">A monument to permanence in a world</tspan>
            <tspan x="0" y="246">of disposable architecture.</tspan>
          </text>
        </g>
      </g>

      <!-- Project Metadata Card -->
      <g transform="translate(44, 530)">
        <rect width="392" height="85" fill="#ffffff" stroke="#e5e7eb" stroke-width="1" rx="4"/>
        <text x="16" y="22" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1">
          PROJECT DATA
        </text>
        <text x="16" y="42" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#111827">
          LOCATION: Mount Hiei, Kyoto • COMPLETED: 2025
        </text>
        <text x="16" y="58" font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#4b5563">
          ARCHITECT: Morimoto Takahashi Architects • AREA: 180 m²
        </text>
        <text x="16" y="74" font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#4b5563">
          STRUCTURAL: Arup Japan • MATERIALS: Board-formed concrete, cedar, basalt
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        05
      </text>
      `,
    ),
  );

  // Page 6: Visual Essay (Left page)
  pages.push(
    makePage(
      6,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        VISUAL ESSAY • STONE &amp; LIGHT
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        06
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <!-- Large Framed Architectural Photograph Placeholder Composition -->
      <g transform="translate(44, 76)">
        <rect width="392" height="360" fill="#1c2430" rx="3"/>
        <!-- Abstract architectural geometric interplay -->
        <polygon points="0,360 160,180 392,360" fill="#2d3748"/>
        <polygon points="0,0 220,0 120,220" fill="#4a5568" opacity="0.7"/>
        <polygon points="220,0 392,0 392,200 240,160" fill="#718096" opacity="0.5"/>
        <line x1="120" y1="220" x2="392" y2="200" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="310" cy="80" r="30" fill="#f59e0b" opacity="0.8"/>
        <text x="20" y="340" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#f8fafc">
          FIG. 01: THE SHADOW RECESS AT HIGH NOON
        </text>
      </g>

      <!-- Caption & Critique Block -->
      <g transform="translate(44, 460)">
        <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="16" font-weight="700" fill="#111827">
          The Geometry of Absence
        </text>
        <text x="0" y="38" font-family="Georgia, serif" font-size="10.5" fill="#4b5563">
          <tspan x="0" y="38">Where light fails to reach, space does not end; it merely deepens.</tspan>
          <tspan x="0" y="56">The deliberate under-lighting of the entrance vestibule forces</tspan>
          <tspan x="0" y="74">the eye to dilate, preparing the occupant for the dramatic</tspan>
          <tspan x="0" y="92">release of the central atrium's vertical clerestory.</tspan>
          <tspan x="0" y="116">Photograph by Hélène Binet, Vals Valley, Switzerland.</tspan>
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        07
      </text>
      `,
    ),
  );

  // Page 7: Visual Essay (Right page)
  pages.push(
    makePage(
      7,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        VISUAL ESSAY • STONE &amp; LIGHT
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        07
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <!-- Two smaller visual detail frames -->
      <g transform="translate(44, 76)">
        <rect width="392" height="210" fill="#2d3748" rx="3"/>
        <!-- Texture simulation -->
        <g stroke="#4a5568" stroke-width="1" opacity="0.4">
          <line x1="0" y1="35" x2="392" y2="35"/>
          <line x1="0" y1="70" x2="392" y2="70"/>
          <line x1="0" y1="105" x2="392" y2="105"/>
          <line x1="0" y1="140" x2="392" y2="140"/>
          <line x1="0" y1="175" x2="392" y2="175"/>
        </g>
        <text x="20" y="195" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#f8fafc">
          FIG. 02: BOARD-FORMED CEDAR IMPRINTS ALONG THE WEST WALL
        </text>
      </g>

      <g transform="translate(44, 306)">
        <rect width="392" height="210" fill="#1a202c" rx="3"/>
        <circle cx="196" cy="105" r="50" fill="none" stroke="#60a5fa" stroke-width="2"/>
        <circle cx="196" cy="105" r="25" fill="#f59e0b" opacity="0.8"/>
        <text x="20" y="195" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#f8fafc">
          FIG. 03: SUN BEAM INCIDENCE AT THE SOLSTICE
        </text>
      </g>

      <!-- Bottom commentary -->
      <g transform="translate(44, 536)">
        <text x="0" y="16" font-family="Georgia, serif" font-size="10" fill="#4b5563">
          <tspan x="0" y="16">"The material carries the memory of its maker's hands. When we look</tspan>
          <tspan x="0" y="32">at concrete, we are looking at frozen liquid rock, an act of geological creation</tspan>
          <tspan x="0" y="48">compressed into four hours of human labor."</tspan>
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        07
      </text>
      `,
    ),
  );

  // Page 8: Interview Spread (Left)
  pages.push(
    makePage(
      8,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        DIALOGUE • IN CONVERSATION
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        08
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <text x="44" y="86" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e" letter-spacing="2">
        THE INTERVIEW
      </text>
      <text x="44" y="122" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#111827">
        Density, Void &amp; Memory
      </text>
      <text x="44" y="146" font-family="Georgia, serif" font-size="11" fill="#4b5563" font-style="italic">
        Balkrishna Doshi reflects on seven decades of building for community.
      </text>

      <!-- Q&A transcript block -->
      <g transform="translate(44, 180)">
        <text x="0" y="16" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" fill="#111827">
          APERTURE: You often speak of buildings having a pulse. What creates that?
        </text>
        <text x="0" y="38" font-family="Georgia, serif" font-size="10.5" fill="#374151">
          <tspan x="0" y="38">DOSHI: A building begins to breathe only when people bring their rituals</tspan>
          <tspan x="0" y="56">into it. The architect creates merely an invitation: a shaded step, a courtyard</tspan>
          <tspan x="0" y="74">where air cools at evening, a lintel where swallows can nest.</tspan>
        </text>

        <text x="0" y="112" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" fill="#111827">
          APERTURE: Does contemporary architecture prioritize novelty over permanence?
        </text>
        <text x="0" y="134" font-family="Georgia, serif" font-size="10.5" fill="#374151">
          <tspan x="0" y="134">DOSHI: Novelty is cheap. It exhausts itself in ten years. Permanence is not</tspan>
          <tspan x="0" y="152">about hard stone, but about love. If people love a space, they will repair it,</tspan>
          <tspan x="0" y="170">wash it, cherish it, and pass it on to their grandchildren.</tspan>
        </text>

        <text x="0" y="208" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" fill="#111827">
          APERTURE: What advice do you give to a young architect opening a studio today?
        </text>
        <text x="0" y="230" font-family="Georgia, serif" font-size="10.5" fill="#374151">
          <tspan x="0" y="230">DOSHI: Walk the site at dawn. Walk it at midnight in the pouring rain.</tspan>
          <tspan x="0" y="248">Sit on the earth and close your eyes. The site is already whispering its needs;</tspan>
          <tspan x="0" y="266">your drawing is simply the transcription of that voice.</tspan>
        </text>
      </g>

      <!-- Sidebar profile card -->
      <g transform="translate(44, 490)">
        <rect width="392" height="110" fill="#f4efe6" rx="4"/>
        <text x="20" y="28" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#78350f">
          BIOGRAPHICAL NOTE
        </text>
        <text x="20" y="48" font-family="Georgia, serif" font-size="10" fill="#44403c">
          Balkrishna Doshi (1927–2023) was an Indian architect, urban planner, and educator. A fellow of Le Corbusier and Louis Kahn, he was awarded the Pritzker Architecture Prize in 2018 for his pioneering low-cost housing and institutional designs.
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        08
      </text>
      `,
    ),
  );

  // Page 9: Interview Spread (Right)
  pages.push(
    makePage(
      9,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        DIALOGUE • IN CONVERSATION
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        09
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <!-- Graphic Analytical Diagram: Density vs Thermal Comfort -->
      <g transform="translate(44, 80)">
        <rect width="392" height="240" fill="#ffffff" stroke="#e5e7eb" rx="4"/>
        <text x="20" y="28" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#111827">
          FIG. 04: COURTYARD VENTILATION DYNAMICS
        </text>
        <!-- Wind streamline vector curves -->
        <path d="M40,160 Q120,60 200,120 T360,80" fill="none" stroke="#0284c7" stroke-width="2"/>
        <path d="M40,190 Q140,90 220,150 T360,110" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4"/>
        <rect x="160" y="140" width="80" height="70" fill="#f1f5f9" stroke="#94a3b8"/>
        <text x="200" y="180" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#475569" text-anchor="middle">
          COURTYARD
        </text>
        <text x="20" y="224" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#64748b">
          MICROCLIMATE COOLING RATIO • SANGATH STUDIO AHMEDABAD
        </text>
      </g>

      <!-- Continued discussion -->
      <g transform="translate(44, 350)">
        <text x="0" y="16" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" fill="#111827">
          APERTURE: How does climate change shift the architect's moral obligation?
        </text>
        <text x="0" y="38" font-family="Georgia, serif" font-size="10.5" fill="#374151">
          <tspan x="0" y="38">DOSHI: We cannot build glass boxes in the tropics and rely on coal-powered</tspan>
          <tspan x="0" y="56">air conditioning to make them livable. That era is finished. The true modernism</tspan>
          <tspan x="0" y="74">is vernacular wisdom combined with computational structural precision.</tspan>
          <tspan x="0" y="98">When you work with gravity, shade, and wind, nature becomes your ally.</tspan>
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        09
      </text>
      `,
    ),
  );

  // Page 10: Urban Monograph (Left)
  pages.push(
    makePage(
      10,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        MONOGRAPH • SUSTAINABLE TIMBER
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        10
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <text x="44" y="86" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e" letter-spacing="2">
        MATERIAL FOCUS
      </text>
      <text x="44" y="122" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#111827">
        The Nordic Timber Spine
      </text>
      <text x="44" y="146" font-family="Georgia, serif" font-size="11" fill="#4b5563" font-style="italic">
        How cross-laminated spruce is displacing carbon-heavy steel.
      </text>

      <!-- 2 column timber engineering report -->
      <g transform="translate(44, 180)">
        <g transform="translate(0, 0)">
          <text x="0" y="14" font-family="Georgia, serif" font-size="10" fill="#374151">
            <tspan x="0" y="14">In the lake district north of Oslo,</tspan>
            <tspan x="0" y="32">the Mjøstårnet tower rises eighty-five</tspan>
            <tspan x="0" y="50">meters above the water. It contains</tspan>
            <tspan x="0" y="68">eighteen stories of apartments, hotel</tspan>
            <tspan x="0" y="86">suites, and office studios, constructed</tspan>
            <tspan x="0" y="104">entirely from glulam columns and CLT</tspan>
            <tspan x="0" y="122">floor decks.</tspan>
            <tspan x="0" y="148">Unlike concrete, which accounts for eight</tspan>
            <tspan x="0" y="166">percent of global greenhouse emissions,</tspan>
            <tspan x="0" y="184">timber stores carbon for centuries.</tspan>
            <tspan x="0" y="202">Every cubic meter of Nordic spruce</tspan>
            <tspan x="0" y="220">sequesters roughly one ton of CO2.</tspan>
          </text>
        </g>
        <g transform="translate(204, 0)">
          <text x="0" y="14" font-family="Georgia, serif" font-size="10" fill="#374151">
            <tspan x="0" y="14">"The acoustic and olfactory qualities</tspan>
            <tspan x="0" y="32">of living in a wooden high-rise are</tspan>
            <tspan x="0" y="50">unprecedented," says engineer Kristin</tspan>
            <tspan x="0" y="68">Aas. "You smell the pine forest when you</tspan>
            <tspan x="0" y="86">wake up. The wood regulates moisture</tspan>
            <tspan x="0" y="104">naturally, absorbing excess humidity."</tspan>
            <tspan x="0" y="130">With fire safety ratings verified</tspan>
            <tspan x="0" y="148">through controlled charring tests,</tspan>
            <tspan x="0" y="166">timber engineering has entered a mature,</tspan>
            <tspan x="0" y="184">rigorous architectural renaissance.</tspan>
          </text>
        </g>
      </g>

      <!-- Timber grain diagram -->
      <g transform="translate(44, 450)">
        <rect width="392" height="150" fill="#fdfbf7" stroke="#e5e7eb" rx="4"/>
        <text x="20" y="26" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#78350f">
          CROSS-LAMINATED TIMBER (CLT) GRAIN ORIENTATION
        </text>
        <!-- Layer illustration -->
        <rect x="20" y="44" width="352" height="24" fill="#e2d2b5"/>
        <line x1="20" y1="56" x2="372" y2="56" stroke="#b09b75" stroke-width="1"/>
        <rect x="20" y="72" width="352" height="24" fill="#cbb794"/>
        <!-- vertical lines for 90 deg rotation -->
        <g stroke="#9f875e" stroke-width="1">
          <line x1="60" y1="72" x2="60" y2="96"/>
          <line x1="120" y1="72" x2="120" y2="96"/>
          <line x1="180" y1="72" x2="180" y2="96"/>
          <line x1="240" y1="72" x2="240" y2="96"/>
          <line x1="300" y1="72" x2="300" y2="96"/>
        </g>
        <rect x="20" y="100" width="352" height="24" fill="#e2d2b5"/>
        <line x1="20" y1="112" x2="372" y2="112" stroke="#b09b75" stroke-width="1"/>
        <text x="20" y="140" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#78716c">
          ALTERNATING 90° GRAIN ORIENTATION ELIMINATES HYGROSCOPIC WARPING
        </text>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        10
      </text>
      `,
    ),
  );

  // Page 11: Bookshelf & Reviews (Right)
  pages.push(
    makePage(
      11,
      `
      <text x="44" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" letter-spacing="1.5">
        CRITIQUE • REVIEWS &amp; BOOKSHELF
      </text>
      <text x="436" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#9ca3af" text-anchor="end">
        11
      </text>
      <line x1="44" y1="52" x2="436" y2="52" stroke="#e5e7eb" stroke-width="1"/>

      <text x="44" y="86" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#c25e3e" letter-spacing="2">
        ESSENTIAL READING
      </text>
      <text x="44" y="122" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#111827">
        The Winter Bookshelf
      </text>

      <g transform="translate(44, 150)">
        <!-- Book Review 1 -->
        <g transform="translate(0, 0)">
          <rect width="60" height="85" fill="#1e293b" rx="2"/>
          <text x="74" y="16" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#111827">
            The Thinking Hand
          </text>
          <text x="74" y="30" font-family="Georgia, serif" font-size="9" font-style="italic" fill="#6b7280">
            Juhani Pallasmaa • Wiley, 2024
          </text>
          <text x="74" y="48" font-family="Georgia, serif" font-size="9.5" fill="#374151">
            <tspan x="74" y="48">A profound examination of how tactile sensory intelligence</tspan>
            <tspan x="74" y="64">informs drawing, sculpting, and structural imagination.</tspan>
          </text>
          <line x1="0" y1="105" x2="392" y2="105" stroke="#f3f4f6" stroke-width="1"/>
        </g>

        <!-- Book Review 2 -->
        <g transform="translate(0, 125)">
          <rect width="60" height="85" fill="#78350f" rx="2"/>
          <text x="74" y="16" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#111827">
            Atmospheres: Architectural Environments
          </text>
          <text x="74" y="30" font-family="Georgia, serif" font-size="9" font-style="italic" fill="#6b7280">
            Peter Zumthor • Birkhäuser, 2025
          </text>
          <text x="74" y="48" font-family="Georgia, serif" font-size="9.5" fill="#374151">
            <tspan x="74" y="48">Nine poetic reflections on emotional resonance, materials,</tspan>
            <tspan x="74" y="64">temperature, and acoustic quietude in built spaces.</tspan>
          </text>
          <line x1="0" y1="105" x2="392" y2="105" stroke="#f3f4f6" stroke-width="1"/>
        </g>

        <!-- Book Review 3 -->
        <g transform="translate(0, 250)">
          <rect width="60" height="85" fill="#047857" rx="2"/>
          <text x="74" y="16" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#111827">
            The Ecology of Commerce &amp; Design
          </text>
          <text x="74" y="30" font-family="Georgia, serif" font-size="9" font-style="italic" fill="#6b7280">
            Paul Hawken &amp; Studio Mumbai • Harper, 2026
          </text>
          <text x="74" y="48" font-family="Georgia, serif" font-size="9.5" fill="#374151">
            <tspan x="74" y="48">A practical manual for regenerative urban master planning</tspan>
            <tspan x="74" y="64">utilizing circular stone and timber supply chains.</tspan>
          </text>
        </g>
      </g>

      <line x1="44" y1="630" x2="436" y2="630" stroke="#e5e7eb" stroke-width="1"/>
      <text x="44" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#9ca3af">
        APERTURE MAGAZINE
      </text>
      <text x="436" y="648" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#111827" text-anchor="end">
        11
      </text>
      `,
    ),
  );

  // Page 12: Back Cover (Dark, Minimalist, Elegant)
  pages.push(
    makePage(
      12,
      `
      <rect width="480" height="679" fill="#0f131a"/>

      <!-- Center Logo & Colophon -->
      <g transform="translate(240, 220)">
        <polygon points="0,-36 32,20 -32,20" fill="none" stroke="#c25e3e" stroke-width="2"/>
        <circle cx="0" cy="0" r="12" fill="#c25e3e"/>
        <text x="0" y="60" font-family="'Cinzel', Georgia, serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="6">
          APERTURE
        </text>
        <text x="0" y="80" font-family="Helvetica, Arial, sans-serif" font-size="8.5" fill="#9ca3af" text-anchor="middle" letter-spacing="2">
          ARCHITECTURE &amp; URBAN FORM
        </text>
      </g>

      <!-- Publishing Imprint Details -->
      <g transform="translate(240, 420)">
        <text x="0" y="0" font-family="Georgia, serif" font-size="10" fill="#9ca3af" text-anchor="middle">
          Published quarterly by Aperture Studio Press
        </text>
        <text x="0" y="18" font-family="Georgia, serif" font-size="10" fill="#9ca3af" text-anchor="middle">
          Zurich • Kyoto • London • New York
        </text>
        <text x="0" y="44" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#6b7280" text-anchor="middle" letter-spacing="1">
          PRINTED ON FSC-CERTIFIED UNCOATED RAG PAPER
        </text>
        <text x="0" y="58" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">
          ISSN 2490-8812 • ALL RIGHTS RESERVED
        </text>
      </g>

      <!-- Bottom Subscription CTA -->
      <g transform="translate(240, 580)">
        <rect x="-100" y="-18" width="200" height="36" fill="none" stroke="#4b5563" stroke-width="1" rx="18"/>
        <text x="0" y="4" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
          APERTUREMAGAZINE.ORG
        </text>
      </g>
      `,
      "#0f131a",
    ),
  );

  return pages;
}
