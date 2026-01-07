# Contributing to SolPay

First off, thank you for considering contributing to SolPay! 🎉

This document provides guidelines for contributing to this project. By participating in this project, you agree to abide by its terms.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Contributions](#making-contributions)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recommended) or npm
- **PostgreSQL** database (we recommend [Neon](https://neon.tech) for serverless)
- **Git**

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/solpay-lazorkit.git
   cd solpay-lazorkit
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_RPC_URL="https://api.devnet.solana.com"
   NEXT_PUBLIC_VAULT_ADDRESS="your-vault-address"
   ```

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
solpay-lazorkit/
├── docs/                   # Documentation
│   └── tutorials/          # Step-by-step tutorials
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma       # Prisma schema definition
│   └── seed.ts             # Database seed script
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── payment/        # Payment components (QR code, etc.)
│   │   ├── subscription/   # Subscription components
│   │   ├── transaction/    # Transaction components
│   │   ├── ui/             # UI primitives (shadcn/ui)
│   │   └── wallet/         # Wallet connection components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions & configs
│   ├── providers/          # React context providers
│   ├── store/              # Zustand state stores
│   └── types/              # TypeScript type definitions
└── package.json
```

## Making Contributions

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug fixes** - Found a bug? Submit a fix!
- ✨ **New features** - Have an idea? Let's discuss it!
- 📝 **Documentation** - Help improve our docs
- 🧪 **Tests** - Add test coverage
- 🎨 **UI/UX improvements** - Make it prettier!

### Before You Start

1. **Check existing issues** to avoid duplicating effort
2. **Create an issue first** for major changes to discuss the approach
3. **Keep changes focused** - one feature/fix per PR

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode (`strict: true` in tsconfig)
- Prefer interfaces over types for object shapes
- Use explicit return types for functions

```typescript
// ✅ Good
interface User {
  id: string;
  walletAddress: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Avoid
type User = {
  id: string;
  walletAddress: string;
}

function getUser(id) {
  // ...
}
```

### React Components

- Use function components with hooks
- Follow the component file structure pattern:

```tsx
// =============================================================================
// COMPONENT NAME
// =============================================================================
// Brief description of what this component does
// =============================================================================

"use client"; // Only if needed

import { ... } from "...";

// =============================================================================
// TYPES
// =============================================================================

interface ComponentProps {
  // ...
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Component({ ... }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the utility-first approach
- Extract repeated patterns into components, not CSS classes
- Use CSS variables for theming (defined in `globals.css`)

### File Naming

- Components: `PascalCase.tsx` (e.g., `PlanCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useWalletSync.ts`)
- Utils: `camelCase.ts` (e.g., `formatters.ts`)
- Types: `camelCase.ts` or `index.ts` (e.g., `types/index.ts`)

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(subscription): add plan upgrade functionality

# Bug fix
fix(wallet): resolve connection timeout on slow networks

# Documentation
docs(readme): add deployment instructions

# Refactor
refactor(api): extract validation logic into middleware
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation if needed

3. **Run quality checks**
   ```bash
   pnpm lint        # Check for lint errors
   pnpm type-check  # Check TypeScript
   pnpm test        # Run tests
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe)

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes don't generate new warnings
- [ ] I have added tests that prove my fix/feature works
```

## Reporting Bugs

### Before Submitting

1. Check the [existing issues](https://github.com/yourusername/solpay-lazorkit/issues)
2. Update to the latest version to see if it's already fixed
3. Collect information about the bug:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or screenshots

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]

**Additional context**
Any other context about the problem.
```

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or screenshots.
```

## Development Tips

### Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed the database

# Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix lint errors
pnpm type-check       # TypeScript check
pnpm format           # Format with Prettier

# Testing
pnpm test             # Run tests
pnpm test:ui          # Run tests with UI
```

### Debugging

```typescript
// Debug Lazorkit wallet state
const wallet = useWallet();
console.log("Wallet state:", {
  isConnected: wallet.isConnected,
  isReady: wallet.isReady,
  address: wallet.smartWalletPubkey?.toString(),
});

// Debug API calls
const response = await fetch("/api/plans");
console.log("Response:", await response.clone().json());
```

## Recognition

Contributors will be recognized in:
- The project's README.md
- Release notes for significant contributions
- Our Twitter/social media for major features

## Questions?

Feel free to:
- Open an issue with the `question` label
- Join our Discord (link in README)
- Reach out on Twitter

---

Thank you for contributing to SolPay! Together, we're making Solana payments accessible to everyone. 🚀
