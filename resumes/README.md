# Resumes

Three code-built, one-page A4 CVs that share one design: an aurora dither header band, white paper, midnight ink text, DM Sans and blue section headings and links. The general CV is served from `public/cv.pdf` at `/cv.pdf`, linked from the home and About pages. After rebuilding it, copy `Zaid Ali Ansari CV.pdf` to `public/cv.pdf` before deploying. The specialist CVs are not published.

| CV | PDF | Source |
| --- | --- | --- |
| General (product and video) | [PDF](Zaid%20Ali%20Ansari%20CV.pdf) | [cv.html](source/cv.html) |
| Developer | [PDF](Zaid%20Ali%20Ansari%20Developer%20CV.pdf) | [developer-cv.html](source/developer-cv.html) |
| Video Editor | [PDF](Zaid%20Ali%20Ansari%20Video%20Editor%20CV.pdf) | [video-editor-cv.html](source/video-editor-cv.html) |

## Editing

Change the wording in a CV's HTML source. Change the design for all of them in [source/cv.css](source/cv.css). Then rebuild every CV:

```
node scripts/build-cv.mjs
```

The script renders [source/cv-aurora.html](source/cv-aurora.html) to `source/cv-aurora.png`, which `cv.css` uses as the header background. It then prints each source to PDF with headless Edge or Chrome and writes a PNG preview of each to `source/`. The font is `source/fonts/dm-sans.woff2`, and the PDFs embed it. Set `CV_BROWSER` to a Chromium executable if neither Edge nor Chrome is found in the standard install paths.

## Content choices

- The general CV combines both: an internship at GitCafe, ZNS Enterprises, Work Smart Tutorials, all four projects and product, development and video skills.
- The Developer CV covers product work only: an internship at GitCafe (YC S26), ZNS Enterprises and Relay, Col, Emc² and Phaino. It has no video editing.
- The Video Editor CV covers editing only: Work Smart Tutorials (100+ reels, 1M+ cumulative views) and the ZNS Enterprises co-founder role. It has no web projects and no GitCafe contributions.
- The Developer CV describes directing AI coding agents, not independent hand-coding. TypeScript, C++ and Verse are listed as learning, not claimed proficiency.
- Skills list abilities, not the names of AI tools.
- The view and reel counts are applicant-reported, not independently audited analytics.
