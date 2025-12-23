# ART Framework Marketing Site

This directory contains a marketing website for the ART Framework. The site is built with React, Vite, and Tailwind CSS, and targets non-technical business professionals.

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:4700` to see the site in development mode.

## 📦 Building for Production

```bash
pnpm build
```

The production build outputs to the `../docs` directory, making it ready for GitHub Pages deployment.

## 🎨 Features

- **Modern, visually stunning design** - High-tech aesthetic with sophisticated color palette
- **Scrollytelling experience** - Information unfolds dynamically as the user scrolls
- **Smooth animations** - Framer Motion powered transitions and hover effects
- **Fully responsive** - Works seamlessly on desktop, tablet, and mobile
- **Interactive elements** - Expandable use cases, personalized recommendations
- **SEO optimized** - Meta tags and semantic HTML structure

## 📁 Key Components

- `src/App.tsx` - Main application with hero section and navigation
- `src/components/` - Section components (WhatIsART, Architecture, Benefits, Features, UseCases, Personalized, CTA, Footer)
- `src/lib/data.ts` - Content data (features, use cases, benefits, industries)
- `src/lib/utils.ts` - Utility functions (className merging, scroll handling)

## 🌐 GitHub Pages Deployment

The site is configured to deploy to GitHub Pages using the `docs` folder as the source:

1. Build the site: `pnpm run build`
2. Commit and push to GitHub
3. Configure GitHub Pages to use the `docs/` folder as the source

## 🔧 Configuration

- **Vite config** - Outputs to `../docs` directory with `/ART/` base path
- **Tailwind CSS** - Custom utilities for gradients, glass cards, glow effects
- **Framer Motion** - Animations and scroll-based effects
- **TypeScript** - Type-safe development

## 📄 Documentation Links

The marketing site links to the existing technical documentation:

- API Reference: `/ART/components/`
- Concepts: `/ART/concepts/`
- How-To Guides: `/ART/how-to/`

## 🎯 Target Audience

This site is designed for **non-technical business professionals**, executives, and decision-makers who need to understand the value proposition of ART without deep technical details.

## 💡 Design Principles

1. **Simplify Complexity** - Abstract technical details, focus on outcomes
2. **Emphasize Value** - Every section answers "What's in it for my business?"
3. **Visual Storytelling** - Use animations and diagrams to make concepts accessible
4. **Action-Oriented** - Clear CTAs guide users toward next steps
