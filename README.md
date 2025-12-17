# Offline CMS

A modern offline-first Content Management System built with React and TypeScript. Connect to GraphQL endpoints, work offline, and sync content when network connectivity returns. Features MDX editing and JSON project import/export.

## Features

- 🔄 **Offline-First** - Continue working even without internet connection
- 📡 **GraphQL Integration** - Sync with remote GraphQL endpoints when online
- 📝 **MDX Editor** - Rich text editing with markdown and JSX support
- 💾 **Local Storage** - Automatic local data persistence
- 📤 **JSON Export/Import** - Export and import projects as JSON files
- ⚡️ **Vite 6** - Lightning fast build tool
- ⚛️ **React 19** - Latest React with modern features
- 🔷 **TypeScript** - Type safety out of the box
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🚀 **SWC** - Super fast TypeScript/JSX compilation

## Quick Start

### Install dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Start development server
```bash
# Using Bun
bun dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view your app.

## Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build locally

## How It Works

### Offline Content Creation
1. Create and edit articles using the MDX editor
2. All content is automatically saved locally
3. Continue working even when offline

### GraphQL Synchronization
1. Configure your GraphQL endpoint
2. Content automatically syncs when network is available
3. Conflict resolution for concurrent edits

### Project Management
- Export projects as JSON files for backup or sharing
- Import JSON projects to restore content
- Local project storage with version history

## Project Structure

```
├── src/
│   ├── App.tsx         # Main React component
│   ├── main.tsx        # Application entry point
│   ├── lib/
│   │   └── utils.ts    # Utility functions
│   └── styles.css      # Component styles
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── tsconfig.node.json  # Node.js TypeScript config
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Configuration

### GraphQL Endpoint
Configure your GraphQL endpoint in the application settings to enable synchronization.

### MDX Editor
The built-in MDX editor supports:
- Markdown syntax
- JSX components
- Live preview
- Syntax highlighting

## Dependencies

### Core Dependencies
- **React 19** - UI framework
- **buildy-ui-editory** - MDX editor component
- **class-variance-authority** - Component variant utilities
- **lucide-react** - Icon library

### Development Dependencies
- **Vite 6** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **SWC** - Fast compilation

## License

MIT License - feel free to use this CMS for any project.

---

Built with ❤️ by [alexy-os](https://github.com/alexy-os)