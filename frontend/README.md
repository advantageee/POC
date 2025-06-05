# Investor Codex Frontend

A comprehensive Next.js dashboard web application for the Investor Codex platform with AI-powered investment research and analysis capabilities.

## Features

- **Companies Dashboard**: Table view with advanced filtering, search, and pagination
- **Company Profiles**: Detailed company information with tabbed interface (Overview, Signals, Contacts, Investments)
- **Alerts Timeline**: Real-time signal monitoring with severity-based filtering and AI analysis
- **Similar Companies Search**: AI-powered company similarity matching
- **Export Center**: PDF/CSV report generation with Azure Queue job tracking
- **Azure AD B2C Authentication**: Three-role authentication system (Viewer/Analyst/Admin)
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Azure AD B2C with MSAL
- **Icons**: Heroicons
- **UI Components**: Custom component library
- **State Management**: React Context
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Azure AD B2C tenant configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Azure AD B2C configuration:
```
NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME=your-tenant-name
NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID=your-client-id
NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNIN=B2C_1_signin
NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNUP=B2C_1_signup
NEXT_PUBLIC_AZURE_AD_B2C_POLICY_EDIT_PROFILE=B2C_1_edit_profile
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main companies dashboard
│   ├── company/[id]/       # Company profile pages
│   ├── alerts/             # Alerts timeline
│   ├── search/             # Similar companies search
│   └── exports/            # Export center
├── components/
│   ├── auth/               # Authentication providers and guards
│   ├── dashboard/          # Main dashboard components
│   ├── export/             # Export functionality
│   ├── layout/             # Layout components (sidebar, header)
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── api/                # API client utilities
│   ├── auth/               # Authentication configuration
│   └── utils/              # Utility functions
└── types/                  # TypeScript type definitions
```

## Key Components

### Authentication
- **AuthProvider**: MSAL authentication wrapper
- **UserProvider**: User context and role management
- **ProtectedRoute**: Route protection component

### Dashboard Components
- **CompaniesTable**: Advanced data table with filtering
- **CompanyProfile**: Tabbed company detail view
- **AlertsTimeline**: Signal monitoring interface
- **SimilarCompaniesSearch**: AI-powered search
- **ExportCenter**: Report generation interface

### UI Components
- **Button, Input, Card, Badge, Table**: Consistent UI elements
- **DashboardLayout**: Main application layout
- **Sidebar, Header**: Navigation components

## Authentication Roles

- **Viewer**: Read-only access to companies and signals
- **Analyst**: Full access to data and basic export capabilities
- **Admin**: Full system access including user management

## API Integration

The frontend integrates with backend services for:
- Company data and enrichment
- Signal detection and analysis
- Contact and investment information
- Export job management
- User authentication and authorization

## Development Notes

- Uses mock data for development when backend is unavailable
- Implements error boundaries and loading states
- Responsive design for mobile and desktop
- Type-safe API client with error handling
- Modular component architecture for maintainability

## Deployment

Configure environment variables for production and deploy to your preferred platform (Vercel, Azure, AWS, etc.).

For Azure deployment, ensure Azure AD B2C redirect URIs are configured for your production domain.
