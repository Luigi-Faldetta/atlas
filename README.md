# Project Atlas

Project Atlas is a fractional real estate investment platform that leverages blockchain technology and AI to democratize property investment. This MVP demonstrates the core functionality of the platform, allowing users to browse properties, make investments, and track their portfolio performance.

## Features

- Fractional property investment with blockchain-secured ownership
- AI-powered property scoring and analysis
- Real-time investment simulation with projected returns
- Digital property deeds as ERC-721 tokens
- Comprehensive dashboards for users and platform metrics

For a detailed feature list, see [FEATURES.md](./FEATURES.md).

## Tech Stack

### Frontend
- **Next.js**: Server-side rendering and static generation
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Modern component library
- **Ethers.js**: Blockchain interactions
- **Chart.js**: Data visualization

### Backend
- **Node.js + Express**: REST API server
- **PostgreSQL + Prisma**: Database with ORM
- **JWT**: Authentication

### Blockchain
- **Ethereum**: Blockchain platform
- **ERC-721**: NFT standard for property tokens
- **MetaMask**: Wallet integration

## Project Structure

```
ProjectAtlas/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utilities and API services
│   │   └── ...
│   └── ...
├── backend/                # Express.js backend application
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── mock-data/      # Mock data for development
│   │   └── ...
│   └── ...
└── requirements.bat        # Setup script for Windows
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- PostgreSQL (optional for full database functionality)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/project-atlas.git
   cd project-atlas
   ```

2. Run the setup script:
   ```
   requirements.bat
   ```
   
   Or manually install dependencies:
   ```
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Mock Data

The application uses mock data for demonstration purposes. You can log in with:

- Email: `john.doe@example.com`
- Password: `password123`

## Blockchain Integration

The application integrates with the Ethereum blockchain through MetaMask. To use blockchain features:

1. Install the [MetaMask browser extension](https://metamask.io/)
2. Create or import a wallet
3. Connect your wallet when prompted in the application

## Development Roadmap

See [FEATURES.md](./FEATURES.md) for the planned development phases and milestones.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
