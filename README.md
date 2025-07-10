# 🎯 Reflex Game

A fast-paced, challenging reflex game built with React and Vite. Test your reaction speed with progressively increasing difficulty levels!

🎮 **[Play Live Demo](https://padletut.github.io/padles-reflex-game)** 🎮

![Game Preview](https://img.shields.io/badge/Status-Complete-brightgreen) ![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0+-06B6D4?logo=tailwindcss)

## 🚀 Features

### Core Gameplay

- **3x3 Grid**: Click on randomly appearing targets as fast as possible
- **Multiple Active Targets**: Up to 3 targets can be active simultaneously
- **Progressive Difficulty**: 7 difficulty phases from Easy to IMPOSSIBLE
- **Elite Levels**: Special phases for high-score players (48k+ and 130k+ points)

### Difficulty Progression

1. **Easy** (0-400 pts) - Level 1-8 🟢
2. **Medium** (400-1k pts) - Level 5-9 🟡
3. **Hard** (1k-2k pts) - Level 10-14 🔴
4. **Extreme** (2k-3.5k pts) - Level 15-19 🟠
5. **Insane** (3.5k-48k pts) - Level 20-29 🔴
6. **Brutal** (48k-130k pts) - Level 30-49 🩷
7. **Impossible** (130k+ pts) - Level 50-999 🟣

### Performance Tracking

- **Real-time Stats**: Current score, level, reaction times
- **Detailed Analytics**: Best/worst/average reaction times
- **High Score History**: Persistent storage of your top 15 games
- **Performance Metrics**: Clicks, accuracy, and progress tracking

### Audio & Visual Effects

- **Immersive Sound Effects**: Hit, miss, win, and game over sounds
- **Audio Controls**: Mute/unmute toggle with persistent settings
- **Modern UI**: Gradient backgrounds, blur effects, and smooth animations
- **Visual Feedback**: Target rings, hover effects, and color-coded difficulty levels

## 🎮 How to Play

1. **Start**: Click the "Start Game" button
2. **React**: Click on the glowing targets as quickly as possible
3. **Score**: Faster reactions = higher points (up to 1000 per click)
4. **Survive**: Game ends if you take longer than 1.5 seconds to react
5. **Progress**: Difficulty increases automatically as you score points

## 🛠️ Technology Stack

- **Frontend**: React 18+ with Hooks
- **Build Tool**: Vite 5+ for fast development and builds
- **Styling**: Tailwind CSS for modern, responsive design
- **State Management**: React useState and useEffect
- **Audio**: Web Audio API with audio pooling for performance
- **Storage**: localStorage for persistent game data

## 📦 Installation & Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd PadlesReflexGame

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎯 Game Mechanics

### Scoring System

- **Base Points**: 1000 - reaction_time_in_ms
- **Minimum**: 0 points (for very slow reactions)
- **Bonus**: Faster reactions yield exponentially higher scores

### Difficulty Algorithm

- **Progress Calculation**: (clicks × 75) + total_score
- **Dynamic Timing**: Spawn delays decrease with progression
- **Randomization**: Increased unpredictability at higher levels
- **Elite Scaling**: Special mechanics beyond 48k points

### Performance Optimization

- **Audio Pooling**: Multiple audio instances prevent playback conflicts
- **Efficient Rendering**: Minimal re-renders with optimized state updates
- **Memory Management**: Proper cleanup of timeouts and audio resources

## 📊 Statistics Tracked

- **Current Game**: Score, level, reaction times, click count
- **Session Stats**: Best/worst/average reaction times
- **Historical Data**: High scores with timestamps
- **Progress Metrics**: Difficulty progression and achievements

## 🎨 UI/UX Features

- **Fully Responsive**: Adapts seamlessly from desktop (1050px+) to mobile devices
- **Desktop Layout**: Sidebar stats and history for larger screens
- **Mobile Layout**: Stacked design optimized for touch devices
- **Modern Aesthetics**: Glassmorphism effects and smooth gradients
- **Intuitive Layout**: Clear information hierarchy and visual feedback
- **Accessibility**: High contrast colors and clear typography
- **Touch Support**: Optimized for touch devices with proper event handling

## 🔧 Configuration

### Audio Settings

- All sound effects are optional and can be toggled
- Volume levels are pre-configured for optimal experience
- Audio state persists between sessions

### Game Settings

```javascript
const GRID_SIZE = 3; // 3x3 grid
const MAX_REACTION_TIME = 1500; // 1.5 second timeout
const MAX_ACTIVE_CELLS = 3; // Maximum simultaneous targets
```

## 🚀 Performance Features

- **Optimized Audio**: Audio pooling eliminates browser limitations
- **Efficient State**: Minimal re-renders with proper dependency arrays
- **Memory Safety**: Comprehensive cleanup on component unmount
- **Fast Development**: Vite's HMR for instant feedback during development

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Web Audio API**: Required for sound effects
- **Local Storage**: Required for persistent high scores
- **ES6+ Features**: Modern JavaScript features used throughout

## 🎯 Tips for High Scores

1. **Stay Focused**: Keep your eyes centered on the grid
2. **Use Peripheral Vision**: Watch for targets appearing in your peripheral vision
3. **Practice Timing**: Learn the rhythm of target spawning
4. **Stay Calm**: Don't panic when multiple targets appear
5. **Warm Up**: Start with easier levels to get into the zone

## 🏆 Achievement Levels

- **Beginner**: Reach 1,000 points
- **Intermediate**: Reach 10,000 points
- **Advanced**: Reach 25,000 points
- **Expert**: Reach 48,000 points (Unlock BRUTAL mode)
- **Elite**: Reach 130,000 points (Unlock IMPOSSIBLE mode)
- **Legend**: Reach Level 50+ (IMPOSSIBLE territory)

## 🤝 Contributing

This is a complete, polished game project. Feel free to fork and modify for your own use!

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React + Vite + Tailwind CSS**

