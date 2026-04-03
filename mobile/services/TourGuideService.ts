/**
 * Tour Guide Service
 * Manages interactive tours for admin pages
 */

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // Element ID to highlight
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onPress: () => void;
  };
  skippable?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  page: string;
  steps: TourStep[];
  icon?: string;
  category?: 'getting-started' | 'advanced' | 'feature';
}

// Tour definitions for each admin page
export const ADMIN_TOURS: Tour[] = [
  {
    id: 'products-overview',
    name: 'Products Management',
    description: 'Learn how to manage your product inventory',
    page: 'products',
    icon: 'cube',
    category: 'getting-started',
    steps: [
      {
        id: 'products-intro',
        title: 'Welcome to Products',
        description: 'Here you can manage all your products, add new items, update inventory, and organize collections.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'products-add',
        title: 'Add New Products',
        description: 'Click here to add a new product to your inventory. You can add images, set prices, manage stock, and more.',
        target: 'add-product-button',
        placement: 'bottom',
      },
      {
        id: 'products-search',
        title: 'Search & Filter',
        description: 'Use the search bar and filters to quickly find products. Filter by status, discount, category, or tags.',
        target: 'products-search',
        placement: 'bottom',
      },
      {
        id: 'products-collections',
        title: 'Manage Collections',
        description: 'Group products into collections to help customers discover related items. Collections appear on your storefront.',
        target: 'collections-button',
        placement: 'bottom',
      },
      {
        id: 'products-status',
        title: 'Product Status',
        description: 'Toggle products active/inactive to control visibility. Inactive products won\'t appear to customers.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'orders-overview',
    name: 'Orders Management',
    description: 'Track and manage customer orders',
    page: 'orders',
    icon: 'receipt',
    category: 'getting-started',
    steps: [
      {
        id: 'orders-intro',
        title: 'Orders Dashboard',
        description: 'Track all customer orders in one place. Monitor order status, process shipments, and handle customer requests.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'orders-stats',
        title: 'Order Statistics',
        description: 'View key metrics: total orders, pending orders, pending revenue, and net revenue. Use the time period filter to adjust the view.',
        placement: 'top',
      },
      {
        id: 'orders-filters',
        title: 'Filter Orders',
        description: 'Filter orders by status (pending, processing, shipped, delivered, cancelled) to focus on what needs attention.',
        placement: 'top',
      },
      {
        id: 'orders-details',
        title: 'Order Details',
        description: 'Tap any order to view full details, update status, view customer info, and manage delivery.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'finance-overview',
    name: 'Finance & Refunds',
    description: 'Manage revenue and process refunds',
    page: 'finance',
    icon: 'cash',
    category: 'getting-started',
    steps: [
      {
        id: 'finance-intro',
        title: 'Finance Dashboard',
        description: 'Monitor your revenue, track refunds, and export financial reports. All your financial data in one place.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'finance-stats',
        title: 'Financial Metrics',
        description: 'Track net revenue (delivered orders minus refunds), pending orders, refunded amounts, and refund requests.',
        placement: 'top',
      },
      {
        id: 'finance-refunds',
        title: 'Process Refunds',
        description: 'For delivered orders, you can process full or partial refunds. Click "Refund" on any delivered order.',
        placement: 'center',
      },
      {
        id: 'finance-manage',
        title: 'Manage Refunds',
        description: 'View all refund requests, approve or reject them, and track refund status.',
        target: 'manage-refunds-button',
        placement: 'bottom',
      },
      {
        id: 'finance-export',
        title: 'Export Reports',
        description: 'Export financial data as CSV for accounting and analysis. Use the download icon in the header.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'users-overview',
    name: 'User Management',
    description: 'Manage customer accounts',
    page: 'users',
    icon: 'people',
    category: 'getting-started',
    steps: [
      {
        id: 'users-intro',
        title: 'User Management',
        description: 'View and manage all customer accounts. Monitor user activity, handle account issues, and moderate content.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'users-search',
        title: 'Find Users',
        description: 'Search users by name or email to quickly find specific accounts.',
        placement: 'bottom',
      },
      {
        id: 'users-filter',
        title: 'Filter by Status',
        description: 'Filter users by status: Active (normal users), Suspended (temporarily restricted), or Blocked (permanently banned).',
        placement: 'bottom',
      },
      {
        id: 'users-details',
        title: 'User Details',
        description: 'Tap any user to view their profile, order history, and manage their account status.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'suppliers-overview',
    name: 'Supplier Management',
    description: 'Manage supplier accounts and verification',
    page: 'suppliers',
    icon: 'business',
    category: 'getting-started',
    steps: [
      {
        id: 'suppliers-intro',
        title: 'Supplier Management',
        description: 'Manage supplier accounts, verify businesses, and monitor supplier performance.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'suppliers-add',
        title: 'Add Suppliers',
        description: 'Add new supplier accounts to expand your marketplace.',
        target: 'add-supplier-button',
        placement: 'bottom',
      },
      {
        id: 'suppliers-verify',
        title: 'Verify Suppliers',
        description: 'Verify suppliers to show customers they\'re trusted. Tap the shield icon to toggle verification.',
        placement: 'center',
      },
      {
        id: 'suppliers-edit',
        title: 'Edit Supplier Info',
        description: 'Update supplier details, contact information, and business information.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'reviews-overview',
    name: 'Review Moderation',
    description: 'Manage and respond to product reviews',
    page: 'reviews',
    icon: 'star',
    category: 'getting-started',
    steps: [
      {
        id: 'reviews-intro',
        title: 'Review Moderation',
        description: 'Monitor product reviews, respond to customer feedback, and flag inappropriate content.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'reviews-filter',
        title: 'Filter by Rating',
        description: 'Filter reviews by star rating to focus on specific feedback. Address low ratings promptly.',
        placement: 'bottom',
      },
      {
        id: 'reviews-respond',
        title: 'Respond to Reviews',
        description: 'Click "Respond" to publicly reply to reviews. Show customers you care about their feedback.',
        placement: 'center',
      },
      {
        id: 'reviews-flag',
        title: 'Flag Reviews',
        description: 'Flag inappropriate or spam reviews for further review. Flagged reviews are highlighted.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'layout-overview',
    name: 'Page Layout',
    description: 'Customize your storefront pages',
    page: 'settings',
    icon: 'layers',
    category: 'advanced',
    steps: [
      {
        id: 'layout-intro',
        title: 'Page Layout Editor',
        description: 'Customize what appears on your Home and Buy Now pages. Reorder sections, enable/disable features, and add collections.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'layout-pages',
        title: 'Switch Pages',
        description: 'Toggle between Home and Buy Now pages. Each page has its own layout configuration.',
        placement: 'bottom',
      },
      {
        id: 'layout-reorder',
        title: 'Reorder Sections',
        description: 'Use the up/down arrows to change the order sections appear on the page.',
        placement: 'center',
      },
      {
        id: 'layout-toggle',
        title: 'Enable/Disable Sections',
        description: 'Toggle sections on/off to control what customers see. Disabled sections are hidden but not deleted.',
        placement: 'center',
      },
      {
        id: 'layout-collections',
        title: 'Add Collections',
        description: 'Add collection sections to showcase specific product groups on your storefront.',
        placement: 'bottom',
      },
      {
        id: 'layout-save',
        title: 'Save Changes',
        description: 'Don\'t forget to save your changes! The Save button appears when you make modifications.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'account-overview',
    name: 'Admin Account',
    description: 'Manage your admin settings',
    page: 'account',
    icon: 'shield',
    category: 'getting-started',
    steps: [
      {
        id: 'account-intro',
        title: 'Admin Account',
        description: 'Access all admin tools, manage settings, and switch between admin and customer views.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'account-tools',
        title: 'Admin Tools',
        description: 'Quick access to ads, collections, categories, users, suppliers, reviews, and page layout settings.',
        placement: 'center',
      },
      {
        id: 'account-customer-view',
        title: 'Customer View',
        description: 'Switch to customer view to see your store as customers see it. Great for testing changes.',
        target: 'customer-view-button',
        placement: 'top',
      },
      {
        id: 'account-profile',
        title: 'Profile Settings',
        description: 'Update your admin profile, change password, and manage notification preferences.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'collections-overview',
    name: 'Collections Management',
    description: 'Learn how to create and manage product collections',
    page: 'collections',
    icon: 'albums',
    category: 'getting-started',
    steps: [
      {
        id: 'collections-intro',
        title: 'Product Collections',
        description: 'Collections help you group products together for easier discovery. Create themed collections like "Summer Sale" or "Best Sellers".',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'collections-create',
        title: 'Create Collections',
        description: 'Click here to create a new collection. You can set filters to automatically include products, or manually select them.',
        placement: 'top',
      },
      {
        id: 'collections-filters',
        title: 'Smart Filters',
        description: 'Use filters to automatically include products based on category, price, tags, or other criteria. Collections update automatically.',
        placement: 'center',
      },
      {
        id: 'collections-status',
        title: 'Collection Status',
        description: 'Toggle collections active/inactive to control visibility. Inactive collections won\'t appear on your storefront.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'categories-overview',
    name: 'Categories Management',
    description: 'Organize products with categories',
    page: 'categories',
    icon: 'grid',
    category: 'getting-started',
    steps: [
      {
        id: 'categories-intro',
        title: 'Product Categories',
        description: 'Categories help organize your products into logical groups. Customers use categories to browse and filter products.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'categories-create',
        title: 'Add Categories',
        description: 'Create categories for your product types. Each category can have subcategories for more detailed organization.',
        placement: 'top',
      },
      {
        id: 'categories-subcategories',
        title: 'Subcategories',
        description: 'Add subcategories to provide more specific product groupings. For example, "Electronics" might have "Phones", "Tablets", "Laptops".',
        placement: 'center',
      },
      {
        id: 'categories-icons',
        title: 'Category Icons',
        description: 'Add Ionicons names to make categories visually appealing. Icons help customers quickly identify categories.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'ads-overview',
    name: 'Ads Management',
    description: 'Create promotional ads for your storefront',
    page: 'ads',
    icon: 'megaphone',
    category: 'getting-started',
    steps: [
      {
        id: 'ads-intro',
        title: 'Promotional Ads',
        description: 'Create eye-catching ads to promote products, sales, or special offers. Ads appear on your Home and Buy Now pages.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'ads-create',
        title: 'Create Ads',
        description: 'Click here to create a new ad. Upload an image, add a title and description, and set where it should appear.',
        placement: 'top',
      },
      {
        id: 'ads-placement',
        title: 'Ad Placement',
        description: 'Choose where ads appear: carousel (rotating banners) or tiles (grid layout). Each page can have different ad types.',
        placement: 'center',
      },
      {
        id: 'ads-status',
        title: 'Ad Status',
        description: 'Toggle ads active/inactive to control visibility. Use this to schedule promotions or test different ads.',
        placement: 'center',
      },
    ],
  },
  {
    id: 'messages-overview',
    name: 'Messages Management',
    description: 'Communicate with customers',
    page: 'messages',
    icon: 'chatbubbles',
    category: 'getting-started',
    steps: [
      {
        id: 'messages-intro',
        title: 'Customer Messages',
        description: 'View and respond to customer inquiries, support requests, and order questions. Keep customers informed and satisfied.',
        placement: 'center',
        skippable: true,
      },
      {
        id: 'messages-threads',
        title: 'Message Threads',
        description: 'Each conversation is organized into threads. Tap any thread to view the full conversation and respond.',
        placement: 'center',
      },
      {
        id: 'messages-respond',
        title: 'Quick Responses',
        description: 'Respond quickly to customer messages. Fast responses improve customer satisfaction and trust.',
        placement: 'center',
      },
      {
        id: 'messages-unread',
        title: 'Unread Messages',
        description: 'Unread messages are highlighted. Check regularly to ensure no customer is left waiting.',
        placement: 'center',
      },
    ],
  },
];

// Storage keys
const TOUR_STORAGE_KEY = '@tour_progress';
const TOUR_COMPLETED_KEY = '@tours_completed';

export class TourGuideService {
  private completedTours: Set<string> = new Set();
  private currentTourProgress: Map<string, number> = new Map();

  async initialize() {
    // Load completed tours and progress from storage
    // In a real app, you'd use AsyncStorage
    this.completedTours = new Set();
    this.currentTourProgress = new Map();
  }

  getToursByPage(page: string): Tour[] {
    return ADMIN_TOURS.filter(tour => tour.page === page);
  }

  getTourById(tourId: string): Tour | undefined {
    return ADMIN_TOURS.find(tour => tour.id === tourId);
  }

  getAllTours(): Tour[] {
    return ADMIN_TOURS;
  }

  isTourCompleted(tourId: string): boolean {
    return this.completedTours.has(tourId);
  }

  getTourProgress(tourId: string): number {
    return this.currentTourProgress.get(tourId) || 0;
  }

  async markTourCompleted(tourId: string) {
    this.completedTours.add(tourId);
    this.currentTourProgress.delete(tourId);
    // Save to storage
  }

  async updateTourProgress(tourId: string, stepIndex: number) {
    this.currentTourProgress.set(tourId, stepIndex);
    // Save to storage
  }

  async resetTour(tourId: string) {
    this.completedTours.delete(tourId);
    this.currentTourProgress.delete(tourId);
    // Save to storage
  }

  async resetAllTours() {
    this.completedTours.clear();
    this.currentTourProgress.clear();
    // Save to storage
  }
}

export const tourGuideService = new TourGuideService();
