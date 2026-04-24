# Delivery Planner Frontend

A modern React + TypeScript admin and driver portal for managing delivery operations. Built with Chakra UI v2, React Router v6, and integrated with AWS Cognito for authentication.

## 🎯 Project Overview

Delivery Planner is a dual-portal application that enables:
- **Admin Panel**: Manage orders, clients, products, drivers, and delivery routes
- **Driver Portal**: Track assigned deliveries, update delivery status, and manage route optimization

### Key Features

✨ **Admin Features**
- Order management (create, update, search, filter)
- Client relationship management
- Product inventory management
- Driver and delivery assignment
- Route optimization and manual rebalancing
- Interactive maps for delivery visualization
- Dashboard with order analytics

🚗 **Driver Features**
- View assigned deliveries
- Update delivery status
- Manual address entry for unconfirmed deliveries
- Route optimization
- Delivery consolidation and consolidation workflows

🔐 **Authentication & Security**
- AWS Cognito integration for user management
- JWT token-based API authentication
- Role-based access control (Admin vs Driver)
- Secure token refresh and validation

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Framework** | React 18.3, React Router v6 |
| **Language** | TypeScript 6.0 |
| **UI Library** | Chakra UI v2 |
| **State Management** | React Hooks (custom hooks for API calls) |
| **HTTP Client** | Axios |
| **Maps** | Leaflet + React Leaflet |
| **Styling** | Emotion + Chakra System |
| **Testing** | Jest + React Testing Library |
| **Build** | react-app-rewired (CRA with custom config) |
| **Authentication** | AWS Cognito Identity JS |

## 📁 Project Structure

```
src/
├── assets/              # Images and static assets
├── components/          # Reusable UI components (Horizon UI template)
│   ├── navbar/
│   ├── sidebar/
│   ├── icons/
│   ├── cards/
│   └── ...
├── contexts/            # React Context providers
│   └── SidebarContext
├── hooks/               # Custom React hooks
│   ├── useAuthGuard.ts  # Authentication guard
│   └── __tests__/
├── layouts/             # Layout wrappers
│   ├── admin/           # Admin portal layout
│   ├── driver/          # Driver portal layout
│   └── auth/            # Authentication layout
├── views/               # Page components
│   ├── admin/
│   │   ├── clients/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── dashboard/
│   │   └── hooks/       # Domain-specific hooks (useOrders, useClients, etc.)
│   ├── driver/
│   │   ├── deliveries/
│   │   └── hooks/
│   └── auth/
│       └── signIn/
├── types/               # TypeScript type definitions
│   ├── orders.ts
│   ├── clients.ts
│   ├── products.ts
│   ├── drivers.ts
│   └── ...
├── theme/               # Chakra UI theme customization
├── utils/               # Utility functions
├── variables/           # Constants and configuration
├── routes.tsx           # Horizon UI route configuration
├── authRoutes.tsx       # Auth routes
├── driverRoutes.tsx     # Driver routes
├── security.ts          # JWT token handling
├── index.tsx            # Entry point
└── react-app-env.d.ts   # CRA type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm 7+
- Environment variables configured (see `.env` setup below)

### Installation

```bash
# Clone the repository
git clone https://github.com/infinity-cloud-solutions/delivery-planner-frontend.git
cd delivery-planner-frontend

# Install dependencies
npm install --legacy-peer-deps

# The --legacy-peer-deps flag is required because:
# - react-leaflet@3.2.5 peers against react@^17 while project uses React 18
# - This is safe; react-leaflet@3 is fully compatible with React 18
```

### Environment Setup

Create a `.env` file in the project root:

```env
# AWS Cognito Configuration
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxx
REACT_APP_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Configuration
REACT_APP_API_BASE_URL=https://api.example.com

# Driver Mapping (JSON string: email -> driver number)
REACT_APP_DRIVERS_MAP={"driver1@example.com": 1, "driver2@example.com": 2, "driver3@example.com": 3}

# Public URL (for gh-pages deployment)
PUBLIC_URL=/
```

### Running the Application

```bash
# Development server (port 3000)
npm start

# Run tests
npm test

# Build for production
npm run build

# Deploy to gh-pages
npm run deploy
```

## 📋 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server with hot reload |
| `npm test` | Run test suite (watch mode by default) |
| `npm run build` | Create optimized production build |
| `npm run eject` | Eject from Create React App (irreversible) |
| `npm run deploy` | Build and deploy to gh-pages |
| `npm run sitemap` | Generate sitemap for SEO |

## 🧪 Testing

The project uses Jest and React Testing Library for unit and component testing.

```bash
# Run all tests
npm test

# Run specific test file
npm test useOrders.test.ts

# Run with coverage
npm test -- --coverage

# Run without watch mode (CI mode)
npm test -- --watchAll=false
```

**Test Suites:**
- `useAuthGuard.test.ts` - Authentication guard hook
- `useClients.test.ts` - Client management hook
- `useClientLookup.test.ts` - Client lookup functionality
- `useDeliveries.test.ts` - Delivery management
- `useOrders.test.ts` - Order operations (create, update, delete)
- `useProducts.test.ts` - Product retrieval
- `useProductsCRUD.test.ts` - Product CRUD operations

**Current Status:** 40/40 tests passing ✅

## 🎨 Styling & Theme

The project uses **Chakra UI v2** with custom theme extensions located in `src/theme/`. 

### Color Mode
- Supports light and dark modes
- Toggle via `useColorMode()` hook
- Automatically persists user preference

### Custom Components
- Styled cards, buttons, and form controls
- Responsive grid layouts
- Custom sidebar and navbar

## 🔐 Authentication Flow

1. **Sign In** → AWS Cognito redirects to login page
2. **Token Exchange** → User credentials exchanged for JWT
3. **Token Storage** → JWT stored in memory (security best practice)
4. **API Requests** → Bearer token added to Authorization header
5. **Token Refresh** → Automatic refresh before expiration
6. **Sign Out** → Clear tokens and redirect to sign-in page

**Security:** See `src/security.ts` for JWT handling implementation.

## 🗂️ Domain Hooks Architecture

Each domain (Orders, Clients, Products, Drivers) has a dedicated hook in `src/views/{domain}/hooks/`:

### useOrders Hook
```typescript
const { orders, loading, error, createOrder, updateOrder, deleteOrder } = useOrders();
```
- CRUD operations for orders
- Automatic JWT authentication
- Error handling with user feedback

### useClients Hook
```typescript
const { clients, loading, error, createClient, updateClient, deleteClient } = useClients();
```
- Client relationship management
- Search and filtering

### useProducts Hook
```typescript
const { products, loading, error } = useProducts();
```
- Product inventory retrieval

### useClientLookup Hook
```typescript
const { lookupClient } = useClientLookup();
```
- Search clients by phone number
- Returns `{ id, name, address, phone }`

## 🚗 Driver Management

Drivers are dynamically loaded from `REACT_APP_DRIVERS_MAP` environment variable. This enables:
- Support for unlimited drivers (not hardcoded)
- Easy onboarding of new drivers
- Driver reassignment UI in admin panel

**Format:** JSON mapping email addresses to driver IDs
```json
{
  "driver1@example.com": 1,
  "driver2@example.com": 2,
  "driver3@example.com": 3
}
```

## 🗺️ Maps Integration

Interactive delivery route maps using:
- **Leaflet** - Mapping library
- **React Leaflet** - React wrapper
- **TravelPlanner** - Route optimization algorithm

**Features:**
- Drag-and-drop reordering of deliveries
- Visual distance calculations
- Manual route adjustment
- Marker clustering for better performance

## 📊 Type Safety

Full TypeScript support with types defined in `src/types/`:
- `Order` - Order structure and operations
- `Client` - Client details
- `Product` - Product inventory
- `Delivery` - Delivery status and tracking
- `Driver` - Driver assignments

**Build Status:** ✅ Zero TypeScript errors, strict mode enabled

## 🔍 Code Quality

### ESLint Configuration
The project extends `react-app` and `react-app/jest` ESLint configs.

**Current Status:**
- ✅ 0 ESLint warnings
- ✅ 0 TypeScript errors
- ✅ 40/40 tests passing
- ✅ Build: Compiles successfully (1 pre-existing third-party warning)

### Known Issues

**Pre-existing Third-Party Warning:**
```
Module not found: Can't resolve 'vm' in asn1.js
```
This comes from `jsonwebtoken → jws → jwa → crypto-browserify → asn1.js` and is a known webpack 5 + Node.js polyfills issue. It does NOT affect functionality and comes from an external package, not our code.

## 🔄 Recent Updates (TypeScript Migration - PR 6)

All JavaScript/JSX files have been converted to TypeScript:
- ✅ Full TypeScript migration complete
- ✅ Type safety enabled (strict mode)
- ✅ API hooks extracted and properly typed
- ✅ React 18 compatibility verified
- ✅ All dependencies updated to latest versions
- ✅ Build errors resolved
- ✅ ESLint warnings fixed

## 📝 Git Workflow

The project uses feature branches and pull requests for all changes:

- `main` - Production-ready code
- `dev` - Integration branch for features
- `refactor/*` - Feature/refactor branches

**Creating a PR:**
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "type(scope): description"`
3. Push to origin: `git push origin feature/your-feature`
4. Open PR on GitHub (base: `dev`)
5. Wait for review and tests to pass
6. Merge when approved

## 🤝 Contributing

### Before Pushing Code

1. **Run tests:** `npm test -- --watchAll=false`
2. **Check types:** TypeScript build happens automatically
3. **Verify linting:** ESLint runs on all files
4. **Manual testing:** Test changes in the app

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Keep components focused and reusable
- Add tests for new functionality
- Document complex logic with comments

## 🐛 Troubleshooting

### Build Issues

**"Cannot find module" errors in dev server:**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

**TypeScript errors after changes:**
- Check `tsconfig.json` baseUrl/paths are correctly configured
- Verify imports use `src/` path (not relative)
- Check file extensions are `.tsx` for React components

### Test Failures

```bash
# Run tests in debug mode
npm test -- --no-coverage --verbose

# Run single test file
npm test useOrders.test.ts

# Clear Jest cache
npm test -- --clearCache
```

### Deployment Issues

Ensure `.env` variables are set in deployment environment:
- AWS Cognito credentials
- API base URL pointing to correct backend
- Driver map configuration

## 📚 Additional Resources

- [Chakra UI Docs](https://chakra-ui.com/)
- [React Router v6 Docs](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [Leaflet Docs](https://leafletjs.com/)

## 📄 License

This project is private and owned by Infinity Cloud Solutions.

## 👥 Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Contact development team

---

**Last Updated:** April 2026  
**Build Status:** ✅ Passing  
**TypeScript:** ✅ Strict Mode  
**Tests:** ✅ 40/40 Passing
