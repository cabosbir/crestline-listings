# Baja International Realty - Luxury Real Estate Website

## Project Overview

Professional luxury real estate website for Baja International Realty, showcasing properties in Cabo San Lucas and Baja California Sur, Mexico.

## Features

- Property listings with advanced search and filters
- Agent profiles and team showcase
- Property detail pages with galleries
- Contact forms and lead generation
- Mobile-responsive design
- Integration with FlexMLS

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Cloudinary** - Image hosting and optimization

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd crestline-listings-main

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FLEXMLS_API_KEY=your_flexmls_api_key_here
```

## Development

### Local Development

```sh
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API services (FlexMLS, etc.)
├── assets/          # Images and static files
└── lib/             # Utility functions
```

## Deployment

This project can be deployed to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### Deploy to Vercel

```sh
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Custom Domain

To connect a custom domain:

1. Deploy your application
2. Navigate to your hosting provider's domain settings
3. Add your custom domain
4. Update DNS records as instructed

## Key Pages

- `/` - Homepage with featured properties
- `/properties` - Property listings with advanced filters
- `/property/:id` - Individual property details
- `/team` - Team member showcase
- `/team/:id` - Individual agent profiles
- `/about` - Company history and values
- `/contact` - Contact form and information

## Features

### Property Search
- Advanced filters (location, price, beds, baths, features)
- MLS number search
- Date range filters
- Keyword search

### Agent Profiles
- Individual agent pages
- Contact information
- Properties sold
- Years of experience
- Specializations

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly navigation

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For questions or support, contact:
- Email: info@bircabo.com
- Phone: +52 624 143 5555

## License

© 2025 Baja International Realty. All rights reserved.