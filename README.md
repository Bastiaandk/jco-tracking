# jco-tracking

Lead-source tracking for the Kajabi site (UTM, referrer, gclid, hashed e-mail for the ChatGPT pixel).

- `jco-forms.js` — the script. Served by GitHub Pages at
  `https://bastiaandk.github.io/jco-tracking/jco-forms.js`. A push is live within about 10 minutes.
- `kajabi-header.html` — the block that sits in Kajabi's Header Code, pasted once. The `<style>` stays
  inline so the hidden fields never flash; only the script is external.

## Rules
- Keep the script tag **below** the ChatGPT pixel (`oaiq init`) and `jcoWhenGranted` in the header.
- Keep `defer` on the script tag.
- Every push goes live for all visitors: check `node --check jco-forms.js` before pushing.
- Bump the version line at the top of `jco-forms.js` with each change.
