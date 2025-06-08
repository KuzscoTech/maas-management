# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **MAAS Platform Management Application** - a React + TypeScript + Electron desktop application that provides a user-friendly interface to manage environments, deploy agents, submit tasks, and monitor the MAAS (Multi-Agent AI System) Platform.

## Current Development Focus

**Primary Goal**: Build a React + TypeScript + Electron desktop application as outlined in `../maas-agent-platform/APPLICATION_PROJECT_PLAN.md`

The MAAS Platform backend is **already complete and production-ready** with:
- ✅ Complete FastAPI backend with 50+ endpoints
- ✅ PostgreSQL database with multi-tenant isolation  
- ✅ All 4 specialized worker agents (Code Generator, Research, Testing, GitHub Integration)
- ✅ Google ADK integration with real AI models
- ✅ Agent communication protocols
- ✅ Multi-environment support with complete data isolation

**What we're building**: A client application that provides an intuitive interface to interact with the existing MAAS Platform API.

## CRITICAL: Progress and Issue Tracking

**BEFORE starting any new development or features:**

1. **ALWAYS check `development_progress.md`** to understand current progress and continue from the right point
2. **ALWAYS check `../maas-agent-platform/failing_platform_context.md`** for known platform issues

If the application is not working due to MAAS Platform backend issues:
1. **Check `../maas-agent-platform/failing_platform_context.md` FIRST** to see if the error already exists
2. **Only if it's a NEW error**, document it in `../maas-agent-platform/failing_platform_context.md` with:
   - **Exact error message**
   - **Failing endpoint/component** 
   - **Status** (OPEN/FIXED/INVESTIGATING)
   - **Description** of what was happening when it failed
3. **Do not proceed** with new features until platform issues are resolved
4. **Always check this file** at the start of every Claude session

Example entry format:
```
## Issue: [Date] - [Component]
**Status**: OPEN/FIXED/INVESTIGATING
**Error**: [Exact error message]
**Endpoint**: [API endpoint if applicable]
**Description**: [What was happening when it failed]
**Resolution**: [If fixed, how it was fixed]
```

## Application Architecture

```
Desktop Application (Electron)
├── Frontend (React + TypeScript)
│   ├── Environment Management Dashboard
│   ├── Agent Deployment Interface
│   ├── Task Management Console
│   ├── Configuration Wizard
│   └── Real-time Monitoring
└── Backend Connector
    └── API Client (connects to MAAS Platform FastAPI)
```

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (fast development and building)
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: React Query (API calls) + Zustand (local state)
- **UI Components**: Radix UI or Material-UI
- **Icons**: Lucide React or Heroicons

### Desktop Wrapper
- **Primary**: Electron (mature, cross-platform)
- **Alternative**: Tauri (lighter weight, Rust-based)

### Development Tools
- **Package Manager**: npm or yarn
- **Code Quality**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **TypeScript**: Strict mode enabled

## Development Commands

### Application Development Commands
```bash
# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build

# Desktop app (with Electron - when implemented)
npm run electron:dev   # Run in Electron (development)
npm run electron:build # Build desktop app

# Code quality
npm run lint           # Run ESLint
npm run format         # Run Prettier
npm run type-check     # TypeScript checking

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
```

### MAAS Platform Backend (for testing)
```bash
# In ../maas-agent-platform directory
make setup              # Full backend setup
make start             # Start MAAS Platform API server
make test              # Run backend validation tests
maas-demo             # Run platform demo
```

## Development Phases

### Phase 1: Web-Based Management Interface (Weeks 1-2)
- **Week 1**: Project setup, API client, Environment Management Dashboard
- **Week 2**: Agent Management Interface, Task Management Console, Real-time features

### Phase 2: Desktop Application Wrapper (Week 3)
- Electron integration, native features, distribution setup

### Phase 3: Easy Configuration & Deployment (Week 4)
- Configuration wizard, advanced features, documentation

## Key Application Features

### Environment Management
- Multi-environment support with isolated workspaces
- Environment templates and quick switching
- Resource monitoring and configuration management

### Agent Management
- Deploy any of the 4 worker agents to any environment
- Configure agent-specific API keys and parameters
- Real-time agent health and performance monitoring
- Lifecycle control (start, stop, restart)

### Task Management
- Intuitive forms for each agent type:
  - Code Generator: Language, requirements, style preferences
  - Research Agent: Search queries, sources, fact-checking
  - Testing Agent: Test frameworks, coverage requirements
  - GitHub Integration: Repository operations, PR workflows
- Real-time task monitoring and progress tracking
- Task results display and download
- Task history and filtering

## MAAS Platform API Integration

The application integrates with these existing endpoints (backend running on http://localhost:8000):
- **Environment Management**: `/api/v1/environments/*`
- **Agent Management**: `/api/v1/agents/*` 
- **Task Management**: `/api/v1/tasks/*`
- **Organization Management**: `/api/v1/organizations/*`
- **API Key Management**: `/api/v1/api-keys/*`
- **Monitoring**: `/api/v1/monitoring/*`
- **Health Checks**: `/api/v1/health/*`

## File Structure

```
maas-management-app/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── common/           # Shared components
│   │   ├── environments/     # Environment management
│   │   ├── agents/          # Agent management
│   │   ├── tasks/           # Task management
│   │   └── settings/        # Configuration
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client and services
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main application
├── electron/                # Electron main process (when implemented)
├── docs/                   # Documentation
├── tests/                  # Test files
├── development_progress.md  # Progress tracking
├── CLAUDE.md               # This file
└── dist/                   # Built application
```

## Development Principles

1. **TypeScript-first**: Strict typing for all components and API interactions
2. **Component-based**: Reusable, well-tested React components
3. **API-driven**: All data comes from the MAAS Platform API
4. **Responsive design**: Works on all screen sizes
5. **Real-time updates**: WebSocket connections for live monitoring
6. **Error handling**: Graceful degradation and user-friendly error messages
7. **Performance**: Optimized for smooth 60fps interactions

## CRITICAL: Git Version Control Practices

**AFTER completing any task or significant progress, ALWAYS commit changes:**

1. **Check status before committing**:
   ```bash
   git status
   ```

2. **Add relevant files** (don't use `git add .` - be selective):
   ```bash
   git add src/components/NewComponent.tsx
   git add development_progress.md
   git add CLAUDE.md  # if updated
   ```

3. **Commit with descriptive message** following this format:
   ```bash
   git commit -m "feat: implement environment management dashboard

   - Add environment list component with status indicators
   - Create environment creation form with validation
   - Set up React Query for environment API calls
   - Update development_progress.md

   Phase 1 Week 2: Environment Management - COMPLETED

   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

4. **Always update `development_progress.md`** before committing to reflect current status

### Commit Message Format:
- **Type**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Brief description** (50 chars max)
- **Detailed description** with bullet points of changes
- **Phase tracking**: Include current phase and status
- **Claude signature**: Always end with Claude Code attribution

### When to Commit:
- ✅ **After completing any todo task**
- ✅ **After implementing a new feature**
- ✅ **After fixing a bug or issue**
- ✅ **Before starting a new major task**
- ✅ **At the end of each work session**
- ✅ **After updating `development_progress.md`**

### What NOT to commit:
- ❌ Broken/incomplete code
- ❌ Work-in-progress that doesn't build
- ❌ Temporary debugging code
- ❌ Personal API keys or secrets

## Required Environment Variables

```bash
# MAAS Platform API
VITE_MAAS_API_URL=http://localhost:8000
VITE_MAAS_WS_URL=ws://localhost:8000

# Development
VITE_NODE_ENV=development
```

## Testing Strategy

- **Unit Testing**: Component testing with React Testing Library
- **API Testing**: API client testing with MSW (Mock Service Worker)
- **Integration Testing**: Component integration and Electron tests
- **E2E Testing**: Full workflow testing with Playwright

## Important Files to Reference

- `development_progress.md` - **CHECK FIRST** for current progress and completed tasks
- `../maas-agent-platform/APPLICATION_PROJECT_PLAN.md` - Complete development plan and requirements
- `../maas-agent-platform/failing_platform_context.md` - **CHECK FIRST** for known platform issues
- `../maas-agent-platform/api/main.py` - MAAS Platform API entry point for understanding available endpoints
- `../maas-agent-platform/api/schemas/` - API response schemas for TypeScript interface generation
- `../maas-agent-platform/demo/` - Example usage of the MAAS Platform for reference

## Current Status

**Backend**: Production-ready MAAS Platform with all agents implemented (in ../maas-agent-platform)
**Frontend Application**: Phase 1 Week 1 completed - React app with API client and basic interface
**Next Steps**: See `development_progress.md` for detailed progress and next tasks