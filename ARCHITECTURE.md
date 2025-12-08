# Architecture Overview

This document provides a visual overview of the AWS re:Invent 2025 Quiz App architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Router    │  │ Quiz Engine  │  │  Score Context  │  │  │
│  │  │  (Routes)   │  │   (Logic)    │  │    (State)      │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │         │                 │                    │           │  │
│  │  ┌──────▼─────────────────▼────────────────────▼───────┐  │  │
│  │  │           Presentation Components                    │  │  │
│  │  │  • WelcomeScreen  • QuizSlide   • SummaryScreen    │  │  │
│  │  │  • ContentSlide   • ScoreDisplay • ProgressBar     │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ HTTP Request                      │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      Docker Host (Web Server)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Docker Container: reinvent-quiz-app           │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │                  Nginx Web Server                     │  │ │
│  │  │                    (Port 80)                          │  │ │
│  │  │  ┌────────────────────────────────────────────────┐  │  │ │
│  │  │  │         Static Files (/usr/share/nginx/html)   │  │  │ │
│  │  │  │  • index.html                                  │  │  │ │
│  │  │  │  • assets/main-[hash].js                       │  │  │ │
│  │  │  │  • assets/main-[hash].css                      │  │  │ │
│  │  │  │  • data/quiz-data.json                         │  │  │ │
│  │  │  │  • data/images/*.{png,jpg,svg}                 │  │  │ │
│  │  │  │  • public/reinvent-logo.png                    │  │  │ │
│  │  │  └────────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Docker Build Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Stage Docker Build                      │
│                                                                   │
│  Stage 1: Builder (node:20-alpine)                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Copy package.json and package-lock.json               │  │
│  │  2. Run npm ci (install dependencies)                     │  │
│  │  3. Copy source code                                       │  │
│  │  4. Run npm run build (Vite build)                        │  │
│  │  5. Output: /app/dist/ directory                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ Copy dist/ files                  │
│                              ▼                                   │
│  Stage 2: Production (nginx:alpine)                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Copy nginx.conf to /etc/nginx/conf.d/                │  │
│  │  2. Copy dist/ to /usr/share/nginx/html/                 │  │
│  │  3. Expose port 80                                        │  │
│  │  4. Start Nginx                                           │  │
│  │  5. Final image size: ~25-30 MB                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Application Flow

```
┌─────────────┐
│   User      │
│  Visits     │
│   Site      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Welcome Screen  │
│  • Logo         │
│  • Start Button │
└──────┬──────────┘
       │ Click Start / Press Enter
       ▼
┌─────────────────┐
│ Content Slide   │
│  • Announcement │
│  • Images       │
│  • Facts        │
└──────┬──────────┘
       │ Next
       ▼
┌─────────────────┐
│  Quiz Slide     │
│  • Question     │
│  • 4 Choices    │
│  • Timer (10s)  │
└──────┬──────────┘
       │ Answer / Skip / Timeout
       ▼
┌─────────────────┐
│  Feedback       │
│  • Correct?     │
│  • Points       │
│  • Explanation  │
└──────┬──────────┘
       │ Next
       ▼
┌─────────────────┐
│  More Slides    │
│  (Repeat)       │
└──────┬──────────┘
       │ Last Slide
       ▼
┌─────────────────┐
│ Summary Screen  │
│  • Final Score  │
│  • Percentage   │
│  • Restart      │
└─────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Application Startup                      │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Load quiz-data  │
                  │    .json file    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Validate Schema  │
                  └────────┬─────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         Valid  │                     │  Invalid
                ▼                     ▼
       ┌─────────────────┐   ┌──────────────┐
       │ Initialize Quiz │   │ Show Error   │
       │     State       │   │   Screen     │
       └────────┬────────┘   └──────────────┘
                │
                ▼
       ┌─────────────────┐
       │  Render Welcome │
       │     Screen      │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  User Interacts │
       │  with Quiz      │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  Update Score   │
       │  Context        │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Navigate Slides │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Show Summary    │
       └─────────────────┘
```

## Scoring System

```
┌─────────────────────────────────────────────────────────────┐
│                    Time-Based Scoring                        │
│                                                              │
│  Base Points: 100                                           │
│  Time Limit: 10 seconds                                     │
│  Deduction: 10% per second                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Time Elapsed │ Points Available │ Percentage       │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ 0 seconds    │ 100 points       │ 100%            │    │
│  │ 1 second     │ 90 points        │ 90%             │    │
│  │ 2 seconds    │ 80 points        │ 80%             │    │
│  │ 3 seconds    │ 70 points        │ 70%             │    │
│  │ 4 seconds    │ 60 points        │ 60%             │    │
│  │ 5 seconds    │ 50 points        │ 50%             │    │
│  │ 6 seconds    │ 40 points        │ 40%             │    │
│  │ 7 seconds    │ 30 points        │ 30%             │    │
│  │ 8 seconds    │ 20 points        │ 20%             │    │
│  │ 9 seconds    │ 10 points        │ 10%             │    │
│  │ 10 seconds   │ 0 points         │ 0% (timeout)    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Formula: points = basePoints - (basePoints * 0.10 * elapsed)│
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── ScoreContext.Provider
│   ├── Router
│   │   ├── Route: /
│   │   │   └── WelcomeScreen
│   │   │
│   │   ├── Route: /quiz
│   │   │   ├── ScoreDisplay
│   │   │   ├── ProgressIndicator
│   │   │   └── SlideRenderer
│   │   │       ├── ContentSlide
│   │   │       │   ├── TextBlock
│   │   │       │   ├── ImageBlock
│   │   │       │   ├── IconBlock
│   │   │       │   ├── ListBlock
│   │   │       │   └── StatBlock
│   │   │       │
│   │   │       └── QuizSlide
│   │   │           ├── QuizTimer
│   │   │           ├── QuizQuestion
│   │   │           ├── QuizChoices
│   │   │           └── QuizFeedback
│   │   │
│   │   └── Route: /summary
│   │       └── SummaryScreen
│   │
│   └── KeyboardNavigation (Hook)
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Deployment                     │
│                                                              │
│  Internet                                                    │
│     │                                                        │
│     ▼                                                        │
│  ┌──────────────────┐                                       │
│  │  Load Balancer   │ (Optional)                           │
│  │   / Firewall     │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │  Reverse Proxy   │ (Optional - for HTTPS)               │
│  │  (Nginx/Traefik) │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │  Docker Host     │                                       │
│  │  ┌────────────┐  │                                       │
│  │  │ Container  │  │                                       │
│  │  │  (Nginx)   │  │                                       │
│  │  │  Port 80   │  │                                       │
│  │  └────────────┘  │                                       │
│  └──────────────────┘                                       │
│                                                              │
│  Monitoring & Logging                                       │
│  ┌──────────────────┐                                       │
│  │  Docker Logs     │                                       │
│  │  Health Checks   │                                       │
│  │  Metrics         │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  React Components • Tailwind CSS • Framer Motion            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Application Layer                       │
│  React Hooks • Context API • React Router                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        Data Layer                            │
│  JSON Data • Local State • Browser Storage                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       Build Layer                            │
│  Vite • TypeScript • ESLint • PostCSS                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Deployment Layer                          │
│  Docker • Nginx • Docker Compose                            │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
reinvent-quiz-app/
│
├── src/                          # Source code
│   ├── components/               # React components
│   ├── context/                  # React context
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   ├── data/                     # Quiz data and images
│   ├── styles/                   # Theme configuration
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
│
├── public/                       # Static assets
│   └── reinvent-logo.png
│
├── .github/                      # GitHub Actions
│   └── workflows/
│       └── docker-build.yml
│
├── Dockerfile                    # Multi-stage build
├── docker-compose.yml            # Compose config
├── nginx.conf                    # Nginx config
├── .dockerignore                 # Docker ignore
├── .env.example                  # Environment template
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
├── tailwind.config.js            # Tailwind config
│
├── README.md                     # Project overview
├── DEPLOYMENT.md                 # Deployment guide
├── DOCKER-COMMANDS.md            # Command reference
├── ARCHITECTURE.md               # This file
└── DOCKER-SETUP-SUMMARY.md       # Setup summary
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
│                                                              │
│  1. Network Layer                                           │
│     • Firewall rules                                        │
│     • HTTPS/TLS encryption                                  │
│     • Rate limiting                                         │
│                                                              │
│  2. Application Layer                                       │
│     • Security headers (X-Frame-Options, CSP)              │
│     • Input validation                                      │
│     • XSS prevention                                        │
│                                                              │
│  3. Container Layer                                         │
│     • Non-root user                                         │
│     • Minimal base image (Alpine)                          │
│     • No unnecessary packages                               │
│                                                              │
│  4. Build Layer                                             │
│     • Dependency scanning                                   │
│     • Regular updates                                       │
│     • Secure build pipeline                                 │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                   Performance Features                       │
│                                                              │
│  1. Build Optimization                                      │
│     • Code splitting                                        │
│     • Tree shaking                                          │
│     • Minification                                          │
│     • Asset optimization                                    │
│                                                              │
│  2. Delivery Optimization                                   │
│     • Gzip compression                                      │
│     • Cache headers                                         │
│     • CDN (optional)                                        │
│                                                              │
│  3. Runtime Optimization                                    │
│     • React.memo                                            │
│     • Lazy loading                                          │
│     • Efficient re-renders                                  │
│                                                              │
│  4. Container Optimization                                  │
│     • Multi-stage build                                     │
│     • Small base image                                      │
│     • Layer caching                                         │
└─────────────────────────────────────────────────────────────┘
```

## Summary

This architecture provides:
- ✅ Fast, responsive user experience
- ✅ Easy deployment with Docker
- ✅ Scalable and maintainable codebase
- ✅ Production-ready configuration
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Comprehensive documentation
