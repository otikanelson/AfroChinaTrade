# AfroChinaTrade Landing Page

A modern, responsive landing page for AfroChinaTrade - the digital wholesale trading platform connecting African dealers with Chinese manufacturers.

## Features

- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Modern UI**: Clean, professional design consistent with the mobile app
- **Product Showcase**: Dynamic product grid with Unsplash images
- **App Download Section**: Direct links to Google Play Store
- **Hero Section**: Compelling call-to-action for immediate shopping
- **Features Highlights**: Key benefits and value propositions
- **Smooth Animations**: Subtle animations and transitions
- **SEO Optimized**: Proper meta tags and semantic HTML

## Tech Stack

- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: Pure JS for interactivity
- **Unsplash Images**: High-quality product and hero images

## Color Scheme (Consistent with Mobile App)

- **Primary**: #C41E3A (Deep Red)
- **Secondary**: #2D5F3F (Deep Green) 
- **Accent**: #D4AF37 (Gold)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
web/
├── index.html          # Main HTML file with complete landing page
├── src/
│   ├── main.js        # JavaScript functionality and product data
│   └── style.css      # Tailwind CSS and custom styles
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
└── vite.config.js     # Vite configuration
```

## Sections

1. **Navigation**: Fixed header with smooth scrolling
2. **Hero**: Main value proposition with CTA buttons
3. **Product Showcase**: 8 sample products from various categories
4. **App Download**: Mobile app promotion with store links
5. **Features**: 6 key benefits with icons
6. **Call-to-Action**: Sign up encouragement
7. **Footer**: Links and company information

## App Store Links

- **Google Play**: https://play.google.com/store/apps/details?id=com.afrochinatrade_mobile.act_mobile
- **App Store**: Coming soon (placeholder button)

## Customization

### Adding More Products

Edit the `sampleProducts` array in `src/main.js`:

```javascript
const sampleProducts = [
  {
    id: 9,
    name: "Your Product Name",
    price: "$XX.XX",
    moq: "XXX pieces",
    image: "https://images.unsplash.com/photo-xxxxx",
    supplier: "Supplier Name"
  }
  // ... more products
];
```

### Updating Colors

Modify `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    DEFAULT: '#C41E3A',  // Your primary color
    light: '#E63946',    // Lighter variant
    dark: '#8B0000',     // Darker variant
  }
  // ... other colors
}
```

## Performance

- Optimized images from Unsplash
- Minimal JavaScript bundle
- CSS purging with Tailwind
- Fast Vite development server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Make changes to the appropriate files
2. Test locally with `npm run dev`
3. Build with `npm run build` to ensure no errors
4. Submit your changes

## License

This project is part of the AfroChinaTrade ecosystem.