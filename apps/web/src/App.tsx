import { useRef, useState } from "react";
import { formatPageLabel } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "@plif/reader";
import { sampleManifest } from "./sample";

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const [index, setIndex] = useState(0);
  const total = sampleManifest.pages.length;

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", gap: 16 }}>
      <Flipbook ref={book} manifest={sampleManifest} onPageChange={setIndex} />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => book.current?.prev()}>Previous</button>
        <span>{formatPageLabel(index, total, sampleManifest.hasCover, false)}</span>
        <button onClick={() => book.current?.next()}>Next</button>
      </div>
    </main>
  );
}
