import { PAGE_HEIGHT, PAGE_WIDTH, svgWrap } from "./svgUtils";
import type { ImportedPage, TocItem } from "@plif/core";

export const NEWSPAPER_TITLE = "The Morning Chronicle";

export const NEWSPAPER_TOC: TocItem[] = [
  { title: "Front Page", page: 1 },
  { title: "Metropolitan Dispatch", page: 2 },
  { title: "National & Global Affairs", page: 3 },
  { title: "Editorial & Civic Voices", page: 4 },
  { title: "Commerce & Markets", page: 6 },
  { title: "Arts, Books & Living", page: 8 },
  { title: "Sports & Athletics", page: 10 },
  { title: "Crossword & Classifieds", page: 12 },
];

function makeNewsPage(num: number, svgContent: string): ImportedPage {
  return {
    id: `sample-news-${num}`,
    src: svgWrap(svgContent, "#f6f3eb"),
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    alt: `Newspaper Page ${num}`,
  };
}

export function createNewspaperPages(): ImportedPage[] {
  const pages: ImportedPage[] = [];

  // Page 1: Front Page (Classic broadsheet masthead, headlines, multi-column)
  pages.push(
    makeNewsPage(
      1,
      `
      <!-- Top ear boxes -->
      <g transform="translate(36, 24)">
        <text x="0" y="10" font-family="Georgia, serif" font-size="7.5" font-weight="700" fill="#1c1917">
          WEATHER: FAIR, 62°F
        </text>
        <text x="0" y="20" font-family="Helvetica, Arial, sans-serif" font-size="6.5" fill="#57534e">
          Breezy northwest winds
        </text>

        <text x="408" y="10" font-family="Georgia, serif" font-size="7.5" font-weight="700" fill="#1c1917" text-anchor="end">
          FINAL CITY EDITION
        </text>
        <text x="408" y="20" font-family="Helvetica, Arial, sans-serif" font-size="6.5" fill="#57534e" text-anchor="end">
          PRICE: FIFTY CENTS
        </text>
      </g>
      <line x1="36" y1="52" x2="444" y2="52" stroke="#1c1917" stroke-width="1.2"/>

      <!-- Broadsheet Masthead -->
      <text x="240" y="98" font-family="'Playfair Display', 'Times New Roman', Georgia, serif" font-size="34" font-weight="900" fill="#1c1917" text-anchor="middle" letter-spacing="1.5">
        THE MORNING CHRONICLE
      </text>

      <!-- Motto bar -->
      <line x1="36" y1="110" x2="444" y2="110" stroke="#1c1917" stroke-width="2.5"/>
      <line x1="36" y1="113" x2="444" y2="113" stroke="#1c1917" stroke-width="0.8"/>
      <text x="40" y="123" font-family="Helvetica, Arial, sans-serif" font-size="7" font-weight="700" fill="#1c1917">
        ESTABLISHED 1894 • NUMBER 44,218
      </text>
      <text x="240" y="123" font-family="Georgia, serif" font-size="7" font-style="italic" fill="#57534e" text-anchor="middle">
        "Veritas Vincit — Truth Conquers"
      </text>
      <text x="440" y="123" font-family="Helvetica, Arial, sans-serif" font-size="7" font-weight="700" fill="#1c1917" text-anchor="end">
        WEDNESDAY, NOVEMBER 11, 2026
      </text>
      <line x1="36" y1="128" x2="444" y2="128" stroke="#1c1917" stroke-width="0.8"/>

      <!-- Lead Headline Across Spread -->
      <g transform="translate(36, 142)">
        <text x="204" y="24" font-family="'Playfair Display', Georgia, serif" font-size="23" font-weight="900" fill="#1c1917" text-anchor="middle" letter-spacing="-0.5">
          GLOBAL ACCORD RATIFIES TRANSIT PACT
        </text>
        <text x="204" y="44" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#44403c" text-anchor="middle">
          Mayors of Forty Capitals Pledge Complete Electric Rail Grid by 2035
        </text>
        <line x1="0" y1="52" x2="408" y2="52" stroke="#d6d1c4" stroke-width="1"/>
      </g>

      <!-- 3-Column Broadsheet Front Page Grid -->
      <g transform="translate(36, 202)">
        <!-- Column 1 (Left News & Index) -->
        <g transform="translate(0, 0)">
          <text x="0" y="12" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#991b1b">
            CIVIC INFRASTRUCTURE
          </text>
          <text x="0" y="26" font-family="'Playfair Display', Georgia, serif" font-size="12" font-weight="700" fill="#1c1917">
            Harbor Tunnel Opens Early
          </text>
          <text x="0" y="42" font-family="Georgia, serif" font-size="8.5" fill="#292524" line-height="1.4">
            <tspan x="0" y="42" font-weight="700">PORT DISTRICT — </tspan>
            <tspan>Commuters enjoyed</tspan>
            <tspan x="0" y="54">their first rides beneath the eastern bay</tspan>
            <tspan x="0" y="66">this morning as the subsea rail route</tspan>
            <tspan x="0" y="78">welcomed express trains two months ahead</tspan>
            <tspan x="0" y="90">of projected schedule.</tspan>
            <tspan x="0" y="106">Transit authorities reported flawless</tspan>
            <tspan x="0" y="118">signaling along the six-mile tunnel,</tspan>
            <tspan x="0" y="130">which halves transit times between the</tspan>
            <tspan x="0" y="142">financial core and industrial docks.</tspan>
          </text>

          <line x1="0" y1="160" x2="124" y2="160" stroke="#d6d1c4" stroke-width="1"/>
          <!-- Index Box -->
          <g transform="translate(0, 172)">
            <rect width="124" height="230" fill="#eeebe2" stroke="#d6d1c4" stroke-width="0.8" rx="2"/>
            <text x="8" y="18" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#1c1917">
              TODAY'S INDEX
            </text>
            <line x1="8" y1="24" x2="116" y2="24" stroke="#1c1917" stroke-width="0.8"/>
            <text x="8" y="42" font-family="Georgia, serif" font-size="8" fill="#1c1917">Metropolitan ................ Page 2</text>
            <text x="8" y="62" font-family="Georgia, serif" font-size="8" fill="#1c1917">National News ............. Page 3</text>
            <text x="8" y="82" font-family="Georgia, serif" font-size="8" fill="#1c1917">Editorial Voices ........... Page 4</text>
            <text x="8" y="102" font-family="Georgia, serif" font-size="8" fill="#1c1917">Letters to Editor .......... Page 5</text>
            <text x="8" y="122" font-family="Georgia, serif" font-size="8" fill="#1c1917">Commerce &amp; Fin. ........ Page 6</text>
            <text x="8" y="142" font-family="Georgia, serif" font-size="8" fill="#1c1917">Market Tables ............. Page 7</text>
            <text x="8" y="162" font-family="Georgia, serif" font-size="8" fill="#1c1917">Books &amp; Arts ............... Page 8</text>
            <text x="8" y="182" font-family="Georgia, serif" font-size="8" fill="#1c1917">Sports Chronicle ........ Page 10</text>
            <text x="8" y="202" font-family="Georgia, serif" font-size="8" fill="#1c1917">Crossword/Weather ... Page 12</text>
          </g>
        </g>
        <line x1="134" y1="0" x2="134" y2="410" stroke="#e7e5e4" stroke-width="1"/>

        <!-- Column 2 (Center Hero Story) -->
        <g transform="translate(142, 0)">
          <!-- Wire Photo Illustration -->
          <rect width="134" height="150" fill="#292524" rx="2"/>
          <polygon points="10,140 60,60 124,140" fill="#44403c"/>
          <polygon points="50,140 90,80 130,140" fill="#57534e"/>
          <circle cx="100" cy="40" r="14" fill="#fafaf9" opacity="0.8"/>
          <text x="6" y="145" font-family="Helvetica, Arial, sans-serif" font-size="6" fill="#f5f5f4">
            DELEGATES SIGNING CHARTER IN GENEVA
          </text>

          <text x="0" y="168" font-family="Georgia, serif" font-size="8.5" fill="#292524" line-height="1.38">
            <tspan x="0" y="168" font-weight="700">GENEVA — </tspan>
            <tspan>Following twelve days</tspan>
            <tspan x="0" y="180">of exhaustive negotiations, chief</tspan>
            <tspan x="0" y="192">executives representing major world</tspan>
            <tspan x="0" y="204">urban centers signed the Geneva</tspan>
            <tspan x="0" y="216">Transit Compact yesterday evening.</tspan>
            <tspan x="0" y="232">The binding agreement guarantees</tspan>
            <tspan x="0" y="244">twenty billion dollars in pooled credit</tspan>
            <tspan x="0" y="256">to replace diesel bus fleets with</tspan>
            <tspan x="0" y="268">zero-emission battery and catenary</tspan>
            <tspan x="0" y="280">networks before the decade closes.</tspan>
            <tspan x="0" y="296">"Our streets will once again belong</tspan>
            <tspan x="0" y="308">to pedestrians and fresh air," declared</tspan>
            <tspan x="0" y="320">Geneva Council President Lucerne.</tspan>
            <tspan x="0" y="336">"This pact proves that regional</tspan>
            <tspan x="0" y="348">governments can forge consensus</tspan>
            <tspan x="0" y="360">where national assemblies falter."</tspan>
            <tspan x="0" y="376" font-weight="700">CONTINUED ON PAGE 3, COL. 2</tspan>
          </text>
        </g>
        <line x1="284" y1="0" x2="284" y2="410" stroke="#e7e5e4" stroke-width="1"/>

        <!-- Column 3 (Right Column News) -->
        <g transform="translate(292, 0)">
          <text x="0" y="12" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#991b1b">
            FINANCIAL ROUNDUP
          </text>
          <text x="0" y="26" font-family="'Playfair Display', Georgia, serif" font-size="12" font-weight="700" fill="#1c1917">
            Central Bank Holds Rates
          </text>
          <text x="0" y="42" font-family="Georgia, serif" font-size="8.5" fill="#292524">
            <tspan x="0" y="42" font-weight="700">CAPITAL HILL — </tspan>
            <tspan>Citing steadying</tspan>
            <tspan x="0" y="54">grain and freight indices, the Monetary</tspan>
            <tspan x="0" y="66">Board voted unanimously to maintain</tspan>
            <tspan x="0" y="78">its base discount rate at 3.25 percent.</tspan>
            <tspan x="0" y="94">Industrial equity averages advanced</tspan>
            <tspan x="0" y="106">forty points within minutes of the noon</tspan>
            <tspan x="0" y="118">announcement, led by rail logistics.</tspan>
          </text>

          <line x1="0" y1="136" x2="116" y2="136" stroke="#d6d1c4" stroke-width="1"/>

          <text x="0" y="152" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#991b1b">
            PARKS &amp; CONSERVATION
          </text>
          <text x="0" y="166" font-family="'Playfair Display', Georgia, serif" font-size="12" font-weight="700" fill="#1c1917">
            Canopy Project Plantings
          </text>
          <text x="0" y="182" font-family="Georgia, serif" font-size="8.5" fill="#292524">
            <tspan x="0" y="182">Ten thousand native oak and maple</tspan>
            <tspan x="0" y="194">saplings were planted across the city's</tspan>
            <tspan x="0" y="206">eastern wards this weekend by three</tspan>
            <tspan x="0" y="218">thousand volunteer students.</tspan>
            <tspan x="0" y="234">The initiative aims to curb summer heat</tspan>
            <tspan x="0" y="246">islands in densely paved blocks.</tspan>
          </text>

          <line x1="0" y1="266" x2="116" y2="266" stroke="#d6d1c4" stroke-width="1"/>

          <text x="0" y="282" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#991b1b">
            LITERARY AWARDS
          </text>
          <text x="0" y="296" font-family="'Playfair Display', Georgia, serif" font-size="12" font-weight="700" fill="#1c1917">
            Poetry Medal Conferred
          </text>
          <text x="0" y="312" font-family="Georgia, serif" font-size="8.5" fill="#292524">
            <tspan x="0" y="312">The National Academy conferred its</tspan>
            <tspan x="0" y="324">Gold Laurel upon essayist Arthur Cole</tspan>
            <tspan x="0" y="336">for his meditative volume on river</tspan>
            <tspan x="0" y="348">navigation and maritime memory.</tspan>
            <tspan x="0" y="364" font-weight="700">REVIEW ON PAGE 8</tspan>
          </text>
        </g>
      </g>

      <!-- Bottom Folio Bar -->
      <line x1="36" y1="628" x2="444" y2="628" stroke="#1c1917" stroke-width="1"/>
      <text x="36" y="644" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917">
        THE MORNING CHRONICLE • WEDNESDAY, NOVEMBER 11, 2026
      </text>
      <text x="444" y="644" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917" text-anchor="end">
        PAGE 1
      </text>
      `,
    ),
  );

  // Pages 2-11: Varied broadsheet news, opinion, business, and arts
  for (let p = 2; p <= 11; p += 1) {
    const isOpinion = p === 4 || p === 5;
    const isMarkets = p === 6 || p === 7;
    const isArts = p === 8 || p === 9;
    const isSports = p === 10 || p === 11;

    const sectionTitle = isOpinion
      ? "OPINION & CIVIC DISPATCH"
      : isMarkets
        ? "COMMERCE, MARKETS & LABOUR"
        : isArts
          ? "CRITICISM, ESSAYS & CULTURE"
          : isSports
            ? "ATHLETICS & REGATTA CHRONICLE"
            : "METROPOLITAN & NATIONAL RECORD";

    pages.push(
      makeNewsPage(
        p,
        `
        <!-- Running head -->
        <text x="36" y="36" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#78716c">
          THE MORNING CHRONICLE
        </text>
        <text x="240" y="36" font-family="Georgia, serif" font-size="8" font-style="italic" fill="#57534e" text-anchor="middle">
          ${sectionTitle}
        </text>
        <text x="444" y="36" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#78716c" text-anchor="end">
          PAGE ${p}
        </text>
        <line x1="36" y1="44" x2="444" y2="44" stroke="#1c1917" stroke-width="1.2"/>

        <!-- Section Lead Banner -->
        <text x="36" y="74" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="800" fill="#1c1917">
          ${
            isOpinion
              ? "The Responsibility of Public Stewardship"
              : isMarkets
                ? "Global Supply Chains Shift Toward Coastal Hubs"
                : isArts
                  ? "Symphony Hall Reopens with Mahler's Second"
                  : isSports
                    ? "University Eight Victorious in Autumn Regatta"
                    : "Council Deliberates on Civic Library Funding"
          }
        </text>
        <line x1="36" y1="84" x2="444" y2="84" stroke="#d6d1c4" stroke-width="0.8"/>

        <!-- 3-Column Broadsheet Text -->
        <g transform="translate(36, 100)">
          <!-- Col 1 -->
          <g transform="translate(0, 0)">
            <text x="0" y="14" font-family="Georgia, serif" font-size="8.5" fill="#292524">
              <tspan x="0" y="14" font-weight="700">SPECIAL DISPATCH — </tspan>
              <tspan>Every generation</tspan>
              <tspan x="0" y="26">faces the necessity of evaluating what</tspan>
              <tspan x="0" y="38">institutions deserve preservation and what</tspan>
              <tspan x="0" y="50">customs demand reimagining.</tspan>
              <tspan x="0" y="66">In testimony yesterday before the budget</tspan>
              <tspan x="0" y="78">committee, advocates argued that public</tspan>
              <tspan x="0" y="90">libraries serve not merely as repositories</tspan>
              <tspan x="0" y="102">of printed books, but as civic anchors</tspan>
              <tspan x="0" y="114">where citizens of every background share</tspan>
              <tspan x="0" y="126">quiet study, internet connectivity,</tspan>
              <tspan x="0" y="138">and communal literacy instruction.</tspan>
              <tspan x="0" y="154">A proposed six percent capital expansion</tspan>
              <tspan x="0" y="166">would finance extended evening hours</tspan>
              <tspan x="0" y="178">across sixteen branch locations.</tspan>
            </text>
          </g>
          <line x1="130" y1="0" x2="130" y2="500" stroke="#e7e5e4" stroke-width="0.8"/>

          <!-- Col 2 -->
          <g transform="translate(138, 0)">
            <text x="0" y="14" font-family="Georgia, serif" font-size="8.5" fill="#292524">
              <tspan x="0" y="14">"To compromise our common reading</tspan>
              <tspan x="0" y="26">rooms is to levy a tax on curiosity,"</tspan>
              <tspan x="0" y="38">stated Chief Librarian Miriam Hallowell.</tspan>
              <tspan x="0" y="50">"Our circulation numbers have risen</tspan>
              <tspan x="0" y="62">twenty percent over pre-pandemic records,</tspan>
              <tspan x="0" y="74">proving that demand for tangible knowledge</tspan>
              <tspan x="0" y="86">remains robust in the digital epoch."</tspan>
              <tspan x="0" y="102">Surveys conducted across neighborhood</tspan>
              <tspan x="0" y="114">associations demonstrate overwhelming</tspan>
              <tspan x="0" y="126">backing for the measure, with eighty-two</tspan>
              <tspan x="0" y="138">percent of voters favoring the bond.</tspan>
            </text>

            <!-- Mid-column diagram box -->
            <rect x="0" y="160" width="128" height="130" fill="#eeebe2" stroke="#d6d1c4" rx="2"/>
            <text x="10" y="180" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#1c1917">
              STATISTICAL RECORD
            </text>
            <line x1="10" y1="186" x2="118" y2="186" stroke="#1c1917" stroke-width="0.8"/>
            <text x="10" y="204" font-family="Georgia, serif" font-size="7.5" fill="#44403c">Annual Circulation: 4.8M</text>
            <text x="10" y="222" font-family="Georgia, serif" font-size="7.5" fill="#44403c">Public Digital Terminals: 820</text>
            <text x="10" y="240" font-family="Georgia, serif" font-size="7.5" fill="#44403c">After-School Scholars: 14,200</text>
            <text x="10" y="258" font-family="Georgia, serif" font-size="7.5" fill="#44403c">Operating Budget: $24.2M</text>
          </g>
          <line x1="274" y1="0" x2="274" y2="500" stroke="#e7e5e4" stroke-width="0.8"/>

          <!-- Col 3 -->
          <g transform="translate(282, 0)">
            <text x="0" y="14" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#991b1b">
              REGIONAL DISPATCH
            </text>
            <text x="0" y="28" font-family="'Playfair Display', Georgia, serif" font-size="11" font-weight="700" fill="#1c1917">
              Historical Registry Approvals
            </text>
            <text x="0" y="44" font-family="Georgia, serif" font-size="8.5" fill="#292524">
              <tspan x="0" y="44">Four landmark masonry warehouses in</tspan>
              <tspan x="0" y="56">the canal basin were formally added</tspan>
              <tspan x="0" y="68">to the National Historic Registry today,</tspan>
              <tspan x="0" y="80">protecting their 1880s brick facades</tspan>
              <tspan x="0" y="92">from commercial demolition.</tspan>
              <tspan x="0" y="108">The sites will be repurposed into</tspan>
              <tspan x="0" y="120">affordable artisan studios, exhibition</tspan>
              <tspan x="0" y="132">halls, and a municipal food co-op.</tspan>
            </text>
          </g>
        </g>

        <!-- Bottom Folio Bar -->
        <line x1="36" y1="628" x2="444" y2="628" stroke="#1c1917" stroke-width="1"/>
        <text x="36" y="644" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917">
          THE MORNING CHRONICLE • ISSUE NO. 44,218
        </text>
        <text x="444" y="644" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917" text-anchor="end">
          PAGE ${p}
        </text>
        `,
      ),
    );
  }

  // Page 12: Back Page (Crossword Puzzle, Weather Map, Classifieds)
  pages.push(
    makeNewsPage(
      12,
      `
      <text x="36" y="36" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#78716c">
        THE MORNING CHRONICLE
      </text>
      <text x="240" y="36" font-family="Georgia, serif" font-size="8" font-style="italic" fill="#57534e" text-anchor="middle">
        DAILY CROSSWORD, WEATHER &amp; CLASSIFIED NOTICES
      </text>
      <text x="444" y="36" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#78716c" text-anchor="end">
        PAGE 12
      </text>
      <line x1="36" y1="44" x2="444" y2="44" stroke="#1c1917" stroke-width="1.2"/>

      <!-- Crossword Puzzle Grid (10x10 Authentic Vector Grid) -->
      <g transform="translate(36, 60)">
        <text x="0" y="16" font-family="'Playfair Display', Georgia, serif" font-size="16" font-weight="800" fill="#1c1917">
          The Daily Crossword • Puzzle No. 1,402
        </text>
        <text x="0" y="30" font-family="Georgia, serif" font-size="8" fill="#57534e">
          Edited by Arthur Vance • Solution printed in tomorrow's edition
        </text>

        <!-- 10x10 Grid -->
        <g transform="translate(0, 42)" stroke="#1c1917" stroke-width="1">
          ${Array.from({ length: 10 }, (_, r) =>
            Array.from({ length: 10 }, (_, c) => {
              const isBlack = (r + c * 2) % 5 === 0;
              return `<rect x="${c * 18}" y="${r * 18}" width="18" height="18" fill="${isBlack ? "#1c1917" : "#ffffff"}"/>`;
            }).join(""),
          ).join("")}
        </g>

        <!-- Clues List -->
        <g transform="translate(196, 42)">
          <text x="0" y="10" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#1c1917">
            ACROSS
          </text>
          <text x="0" y="24" font-family="Georgia, serif" font-size="7.5" fill="#292524">1. Architectural void (4)</text>
          <text x="0" y="36" font-family="Georgia, serif" font-size="7.5" fill="#292524">5. Broadsheet paper tone (5)</text>
          <text x="0" y="48" font-family="Georgia, serif" font-size="7.5" fill="#292524">8. Nautical bearing (7)</text>
          <text x="0" y="60" font-family="Georgia, serif" font-size="7.5" fill="#292524">11. Woodcut engraving mark (4)</text>

          <text x="0" y="84" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#1c1917">
            DOWN
          </text>
          <text x="0" y="98" font-family="Georgia, serif" font-size="7.5" fill="#292524">1. Ancient Greek portico (4)</text>
          <text x="0" y="110" font-family="Georgia, serif" font-size="7.5" fill="#292524">2. Typographic lead measure (4)</text>
          <text x="0" y="122" font-family="Georgia, serif" font-size="7.5" fill="#292524">3. Bookbinding spine edge (5)</text>
          <text x="0" y="134" font-family="Georgia, serif" font-size="7.5" fill="#292524">4. Printing press cylinder (6)</text>
        </g>
      </g>

      <!-- Weather Outlook Bar -->
      <g transform="translate(36, 310)">
        <rect width="408" height="70" fill="#eeebe2" stroke="#d6d1c4" rx="2"/>
        <text x="14" y="20" font-family="Helvetica, Arial, sans-serif" font-size="8" font-weight="700" fill="#1c1917">
          THREE-DAY REGIONAL WEATHER OUTLOOK
        </text>
        <line x1="14" y1="26" x2="394" y2="26" stroke="#d6d1c4" stroke-width="0.8"/>
        <text x="14" y="44" font-family="Georgia, serif" font-size="8" fill="#292524">
          THURSDAY: Overcast with morning coastal fog. High 58°F, Low 46°F.
        </text>
        <text x="14" y="58" font-family="Georgia, serif" font-size="8" fill="#292524">
          FRIDAY: Crisp autumn sunshine; winds from north at 10 knots. High 64°F, Low 42°F.
        </text>
      </g>

      <!-- Classified Notices -->
      <g transform="translate(36, 400)">
        <text x="0" y="14" font-family="'Playfair Display', Georgia, serif" font-size="14" font-weight="800" fill="#1c1917">
          Classified Announcements &amp; Legal Notices
        </text>
        <line x1="0" y1="22" x2="408" y2="22" stroke="#1c1917" stroke-width="0.8"/>

        <g transform="translate(0, 34)">
          <text x="0" y="10" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917">
            ESTATE AUCTION:
          </text>
          <text x="80" y="10" font-family="Georgia, serif" font-size="7.5" fill="#292524">
            Fine Victorian walnut secretaire, antique navigational sextants, 19th-century atlases.
          </text>

          <text x="0" y="26" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917">
            APPRENTICE:
          </text>
          <text x="80" y="26" font-family="Georgia, serif" font-size="7.5" fill="#292524">
            Established letterpress studio seeking dedicated press assistant. Knowledge of lead type required.
          </text>

          <text x="0" y="42" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917">
            MUNICIPAL:
          </text>
          <text x="80" y="42" font-family="Georgia, serif" font-size="7.5" fill="#292524">
            Public hearing concerning harbor canal dredge permits set for Monday next at Town Hall, 10 AM.
          </text>
        </g>
      </g>

      <!-- Bottom Postal Permit -->
      <line x1="36" y1="628" x2="444" y2="628" stroke="#1c1917" stroke-width="1"/>
      <text x="36" y="644" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#57534e">
        PERIODICALS POSTAGE PAID AT CAPITAL CITY • SUBSCRIPTION INQUIRIES: CIRCULATION@CHRONICLE.COM
      </text>
      <text x="444" y="644" font-family="Helvetica, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#1c1917" text-anchor="end">
        PAGE 12
      </text>
      `,
    ),
  );

  return pages;
}
