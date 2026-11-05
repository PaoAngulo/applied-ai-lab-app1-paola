# SalesPulse Architecture

## Overview

SalesPulse is an interactive revenue analytics dashboard designed for sales leaders and financial executives to analyze quarterly sales performance across geographic regions and identify key drivers of quarter-over-quarter revenue variance, with a focused emphasis on Q2 to Q3 performance shifts. Users can upload raw sales transaction CSV files or explore built-in benchmark datasets to instantly evaluate revenue trajectories, regional performance comparisons, unit sales volumes, discount rate fluctuations, and sales channel dynamics, accompanied by concise, strictly grounded AI executive summaries powered by Google Gemini.

## File Directory & Responsibilities

| File Path | Description |
| :--- | :--- |
| `/.env.example` | Provides an environment variable template specifying configuration keys such as server port and Gemini API credentials. |
| `/.gitignore` | Specifies files and build directories that version control should omit from tracking. |
| `/bun.lock` | Contains locked dependency versions recorded from the Bun package manager. |
| `/index.html` | Serves as the web entry point that loads the application scripts, responsive viewport tags, and page metadata into the user's browser. |
| `/metadata.json` | Specifies the AI Studio project settings, runtime metadata, and server-side capability permissions. |
| `/package.json` | Defines the project dependencies, execution scripts, and runtime commands for both client bundling and server hosting. |
| `/server.ts` | Hosts the Node.js Express server to deliver frontend assets, serve proxy routes, and generate Gemini executive summaries using server-side API keys. |
| `/src/App.tsx` | Serves as the central user interface component, orchestrating file ingestion, sales calculations, and the visual dashboard layout. |
| `/src/components/AiSummaryCard.tsx` | Presents an automated three-sentence executive brief detailing the region experiencing the largest Q2 to Q3 shift along with its underlying revenue drivers. |
| `/src/components/CalculatedDriversBridge.tsx` | Renders a visual driver analysis breakdown illustrating how unit volume, discount rates, product mix, and sales channels contributed to quarterly variance. |
| `/src/components/CsvUploader.tsx` | Provides an intuitive drag-and-drop file upload interface that allows users to import custom sales CSV files or launch a demo dataset. |
| `/src/components/Header.tsx` | Displays the top navigation bar containing application branding, active dataset statistics, sample data triggers, and clear/reset actions. |
| `/src/components/RawDataDrawer.tsx` | Provides an expandable side drawer allowing users to inspect, filter, and audit individual raw sales order records. |
| `/src/components/RevenueChart.tsx` | Renders an interactive bar visualization comparing quarterly revenue trends across geographic sales regions. |
| `/src/components/RevenueTable.tsx` | Formats a comprehensive tabular summary comparing quarterly revenue, dollar movements, and percentage growth by region. |
| `/src/index.css` | Defines the application-wide styles and imports the Tailwind CSS design framework. |
| `/src/main.tsx` | Initializes and attaches the React application tree to the document object model in the web browser. |
| `/src/types/sales.ts` | Defines the TypeScript data structures and interfaces for sales transactions, aggregated metrics, and quarterly performance figures. |
| `/src/utils/csvParser.ts` | Parses and validates raw CSV file contents into structured sales order objects and generates sample quarterly sales datasets. |
| `/src/utils/salesCalculator.ts` | Executes financial algorithms to calculate regional revenues, quarter-over-quarter deltas, volume changes, product distributions, and average discount percentages. |
| `/tsconfig.json` | Configures the TypeScript compiler rules, module resolutions, and strict type-checking parameters. |
| `/vite.config.ts` | Specifies Vite build configuration, React compilation plugins, path aliases, and development server settings. |
| `/ARCHITECTURE.md` | Documents the business purpose, system capabilities, and structural organization of every file in the project. |
