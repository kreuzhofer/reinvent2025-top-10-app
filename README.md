# AWS re:Invent 2025 Quiz App

A browser-based, interactive web application that presents AWS re:Invent 2025 announcements in an engaging, gamified format. The application combines informational content presentation with Kahoot-style quiz elements, allowing users to test their knowledge and earn points.

## Features

- 🎯 **Interactive Quiz Format**: Kahoot-style questions with multiple choice answers
- ⏱️ **Time-Based Scoring**: Quick answers earn more points (10% deduction per second)
- 📊 **Real-Time Score Tracking**: See your score throughout the session
- 🎨 **AWS re:Invent Branding**: Professional design with official re:Invent colors and styling
- ⌨️ **Keyboard Navigation**: Full keyboard support for presentation control
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop devices
- 🎬 **Smooth Animations**: Polished transitions and feedback animations
- 📦 **No Backend Required**: Runs entirely in the browser

## Technology Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **Docker** - Containerized deployment
- **Nginx** - Production web server

## Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Docker Deployment

The application can be deployed using Docker Compose for production hosting.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose V2

### Deploy with Docker

1. **Build and start:**
   ```bash
   docker compose up -d --build
   ```

2. **Access the application:**
   Open `http://localhost` in your browser

3. **View logs:**
   ```bash
   docker compose logs -f frontend
   ```

4. **Stop the application:**
   ```bash
   docker compose down
   ```

### Important: Rebuilding After Code Changes

After making code changes, you MUST rebuild the container:

```bash
docker compose up -d --build
```

Simply restarting will NOT pick up changes because the container uses a compiled version.

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
.
├── src/
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── data/             # Quiz data and images
│   └── styles/           # Theme configuration
├── public/               # Static assets
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose configuration
├── nginx.conf           # Nginx configuration
└── DEPLOYMENT.md        # Detailed deployment guide
```

## Content Management

Quiz content is defined in `src/data/quiz-data.json`. The JSON file includes:

- Metadata (title, description, version)
- Content slides (announcements, facts, stories)
- Quiz slides (questions, answers, points)

### Content Types

- **Text blocks**: Headings, body text, captions
- **Images**: PNG, JPG, or SVG files
- **Icons**: AWS service icons and Lucide icons
- **Lists**: Ordered or unordered lists
- **Stats**: Highlighted statistics with colors

See the design document for the complete JSON schema.

## Keyboard Shortcuts

- **Right Arrow** - Advance to next slide
- **1-4 Keys** - Select quiz answer (on quiz slides)
- **Enter** - Start quiz (on welcome screen)
- **?** - Show keyboard shortcuts help

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Testing

The project uses Vitest and React Testing Library for testing:

```bash
npm test
```

## Deployment Options

### Option 1: Docker (Recommended)

Use the provided Docker configuration for consistent deployment:

```bash
docker compose up -d --build
```

### Option 2: Static Hosting

Deploy the `dist/` folder to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your Git repository
- **AWS S3 + CloudFront**: Upload to S3 bucket with static website hosting
- **GitHub Pages**: Use GitHub Actions to deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

See [LICENSE](LICENSE) file for details.

## Documentation

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Requirements](.kiro/specs/reinvent-quiz-app/requirements.md) - Feature requirements
- [Design Document](.kiro/specs/reinvent-quiz-app/design.md) - Technical design
- [Implementation Tasks](.kiro/specs/reinvent-quiz-app/tasks.md) - Development tasks

## Support

For issues or questions, please open an issue on the repository.
