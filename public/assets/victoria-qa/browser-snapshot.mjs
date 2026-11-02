/**
 * Read-only DOM observation. This function is intentionally self contained so a
 * host can pass it to its authorized integrated-browser evaluate API. It never
 * starts a browser, reads application stores, changes state, or claims review.
 */
export function collectDOMSnapshot(request) {
  const errors = [];
  const context = request?.context ?? {};
  const finite = Number.isFinite;
  const rect = r => ({ x: r.x ?? r.left, y: r.y ?? r.top, width: r.width, height: r.height });
  const intersect = (a, b) => {
    const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
    return { x, y, width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x), height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y) };
  };
  const one = (selector, issues) => {
    if (typeof selector !== 'string' || !selector.trim()) { issues.push('Target selector is required'); return null; }
    try {
      const found = document.querySelectorAll(selector);
      if (found.length !== 1) { issues.push(`${selector}: expected one target, found ${found.length}`); return null; }
      return found[0];
    } catch { issues.push(`${selector}: invalid selector`); return null; }
  };
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const viewportRect = { x: 0, y: 0, ...viewport };
  const matrix = style => {
    if (style.transform === 'none' || !style.transform) return [1, 0, 0, 1, 0, 0];
    // Computed CSS serializes to matrix()/matrix3d(). DOMMatrix constructors are
    // not exposed by the integrated browser's read-only DOM scope.
    const match = style.transform.match(/^(matrix|matrix3d)\(([^)]+)\)$/);
    if (!match) return null;
    const values = match[2].split(',').map(v => Number(v.trim()));
    if (!values.every(Number.isFinite)) return null;
    if (match[1] === 'matrix' && values.length === 6) return values;
    if (values.length === 16 && [2,3,6,7,8,9,11,14].every(i => values[i] === 0) && values[10] === 1 && values[15] === 1) return [values[0],values[1],values[4],values[5],values[12],values[13]];
    return null;
  };
  const cssSelector = el => {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    for (let node = el; node?.nodeType === 1; node = node.parentElement) {
      const tag = node.localName;
      const peers = node.parentElement ? [...node.parentElement.children].filter(n => n.localName === tag) : [node];
      parts.unshift(`${tag}:nth-of-type(${peers.indexOf(node) + 1})`);
    }
    return parts.join(' > ');
  };
  const observeBox = el => {
    const box = rect(el.getBoundingClientRect());
    let clipped = intersect(box, viewportRect), opacity = 1, hidden = false;
    const clipping = [], unsupportedVisibility = [], transforms = [];
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= Number(style.opacity || 1);
      if (style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility) || style.contentVisibility === 'hidden' || node.hidden) hidden = true;
      if (style.transform && style.transform !== 'none') transforms.push({ selector: cssSelector(node), matrix: matrix(style), css: style.transform });
      if (node !== el && /(hidden|clip|scroll|auto)/.test(`${style.overflowX} ${style.overflowY}`)) {
        const nr = rect(node.getBoundingClientRect());
        const clipX = /(hidden|clip|scroll|auto)/.test(style.overflowX);
        const clipY = /(hidden|clip|scroll|auto)/.test(style.overflowY);
        // client borders and scrollbars are excluded; transformed clipping is
        // not reduced to a misleading axis-aligned visibility claim.
        if (style.transform && style.transform !== 'none') unsupportedVisibility.push(`${cssSelector(node)}: transformed overflow clip`);
        const clip = { x: clipX ? nr.x + (node.clientLeft || 0) : clipped.x, y: clipY ? nr.y + (node.clientTop || 0) : clipped.y, width: clipX ? node.clientWidth : clipped.width, height: clipY ? node.clientHeight : clipped.height };
        clipping.push({ selector: cssSelector(node), box: clip });
        clipped = intersect(clipped, clip);
      }
      if (node !== el && ((style.clipPath && style.clipPath !== 'none') || (style.maskImage && style.maskImage !== 'none'))) unsupportedVisibility.push(`${cssSelector(node)}: ancestor clip/mask needs pixel inspection`);
    }
    if (!finite(opacity)) { unsupportedVisibility.push('Invalid effective opacity'); opacity = 0; }
    const area = box.width * box.height;
    return { box, clippedBox: clipped, effectiveOpacity: opacity, visibleRatio: hidden || area <= 0 ? 0 : clipped.width * clipped.height / area, viewportArea: area / (viewport.width * viewport.height), visible: !hidden && opacity > 0 && clipped.width > 0 && clipped.height > 0, clipping, unsupportedVisibility, transforms };
  };
  const sizeOf = el => {
    const style = getComputedStyle(el);
    let width = Number.parseFloat(style.width), height = Number.parseFloat(style.height);
    if (style.boxSizing !== 'border-box') {
      width += ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce((s, k) => s + (Number.parseFloat(style[k]) || 0), 0);
      height += ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((s, k) => s + (Number.parseFloat(style[k]) || 0), 0);
    }
    return [finite(width) && width > 0 ? width : el.offsetWidth, finite(height) && height > 0 ? height : el.offsetHeight];
  };
  const localToViewport = (el, points, issues) => {
    const size = sizeOf(el), box = rect(el.getBoundingClientRect());
    if (!size.every(n => finite(n) && n > 0)) { issues.push('No measurable border box'); return null; }
    // The combined linear matrix and observed extent recover the 2D affine
    // origin without guessing layout offsets or transform-origin values.
    let combined = [1, 0, 0, 1];
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node), m = matrix(style);
      if (!m || [style.translate, style.rotate, style.scale].some(v => v && v !== 'none') || (style.zoom && !['1', 'normal'].includes(style.zoom))) {
        issues.push('Clip adapter requires 2D transforms without individual transforms/zoom'); return null;
      }
      const [a, b, c, d] = combined;
      combined = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d];
    }
    const [a, b, c, d] = combined, [w, h] = size;
    const ox = box.x - Math.min(0, a * w, c * h, a * w + c * h);
    const oy = box.y - Math.min(0, b * w, d * h, b * w + d * h);
    return points.map(([x, y]) => [ox + a * x + c * y, oy + b * x + d * y]);
  };
  const clipPoints = (el, issues) => {
    const value = getComputedStyle(el).clipPath;
    const [w, h] = sizeOf(el);
    const length = (v, axis) => /^-?(?:\d+\.?\d*|\.\d+)(px|%)?$/.test(v) ? Number.parseFloat(v) * (v.endsWith('%') ? axis / 100 : 1) : NaN;
    const shape = value?.match(/^(inset|circle|ellipse|polygon)\((.*)\)$/);
    if (!shape) { issues.push(`Unsupported clip-path: ${value || 'none'}`); return null; }
    let points;
    if (shape[1] === 'inset') {
      if (/\bround\b/.test(shape[2])) { issues.push('Rounded inset contour needs an SVG/point adapter'); return null; }
      const tokens = shape[2].trim().split(/\s+/);
      if (tokens.length < 1 || tokens.length > 4) { issues.push('Invalid inset contour'); return null; }
      const sides = [tokens[0], tokens[1] ?? tokens[0], tokens[2] ?? tokens[0], tokens[3] ?? tokens[1] ?? tokens[0]].map((v, i) => length(v, i % 2 ? w : h));
      const [top, right, bottom, left] = sides;
      points = [[left, top], [w - right, top], [w - right, h - bottom], [left, h - bottom]];
    } else if (shape[1] === 'polygon') {
      if (/^(evenodd|nonzero),/.test(shape[2])) { issues.push('Polygon fill-rule adapter unsupported'); return null; }
      points = shape[2].split(',').map(pair => { const p = pair.trim().split(/\s+/); return [length(p[0] || '', w), length(p[1] || '', h)]; });
    } else {
      const parts = shape[2].split(/\s+at\s+/), radii = parts[0].trim().split(/\s+/), center = (parts[1] ?? '50% 50%').trim().split(/\s+/);
      const cx = length(center[0] || '', w), cy = length(center[1] || '', h);
      const rx = length(radii[0] || '', shape[1] === 'circle' ? Math.hypot(w, h) / Math.SQRT2 : w);
      const ry = shape[1] === 'circle' ? rx : length(radii[1] || '', h);
      points = Array.from({ length: 16 }, (_, i) => [cx + rx * Math.cos(i * Math.PI / 8), cy + ry * Math.sin(i * Math.PI / 8)]);
    }
    if (points.length < 3 || points.some(p => !p.every(finite))) { issues.push('Clip contour contains unsupported units or shape values'); return null; }
    return localToViewport(el, points, issues);
  };
  const geometryPoints = (el, count, issues) => {
    if (typeof el.getTotalLength !== 'function' || typeof el.getPointAtLength !== 'function' || typeof el.getScreenCTM !== 'function') { issues.push('SVG adapter requires a rendered SVG geometry element'); return null; }
    const length = el.getTotalLength(), m = el.getScreenCTM();
    if (!finite(length) || length <= 0 || !m) { issues.push('SVG contour is not measurable'); return null; }
    return Array.from({ length: count }, (_, i) => {
      const p = el.getPointAtLength(length * i / (count - 1));
      return [m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f];
    });
  };
  const neutralize = (el, points, referenceSelector, issues) => {
    const reference = one(referenceSelector, issues);
    if (!reference || reference === el || !reference.contains(el)) { issues.push('Point adapters require a distinct referenceSelector ancestor'); return null; }
    for (let node = reference; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if ((style.transform && style.transform !== 'none') || [style.rotate, style.translate, style.scale].some(v => v && v !== 'none')) { issues.push('Reference anchor ancestry must be untransformed'); return null; }
    }
    const box = rect(reference.getBoundingClientRect());
    return { points: points.map(([x, y]) => [x - box.x, y - box.y]), neutralization: { method: 'reference-anchor', selector: referenceSelector, rect: [box.x, box.y, box.width, box.height], matrix: [1, 0, 0, 1, 0, 0] } };
  };
  const clockSource = request.clockSource !== 'epoch' && typeof performance !== 'undefined' && typeof performance.now === 'function' ? 'performance' : 'epoch';
  const t = clockSource === 'performance' ? performance.now() : Date.now();
  const capturedAt = new Date().toISOString();
  const targets = [];
  if (!Array.isArray(request?.targets) || !request.targets.length) errors.push('At least one declared target is required');
  for (const target of request?.targets ?? []) {
    const issues = [], el = one(target.selector, issues), measurement = target.measurement ?? 'transform2d';
    if (!el) { targets.push({ ...target, supported: false, errors: issues }); continue; }
    const observed = observeBox(el), style = getComputedStyle(el);
    const container = target.scrollContainer && target.scrollContainer !== 'window' ? one(target.scrollContainer, issues) : null;
    const scrollOffset = container ? container.scrollTop : window.scrollY;
    const frame = { t, scrollOffset, scrollY: window.scrollY, scrollX: window.scrollX, phase: request.phase ?? null, progress: null, visibleRatio: observed.visibleRatio, opacity: observed.effectiveOpacity, viewportArea: observed.viewportArea, hovered: el.matches(':hover'), box: observed.box, clippedBox: observed.clippedBox, visible: observed.visible, size: sizeOf(el), matrix: matrix(style), clipping: observed.clipping, ancestorTransforms: observed.transforms };
    if (target.progressRange) {
      const { start, end } = target.progressRange;
      if (![start, end].every(finite) || end <= start) issues.push('progressRange must have measured start < end');
      else { frame.progress = Math.max(0, Math.min(1, (scrollOffset - start) / (end - start))); frame.progressRange = { start, end, basis: 'declared-scroll-range' }; }
    }
    let points;
    if (measurement === 'transform2d') {
      if (!frame.matrix || !frame.size.every(finite)) issues.push('Local 2D transform/size unavailable');
      if ([style.rotate, style.translate, style.scale].some(v => v && v !== 'none')) issues.push('Individual CSS transforms require a projected point adapter');
      for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor), m = matrix(ancestorStyle);
        if (!m || m.slice(0, 4).some((v, i) => Math.abs(v - [1, 0, 0, 1][i]) > 0.0001) || [ancestorStyle.rotate, ancestorStyle.translate, ancestorStyle.scale].some(v => v && v !== 'none') || (ancestorStyle.zoom && !['1', 'normal'].includes(ancestorStyle.zoom))) {
          issues.push('Scaled/rotated/3D ancestry requires projected points for screen-space motion'); break;
        }
      }
    } else if (measurement === 'clip') points = clipPoints(el, issues);
    else if (measurement === 'svg' || (measurement === 'mask' && target.geometrySelector)) {
      const geometry = target.geometrySelector ? one(target.geometrySelector, issues) : el;
      if (geometry) points = geometryPoints(geometry, 16, issues);
    } else if (['projected3d', 'mask'].includes(measurement) && Array.isArray(target.pointSelectors) && target.pointSelectors.length >= 3) {
      const markerElements = new Set();
      if (new Set(target.pointSelectors).size!==target.pointSelectors.length) issues.push('Contour marker selectors must be distinct');
      points = target.pointSelectors.map(selector => {
        const point = one(selector, issues);
        if (!point || !el.contains(point)) { issues.push(`${selector}: contour marker must belong to target`); return [NaN, NaN]; }
        if (markerElements.has(point)) issues.push(`${selector}: contour markers must resolve to distinct actual elements`);
        markerElements.add(point);
        const r = point.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
      frame.pointSelectors = [...target.pointSelectors];
    } else issues.push(`Unsupported ${measurement} adapter; raster/gradient masks require actual contour markers or a rendered SVG geometry adapter`);
    if (points) {
      const result = neutralize(el, points, target.referenceSelector, issues);
      if (result) Object.assign(frame, result);
    }
    issues.push(...observed.unsupportedVisibility);
    if (!observed.visible || observed.effectiveOpacity < 0.2 || observed.visibleRatio < 0.25) issues.push('Target is not sufficiently visible for motion evidence');
    targets.push({ id: target.id, selector: target.selector, sceneId: target.sceneId ?? null, measurement, scrollContainer: target.scrollContainer ?? 'window', coordinateSpace: 'scroll-neutral-viewport', supported: issues.length === 0, frame, errors: issues });
  }
  const headings = [];
  for (const selector of request?.headingSelectors ?? []) {
    const issues = [], el = one(selector, issues);
    if (!el) { errors.push(...issues); continue; }
    const preceding = [];
    for (let node = el.previousElementSibling; node; node = node.previousElementSibling) {
      const content = node.textContent?.trim(), observed = observeBox(node);
      if (content && observed.visible && observed.box.y + observed.box.height <= el.getBoundingClientRect().top + 2) preceding.unshift({ selector: cssSelector(node), text: content.slice(0, 500), box: observed.box });
    }
    headings.push({ selector, text: el.textContent?.trim() ?? '', level: /^h[1-6]$/.test(el.localName) ? Number(el.localName[1]) : null, box: rect(el.getBoundingClientRect()), prelabels: preceding });
  }
  const geometry = [];
  for (const selector of request?.geometrySelectors ?? []) {
    const issues = [], el = one(selector, issues);
    if (!el) { errors.push(...issues); continue; }
    const range = document.createRange();
    range.selectNodeContents(el);
    const textRects = [...range.getClientRects()].map(rect).filter(r => r.width > 0 && r.height > 0);
    geometry.push({ selector, text: el.textContent?.trim().slice(0, 500) ?? '', ...observeBox(el), textRects, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, fontFamily: getComputedStyle(el).fontFamily, fontSize: getComputedStyle(el).fontSize, lineHeight: getComputedStyle(el).lineHeight });
  }
  const collisions = [];
  for (let i = 0; i < geometry.length; i++) for (let j = 0; j < i; j++) {
    const a = geometry[i], b = geometry[j];
    const overlap = intersect(a.box, b.box);
    if (a.visible && b.visible && overlap.width > 1 && overlap.height > 1) collisions.push({ selectors: [a.selector, b.selector], overlap, status: 'candidate-needs-review' });
  }
  return { schemaVersion: 1, context, observedUrl: location.href, capturedAt, t, clockSource, phase:request.phase ?? null, viewport, usableViewport:[0,0,viewport.width,viewport.height], horizontalOverflow:Math.max(0,(document.documentElement?.scrollWidth ?? viewport.width)-viewport.width), devicePixelRatio: window.devicePixelRatio, scroll: { x: window.scrollX, y: window.scrollY }, documentVisibility: document.visibilityState, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, fontsStatus: document.fonts?.status ?? 'unavailable', targets, headings, geometry, collisions, errors };
}

/** For browser providers that accept a serialized, read-only expression. */
export function buildCollectorExpression(request) {
  return `(${collectDOMSnapshot.toString()})(${JSON.stringify(request)})`;
}
