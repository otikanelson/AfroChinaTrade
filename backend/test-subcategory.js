// Simple test script to verify subcategory field is working
// This script can be run to test the product creation with subcategory

const testProductData = {
  name: "Test Product with Subcategory",
  description: "This is a test product to verify subcategory functionality",
  price: 99.99,
  categoryId: "Electronics", // Frontend sends categoryId
  subcategory: "Smartphones", // This should now be saved
  supplierId: "507f1f77bcf86cd799439011", // Example ObjectId
  stock: 10,
  images: ["https://example.com/image1.jpg"],
  tags: ["test", "electronics"],
  isFeatured: false,
  isActive: true,
  discount: 0,
  specifications: {
    "Brand": "Test Brand",
    "Model": "Test Model"
  },
  isSellerFavorite: false,
  policies: {
    paymentPolicy: "Test payment policy",
    shippingPolicy: "Test shipping policy"
  }
};

console.log("Test data for product creation:");
console.log(JSON.stringify(testProductData, null, 2));

console.log("\nFields that should be handled by the backend:");
console.log("- categoryId (mapped to category):", testProductData.categoryId);
console.log("- subcategory:", testProductData.subcategory);
console.log("- All other fields should be preserved");

console.log("\nTo test this:");
console.log("1. Start the backend server");
console.log("2. Use a tool like Postman or curl to POST this data to /api/products");
console.log("3. Verify the created product has the subcategory field saved");
console.log("4. Try updating the product with a different subcategory");