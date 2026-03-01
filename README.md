# chkr.cc

Welcome to the **chkr.cc** frontend repository! This project is a modern, blazing-fast web application built with [Astro](https://astro.build) and [Bootstrap 5](https://getbootstrap.com). It serves as a credit card checker and validator, featuring a clean UI, API docs, and dynamic modals.

## 🚀 Built With
* **Framework:** [Astro](https://astro.build/) (Static Site Generation for extreme performance)
* **Styling:** Vanilla CSS & Bootstrap 5
* **Icons:** [Feather Icons](https://feathericons.com/)

## 📂 Project Structure

```text
/
├── public/                 # Static assets (fonts, images, raw CSS)
│   └── assets/             
│       ├── css/style.css   # Main stylesheet (including legacy overrides)
│       └── fonts/          # Self-hosted Montserrat & Poppins
├── src/
│   ├── components/         # Reusable UI sections (Hero, Features, Modals)
│   ├── layouts/            # Base HTML wrapper (BaseLayout.astro)
│   ├── pages/              # Routing (index.astro)
│   └── scripts/            # Vanilla JS logic (main.js, generator.js)
└── astro.config.mjs        # Astro configuration
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## ⚡ Recent Upgrades
The application was recently migrated from a legacy jQuery/HTML template to Astro. This migration completely stripped out jQuery in favor of Vanilla JS, self-hosted the Google Fonts, optimized the asset delivery pipeline, and restructured the layout into component-based architecture while fully preserving the original legacy design aesthetics.
