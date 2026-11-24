# JCO tracking

This repository contains the lead-source tracker for the Kajabi site
https://jiffycoursesonline.com. Read `README.md`, `jco-forms.js`, and
`kajabi-header.html` before working on it.

## Context

- `jco-forms.js` is the vanilla JavaScript tracker. It stores
  UTMs or a referrer-derived source in the `jco_src` cookie, stores `gclid` in
  `jco_gclid`, and hashes email addresses with SHA-256 for the ChatGPT pixel.
  It fills the hidden Kajabi fields "Lead source" (`custom_50`) and
  "Google click ID" (`custom_51`), and adds the form page to the lead source.
- The tracker runs through `window.jcoWhenGranted`; in Europe it runs only
  after consent is accepted.
- `kajabi-header.html` is the block for Kajabi > Settings > Site Details >
  Header Code. Its CSS stays inline to prevent hidden fields from flashing.
  Its deferred script loads
  `https://bastiaandk.github.io/jco-tracking/jco-forms.js`. Place the block
  below the ChatGPT pixel (`oaiq init`) and `jcoWhenGranted`.

## Deployment status

At the time this file was created, the user reported that the public GitHub
repository and GitHub Pages still needed to be set up. The local repository
had one commit on `main` and `origin` pointed to
https://github.com/Bastiaandk/jco-tracking.git. The user will create the
public repository themselves; the `gh` CLI is not installed.

Remaining steps: push the repository, enable GitHub Pages from `main` / root,
verify that the script URL serves the script, and only then replace the old
inline block in Kajabi. Verify the current status before assuming these steps
are still outstanding.

## Working agreements

- Chat in Dutch; write code, comments, and commit messages in English.
- Give advice first. Do not change code until the user says "ga".
- Every push can go live for all visitors within about 10 minutes. Before
  every push, run `node --check jco-forms.js` and bump the version line at
  the top of the script.
- Keep the implementation small and fast, using plain vanilla JavaScript
  without frameworks.
