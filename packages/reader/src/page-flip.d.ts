declare module "page-flip" {
  export interface PageInstance {
    setDensity(density: "hard" | "soft"): void;
  }

  export interface FlipEvent {
    data: unknown;
  }

  export class PageFlip {
    constructor(element: HTMLElement, setting?: object);
    destroy(): void;
    loadFromImages(imagesHref: string[]): void;
    flipNext(): void;
    flipPrev(): void;
    flip(page: number): void;
    getPage(pageIndex: number): PageInstance | null | undefined;
    on(event: string, callback: (e: FlipEvent) => void): PageFlip;
  }
}
