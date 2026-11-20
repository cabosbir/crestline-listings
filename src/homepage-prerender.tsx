import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { type HelmetServerState } from "react-helmet-async";
import { AppContent } from "./App";

// Use the real homepage, so its readable HTML stays in sync with the browser.
// Live inventory still loads in the browser; no counts or listing data are frozen.
export function renderHomepage() {
  const context: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <StaticRouter location="/">
      <AppContent helmetContext={context} />
    </StaticRouter>,
  );
  if (!context.helmet) throw new Error("Homepage metadata was not rendered");
  return { html, head: context.helmet };
}
