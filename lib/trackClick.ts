// Uses sendBeacon so the click is still recorded even if the browser
// navigates away or the tab closes immediately after — a plain fetch()
// can be aborted mid-flight by that navigation and silently lose the click.
export function trackClick(id: string) {
  const url = `/api/click/${id}`;
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
    if (sent) return;
  }
  fetch(url, { method: "POST", keepalive: true }).catch(() => {});
}
