// Conservative endpoint check for the app's RGB gradients and translucent layers.
// It is a bounded rendered-text audit, not a full accessibility certification.
export function auditTextContrast() {
  const rgb = (value) => {
    const parts = value.match(/[\d.]+/g)?.map(Number);
    return parts?.length >= 3
      ? [...parts.slice(0, 3), parts[3] ?? 1]
      : [0, 0, 0, 0];
  };
  const over = (front, back) =>
    front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3]));
  const luminance = (color) =>
    color
      .slice(0, 3)
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const backgrounds = (el) => {
    const chain = [];
    for (let parent = el; parent; parent = parent.parentElement)
      chain.unshift(parent);
    let samples = [[255, 255, 255]];
    for (const layer of chain) {
      const style = getComputedStyle(layer);
      const base = rgb(style.backgroundColor);
      samples = samples.map((sample) => over(base, sample));
      const stops = style.backgroundImage.match(/rgba?\([^)]+\)/g)?.map(rgb);
      if (stops)
        samples = samples.flatMap((sample) =>
          stops.map((stop) => over(stop, sample)),
        );
      samples = [
        ...new Map(
          samples.map((sample) => [
            sample.map((v) => v.toFixed(2)).join(),
            sample,
          ]),
        ).values(),
      ].slice(0, 128);
    }
    return samples;
  };
  return [...document.querySelectorAll("main *, .nav-link")]
    .filter(
      (el) =>
        el.namespaceURI === "http://www.w3.org/1999/xhtml" &&
        el.getClientRects().length &&
        getComputedStyle(el).visibility !== "hidden" &&
        !el.disabled &&
        (el.matches("input:not([type=checkbox]), select") ||
          [...el.childNodes].some(
            (node) =>
              node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
          )),
    )
    .flatMap((el) => {
      const style = getComputedStyle(el);
      const foreground = rgb(style.color);
      const ratio = Math.min(
        ...backgrounds(el).map((background) => {
          const a = luminance(over(foreground, background)),
            b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        }),
      );
      const large =
        parseFloat(style.fontSize) >= 24 ||
        (parseFloat(style.fontSize) >= 18.67 &&
          Number(style.fontWeight) >= 700);
      return ratio + 0.01 < (large ? 3 : 4.5)
        ? [
            {
              text: (el.textContent || el.getAttribute("aria-label") || el.type)
                .trim()
                .slice(0, 90),
              class: el.className,
              ratio: Number(ratio.toFixed(2)),
            },
          ]
        : [];
    });
}
