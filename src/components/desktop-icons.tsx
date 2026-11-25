// Pixel-style 1-bit glyphs for the desktop icon dock: filled squares on a
// 16x16 grid, rendered at 20px with crisp edges.
type IconProps = { size?: number };

function Glyph({ size = 20, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconMe() {
  return (
    <Glyph>
      <rect x="6" y="2" width="4" height="4" />
      <rect x="4" y="7" width="8" height="7" />
    </Glyph>
  );
}

export function IconWork() {
  return (
    <Glyph>
      <rect x="6" y="2" width="4" height="3" />
      <rect x="2" y="5" width="12" height="9" />
      <rect x="4" y="8" width="8" height="1" fill="#02070A" />
    </Glyph>
  );
}

export function IconWebDev() {
  return (
    <Glyph>
      {/* < */}
      <rect x="1" y="7" width="2" height="2" />
      <rect x="3" y="5" width="2" height="2" />
      <rect x="3" y="9" width="2" height="2" />
      {/* / */}
      <rect x="8" y="4" width="2" height="2" />
      <rect x="7" y="6" width="2" height="2" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="5" y="10" width="2" height="2" />
      {/* > */}
      <rect x="13" y="7" width="2" height="2" />
      <rect x="11" y="5" width="2" height="2" />
      <rect x="11" y="9" width="2" height="2" />
    </Glyph>
  );
}

export function IconVideos() {
  return (
    <Glyph>
      <rect x="4" y="3" width="2" height="2" />
      <rect x="4" y="5" width="4" height="2" />
      <rect x="4" y="7" width="6" height="2" />
      <rect x="4" y="9" width="4" height="2" />
      <rect x="4" y="11" width="2" height="2" />
    </Glyph>
  );
}

export function IconBlog() {
  return (
    <Glyph>
      {/* pencil: stepped shaft, tip at bottom-left, eraser top-right */}
      <rect x="11" y="2" width="3" height="3" />
      <rect x="9" y="4" width="2" height="2" />
      <rect x="7" y="6" width="2" height="2" />
      <rect x="5" y="8" width="2" height="2" />
      <rect x="3" y="10" width="2" height="2" />
      <rect x="2" y="12" width="3" height="3" />
    </Glyph>
  );
}

export function IconContact() {
  return (
    <Glyph>
      {/* envelope frame */}
      <rect x="2" y="4" width="12" height="1" />
      <rect x="2" y="12" width="12" height="1" />
      <rect x="2" y="4" width="1" height="9" />
      <rect x="13" y="4" width="1" height="9" />
      {/* flap */}
      <rect x="4" y="6" width="2" height="1" />
      <rect x="6" y="7" width="4" height="1" />
      <rect x="10" y="6" width="2" height="1" />
    </Glyph>
  );
}

export function IconGithub() {
  return (
    <Glyph>
      {/* octocat head: pointed ears, rounded head block, eye gaps */}
      <rect x="2" y="1" width="3" height="3" />
      <rect x="11" y="1" width="3" height="3" />
      <rect x="3" y="4" width="10" height="9" />
      <rect x="5" y="13" width="6" height="2" />
      <rect x="5" y="7" width="2" height="2" fill="#02070A" />
      <rect x="9" y="7" width="2" height="2" fill="#02070A" />
    </Glyph>
  );
}

export function IconResume() {
  return (
    <Glyph>
      {/* document outline with folded corner */}
      <rect x="4" y="1" width="7" height="1" />
      <rect x="4" y="1" width="1" height="14" />
      <rect x="4" y="14" width="9" height="1" />
      <rect x="12" y="4" width="1" height="10" />
      <rect x="11" y="2" width="1" height="1" />
      <rect x="10" y="3" width="1" height="1" />
      <rect x="10" y="4" width="1" height="1" />
      {/* text lines */}
      <rect x="6" y="6" width="5" height="1" />
      <rect x="6" y="9" width="5" height="1" />
      <rect x="6" y="12" width="5" height="1" />
    </Glyph>
  );
}
