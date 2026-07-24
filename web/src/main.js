import './style.css';

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "Industrial LED Lighting",
    price: "$2,450",
    moq: "100 pieces",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    supplier: "Guangzhou Electronics Co."
  },
  {
    id: 2,
    name: "Wireless Bluetooth Speakers",
    price: "$12.50",
    moq: "500 pieces", 
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    supplier: "Shenzhen Audio Tech"
  },
  {
    id: 3,
    name: "Steel Kitchen Utensils Set",
    price: "$8.90",
    moq: "200 sets",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    supplier: "Foshan Steel Industries"
  },
  {
    id: 4,
    name: "Cotton Textile Fabrics",
    price: "$3.20",
    moq: "1000 yards",
    image: "https://images.unsplash.com/photo-1586231073332-5ce221e2b04b?w=400&h=300&fit=crop",
    supplier: "Jiangsu Textile Group"
  },
  {
    id: 5,
    name: "Smart Home Security Camera",
    price: "$28.00",
    moq: "100 pieces",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    supplier: "Beijing Tech Solutions"
  },
  {
    id: 6,
    name: "Fashion Leather Handbags",
    price: "$15.75",
    moq: "50 pieces",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    supplier: "Guangzhou Fashion Co."
  },
  {
    id: 7,
    name: "Solar Power Banks",
    price: "$9.25",
    moq: "300 pieces",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
    supplier: "Shenzhen Solar Tech"
  },
  {
    id: 8,
    name: "Ceramic Dinnerware Set",
    price: "$22.40",
    moq: "144 sets",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    supplier: "Jingdezhen Ceramics"
  }
];

// Load products into the grid
function loadProducts() {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  productGrid.innerHTML = sampleProducts.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
      <div class="p-6">
        <h3 class="font-bold text-lg mb-2">${product.name}</h3>
        <div class="flex justify-between items-center mb-2">
          <span class="text-primary font-bold text-xl">${product.price}</span>
          <span class="text-sm text-gray-600">MOQ: ${product.moq}</span>
        </div>
        <p class="text-gray-600 text-sm mb-4">${product.supplier}</p>
        <button class="btn-primary w-full">Contact Supplier</button>
      </div>
    </div>
  `).join('');
}

// Load more products function
window.loadMoreProducts = function() {
  alert('Redirecting to full product catalog...');
};

// Initialize the app
function initializeApp() {
  console.log('AfroChinaTrade Landing Page Loaded');
  
  // Load products
  loadProducts();
  
  // Smooth scroll for navigation
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Add scroll effect to navbar
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 100) {
      navbar.classList.add('shadow-lg');
    } else {
      navbar.classList.remove('shadow-lg');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);