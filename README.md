# 🎨 StyleScape

**Generate stunning, procedural background patterns with one-click export to CSS, Tailwind, React, Vue, and more.**

![StyleScape Preview](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.16-blue) ![Zustand](https://img.shields.io/badge/Zustand-5.0.8-orange)

## ✨ Features

- **1000+ Procedural Patterns**: Algorithmically generated backgrounds across multiple categories
- **One-Click Export**: Export to CSS, Tailwind CSS, React, Vue, Svelte, SVG, PNG
- **Pattern Mixer**: Combine multiple patterns with blend modes
- **Batch Export**: Download multiple patterns at once
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Favorites System**: Save and organize your favorite patterns
- **User-Created Patterns**: Mix and save your own custom patterns
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Themes**: Automatic theme detection based on background

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/chandrakantdubey/style-scape.git
cd style-scape

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

### Basic Pattern Generation

1. **Browse Patterns**: Explore the pattern library with categories like Gradients, Geometric, Waves, etc.
2. **Search & Filter**: Use the search bar or category/theme filters to find specific patterns
3. **Preview**: Click any pattern to preview it as your background
4. **Export**: Click "View Details" to access export options

### Creating Custom Patterns

1. **Generator**: Visit `/generator` to create patterns from scratch
2. **Mixer**: Go to `/mixer` to combine multiple patterns
3. **Save**: Your mixed patterns are automatically saved to "User Created" category

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` + `Shift` | Show keyboard shortcuts |
| `/` | Focus search |
| `G` | Open generator |
| `M` | Open pattern mixer |
| `L` | View library |
| `F` | Toggle favorite |
| `E` | Export pattern |
| `C` | Copy CSS code |
| `T` | Copy Tailwind code |
| `Space` | Preview pattern |
| `Ctrl+S` | Save pattern |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Esc` | Close modal/dialog |
| `← →` | Navigate patterns |
| `↑ ↓` | Navigate categories |

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── HelpWidget.tsx   # Keyboard shortcuts help modal
│   └── Icons.tsx        # Icon components
├── pages/               # Page components
│   ├── HomePage.tsx     # Main pattern library
│   ├── GeneratorPage.tsx# Pattern generator
│   ├── MixerPage.tsx    # Pattern mixer
│   └── ...
├── state/               # State management
│   ├── store.ts         # Zustand store
│   └── types.ts         # TypeScript interfaces
├── hooks/               # Custom React hooks
│   ├── useFavorites.ts  # Favorites management
│   └── useKeyboardShortcuts.ts # Keyboard shortcuts
├── render/              # Rendering utilities
├── utils/               # Helper functions
└── presets/             # Pattern presets
```

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Pattern Rendering**: SVG-based procedural generation

## 📁 API Reference

### Core Types

```typescript
interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  theme: PresetTheme;
  canvas: CanvasState;
  layers: Layer[];
}

interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  blendMode: string;
  // ... additional properties based on type
}
```

### Key Hooks

- `useFavorites()`: Manage favorite patterns
- `useKeyboardShortcuts()`: Handle keyboard shortcuts
- `useStore()`: Access Zustand state

## 🎨 Pattern Categories

- **Gradients**: Linear and radial gradients
- **Geometric**: Shapes, patterns, tessellations
- **Waves**: Sine wave patterns
- **Abstract**: Organic, flowing shapes
- **Metallic**: Chrome, gold effects
- **Glassmorphism**: Frosted glass effects
- **Texture**: Noise, grain patterns
- **Particles**: Animated dot fields
- **Mesh**: Multi-point gradients
- **Stripe**: Various stripe patterns

## 🚀 Roadmap

### Phase 1: Enhanced Patterns (High Priority)
- ✅ Noise/Grain texture effects
- ✅ Organic flowing shapes
- ✅ Mesh gradients
- ✅ Perlin noise backgrounds
- ✅ Particle systems
- ✅ Striped patterns
- ✅ Geometric mosaics

### Phase 2: Advanced Features
- ✅ Pattern mixer with blend modes
- 🔄 Animation controls
- 🔄 Color palette generator
- ✅ Preset collections (User Created)
- 🔄 Pattern history tracking
- 🔄 Comparison mode (side-by-side)
- ✅ Batch export
- 🔄 Undo/Redo system

### Phase 3: Developer Tools
- 🔄 Code playground (live editor)
- 🔄 Framework component snippets
- 🔄 Documentation generator
- 🔄 Performance metrics
- 🔄 Accessibility checker
- 🔄 WCAG compliance

### Phase 4: UX Improvements
- ✅ Keyboard navigation
- 🔄 Touch gestures (swipe, pinch)
- 🔄 Right-click context menu
- 🔄 Interactive onboarding
- ✅ Responsive preview
- 🔄 Tooltips & guided tours

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add proper type definitions
- Write descriptive commit messages
- Test keyboard shortcuts and responsive design
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Pattern generation algorithms inspired by modern design trends
- Icons provided by Lucide React
- Special thanks to the open-source community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/chandrakantdubey/style-scape/issues)
- **Discussions**: [GitHub Discussions](https://github.com/chandrakantdubey/style-scape/discussions)

---

**Made with ❤️ by [Chandra Kant Dubey](https://github.com/chandrakantdubey)**
