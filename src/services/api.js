const BASE_URL = 'https://perfumeapis.brainexworld.com/api/';

export const API_ENDPOINTS = {
    orders: `${BASE_URL}Order/getAllOrders`,
    users: `${BASE_URL}User/getAllUsers`,
    products: `${BASE_URL}Product/getAllProducts`,
    bestSelling: `${BASE_URL}Product/best-selling`,
    newArrivals: `${BASE_URL}Product/new-arrivals`,
    createProduct: `${BASE_URL}Product/createProduct`,
    updateProduct: `${BASE_URL}Product/updateProduct/`, // Append ID
    deleteProduct: `${BASE_URL}Product/deleteProduct/`, // Append ID
    // Category Endpoints
    getCategories: `${BASE_URL}Category/getAllCategories`,
    createCategory: `${BASE_URL}Category/createCategory`,
    updateCategory: `${BASE_URL}Category/updateCategory/`, // Append ID at runtime
    deleteCategory: `${BASE_URL}Category/deleteCategory/`, // Append ID at runtime
    // Reports Endpoints
    salesReport: `${BASE_URL}Reports/sales`,
    monthlyRevenue: `${BASE_URL}Reports/monthly-revenue`,
    topProductsReport: `${BASE_URL}Reports/top-products`,
    login: `${BASE_URL}User/login`,
    register: `${BASE_URL}User/register`,
    // Order Endpoints
    updateOrderStatus: `${BASE_URL}Order/updateStatus/`, // Append ID at runtime
    // Sale Endpoints
    getAllSales: `${BASE_URL}Sale/getAllSales`,
    createSale: `${BASE_URL}Sale/CreateSale`,
    deleteSale: `${BASE_URL}Sale/delete/`, // Back to standard /delete/
    // Analytics Endpoints
    analyticsOverview: `${BASE_URL}Analytics/overview`,
    analyticsDailyOrders: `${BASE_URL}Analytics/daily-orders`,
    analyticsMonthlyOrders: `${BASE_URL}Analytics/monthly-orders`,
    // Coupon Endpoints
    getCoupons: `${BASE_URL}Coupon/all`,
    createCoupon: `${BASE_URL}Coupon/create`,
    updateCoupon: `${BASE_URL}Coupon/`, // Append ID
    deleteCoupon: `${BASE_URL}Coupon/delete/`, // Append ID
    // User Endpoints
    deleteUser: `${BASE_URL}User/delete/`, // Append ID
    // Inventory Endpoints
    getInventory: `${BASE_URL}Inventory/getinventory`,
    lowProducts: `${BASE_URL}Inventory/low-products`,
    lowVariants: `${BASE_URL}Inventory/low-variants`,
    outOfStock: `${BASE_URL}Inventory/out-of-stock`,
    allInventory: `${BASE_URL}Inventory/all`,
    // Slider Endpoints
    getSliders: `${BASE_URL}Slider/get`,
    createSlider: `${BASE_URL}Slider/create`,
    updateSlider: `${BASE_URL}Slider/update/`, // Append ID
    deleteSlider: `${BASE_URL}Slider/delete/`, // Append ID
};

const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const loginUser = async (credentials) => {
    try {
        const response = await fetch(API_ENDPOINTS.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            const text = await response.text();
            console.error(`Non-JSON response from ${API_ENDPOINTS.login}:`, text.substring(0, 300));
            return {
                success: false,
                message: response.status === 404
                    ? "Login endpoint not found. Please check if the URL is correct."
                    : "Server returned an invalid response (HTML)."
            };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Network error" };
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(API_ENDPOINTS.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            const text = await response.text();
            console.error(`Non-JSON response from ${API_ENDPOINTS.register}:`, text.substring(0, 300));
            return {
                success: false,
                message: response.status === 404
                    ? "Registration endpoint not found."
                    : "Server returned an invalid response (HTML)."
            };
        }
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: "Network error" };
    }
};

export const fetchDashboardData = async () => {
    try {
        const headers = getHeaders();
        const fetchWithAuth = async (url) => {
            const res = await fetch(url, { headers });
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/auth'; // Force redirect on unauthorized
                throw new Error("Unauthorized");
            }
            return res.json();
        };

        const [ordersRes, usersRes, productsRes, bestSellingRes] = await Promise.all([
            fetchWithAuth(API_ENDPOINTS.orders),
            fetchWithAuth(API_ENDPOINTS.users),
            fetchWithAuth(API_ENDPOINTS.products),
            fetchWithAuth(API_ENDPOINTS.bestSelling)
        ]);

        // Process Orders
        const orders = ordersRes.data || [];
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);

        // Process Users
        const users = usersRes.data || [];
        const totalCustomers = users.length;

        // Process Products
        const products = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);
        const totalProducts = products.length;

        // Process Best Selling
        const topProducts = (bestSellingRes.data || bestSellingRes || []).slice(0, 5).map(p => ({
            name: p.title || p.name || 'Product',
            sales: p.totalSales || p.sold || 0,
            category: p.category || 'Perfume',
            img: p.images?.[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&q=80'
        }));

        return {
            totalOrders,
            totalCustomers,
            totalProducts,
            totalRevenue,
            recentOrders: orders.slice(0, 5),
            allOrders: orders,
            topProducts // From API
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return null;
    }
};

// --- Category Management APIs ---

export const fetchCategories = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.getCategories, { headers: getHeaders() });
        const res = await response.json();
        return res.data || [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await fetch(API_ENDPOINTS.createCategory, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(categoryData)
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, message: "Network error" };
    }
};

export const updateCategory = async (id, categoryData) => {
    try {
        const url = `${API_ENDPOINTS.updateCategory}${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || `Error: ${response.status}` };
        }

        return await response.json().catch(() => ({ success: true, message: "Updated successfully" }));
    } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, message: "Network error" };
    }
};

export const deleteCategory = async (id) => {
    try {
        const url = `${API_ENDPOINTS.deleteCategory}${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || `Error: ${response.status}` };
        }

        // Handle empty response body for 204 or 200 with no content
        return await response.json().catch(() => ({ success: true, message: "Deleted successfully" }));
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, message: "Network error" };
    }
};

export const updateOrderStatus = async (id, status) => {
    try {
        const url = `${BASE_URL}Order/status/${id}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            const text = await response.text();
            console.error("Non-JSON response:", text);
            return { success: false, message: "Server returned an error page" };
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, message: "Network error" };
    }
};

export const fetchSales = async () => {
    try {
        const response = await fetch(`${BASE_URL}Sale/active`, { headers: getHeaders() });
        if (!response.ok) {
            console.error(`Fetch failed with status: ${response.status}`);
            return [];
        }
        const text = await response.text();
        try {
            const res = JSON.parse(text);
            return res.data || [];
        } catch (e) {
            console.error("Server returned non-JSON response:", text.substring(0, 100));
            return [];
        }
    } catch (error) {
        console.error("Error fetching sales:", error);
        return [];
    }
};

export const createSale = async (saleData) => {
    try {
        const response = await fetch(API_ENDPOINTS.createSale, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(saleData)
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating sale:", error);
        return { success: false, message: "Network error" };
    }
};

export const deleteSale = async (id) => {
    try {
        const url = `${API_ENDPOINTS.deleteSale}${id}`;
        console.log("FINAL ATTEMPT - Full URL:", url);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });

        console.log("Response from server:", response.status);
        if (response.ok) return { success: true };
        return { success: false };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false };
    }
};

// --- Reports APIs ---

export const fetchSalesReport = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.salesReport, { headers: getHeaders() });
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error("Error fetching sales report:", error);
        return null;
    }
};

export const fetchMonthlyRevenue = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.monthlyRevenue, { headers: getHeaders() });
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        return [];
    }
};

export const fetchTopProductsReport = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.topProductsReport, { headers: getHeaders() });
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error("Error fetching top products report:", error);
        return [];
    }
};

// --- Analytics APIs ---

export const fetchAnalyticsOverview = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.analyticsOverview, { headers: getHeaders() });
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error("Error fetching analytics overview:", error);
        return null;
    }
};

export const fetchAnalyticsDailyOrders = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.analyticsDailyOrders, { headers: getHeaders() });
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error("Error fetching daily analytics:", error);
        return [];
    }
};

export const fetchAnalyticsMonthlyOrders = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.analyticsMonthlyOrders, { headers: getHeaders() });
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error("Error fetching monthly analytics:", error);
        return [];
    }
};

// --- Coupon APIs ---

export const fetchCoupons = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.getCoupons, { headers: getHeaders() });
        const res = await response.json();
        return res.data || [];
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
};

export const createCoupon = async (couponData) => {
    try {
        const response = await fetch(API_ENDPOINTS.createCoupon, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(couponData)
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating coupon:", error);
        return { success: false, message: "Network error" };
    }
};

export const updateCoupon = async (id, couponData) => {
    try {
        const url = `${API_ENDPOINTS.updateCoupon}${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(couponData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Update failed:", errorText);
            return { success: false, message: `Error ${response.status}: ${errorText}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating coupon:", error);
        return { success: false, message: "Network error" };
    }
};

export const deleteCoupon = async (id) => {
    try {
        const url = `${API_ENDPOINTS.deleteCoupon}${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return { success: false, message: "Network error" };
    }
};

// --- User Management APIs ---

export const fetchUsers = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.users, { headers: getHeaders() });
        const res = await response.json();
        return res.data || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const deleteUser = async (id) => {
    try {
        const url = `${API_ENDPOINTS.deleteUser}${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || `Error: ${response.status}` };
        }

        return await response.json().catch(() => ({ success: true, message: "User deleted successfully" }));
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Network error" };
    }
};

// --- Product Management APIs ---

export const fetchProducts = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.products, { headers: getHeaders() });
        const res = await response.json();
        return Array.isArray(res) ? res : (res.data || []);
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const fetchNewArrivals = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.newArrivals, { headers: getHeaders() });
        const res = await response.json();
        return Array.isArray(res) ? res : (res.data || []);
    } catch (error) {
        console.error("Error fetching new arrivals:", error);
        return [];
    }
};

export const createProduct = async (formData) => {
    try {
        const token = localStorage.getItem('adminToken');
        const headers = {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            // Note: Content-Type is omitted so browser sets it automatically with the boundary for FormData
        };
        const response = await fetch(API_ENDPOINTS.createProduct, {
            method: 'POST',
            headers,
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, message: "Network error" };
    }
};

export const deleteProduct = async (id) => {
    try {
        const url = `${API_ENDPOINTS.deleteProduct}${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || `Error: ${response.status}` };
        }

        return await response.json().catch(() => ({ success: true, message: "Deleted successfully" }));
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: "Network error" };
    }
};

export const updateProduct = async (id, formData) => {
    try {
        const token = localStorage.getItem('adminToken');
        const headers = {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            // Note: Content-Type is omitted so browser sets it automatically with the boundary for FormData
        };
        const response = await fetch(`${API_ENDPOINTS.updateProduct}${id}`, {
            method: 'PUT',
            headers,
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, message: "Network error" };
    }
};

export const fetchInventoryDashboard = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.getInventory, { headers: getHeaders() });
        const res = await response.json();
        return res.data || null;
    } catch (error) {
        console.error("Error fetching inventory dashboard:", error);
        return null;
    }
};

export const fetchLowProducts = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.lowProducts, { headers: getHeaders() });
        const res = await response.json();
        return res.data || res || [];
    } catch (error) {
        console.error("Error fetching low products:", error);
        return [];
    }
};

export const fetchLowVariants = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.lowVariants, { headers: getHeaders() });
        const res = await response.json();
        return res.data || res || [];
    } catch (error) {
        console.error("Error fetching low variants:", error);
        return [];
    }
};

export const fetchOutOfStock = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.outOfStock, { headers: getHeaders() });
        const res = await response.json();
        return res.data || res || [];
    } catch (error) {
        console.error("Error fetching out of stock:", error);
        return [];
    }
};

export const fetchFullInventory = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.allInventory, { headers: getHeaders() });
        const res = await response.json();
        return res.data || res || [];
    } catch (error) {
        console.error("Error fetching full inventory:", error);
        return [];
    }
};

// --- Slider Management APIs ---

export const fetchSliders = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.getSliders, { headers: getHeaders() });
        const res = await response.json();
        return res.data || [];
    } catch (error) {
        console.error("Error fetching sliders:", error);
        return [];
    }
};

export const createSlider = async (formData) => {
    try {
        const token = localStorage.getItem('adminToken');
        const headers = {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        const response = await fetch(API_ENDPOINTS.createSlider, {
            method: 'POST',
            headers,
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating slider:", error);
        return { success: false, message: "Network error" };
    }
};

export const updateSlider = async (id, formData) => {
    try {
        const token = localStorage.getItem('adminToken');
        const headers = {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        const response = await fetch(`${API_ENDPOINTS.updateSlider}${id}`, {
            method: 'PUT',
            headers,
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating slider:", error);
        return { success: false, message: "Network error" };
    }
};

export const deleteSlider = async (id) => {
    try {
        const url = `${API_ENDPOINTS.deleteSlider}${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || `Error: ${response.status}` };
        }

        return await response.json().catch(() => ({ success: true, message: "Deleted successfully" }));
    } catch (error) {
        console.error("Error deleting slider:", error);
        return { success: false, message: "Network error" };
    }
};

// --- Review APIs ---

export const fetchAllReviews = async () => {
    try {
        // Try getting all reviews directly first
        const response = await fetch(`${BASE_URL}Review/getAllReviews`, { headers: getHeaders() });
        if (response.ok) {
            const res = await response.json();
            if (res.data) return res.data;
        }
    } catch (e) {
        console.log("No getAllReviews endpoint, falling back to product iteration");
    }

    // Fallback: get all products and their reviews
    try {
        const products = await fetchProducts();
        if (!products || !products.length) return [];
        
        const reviewPromises = products.map(async (product) => {
            const prodId = product._id || product.id;
            if (!prodId) return [];
            try {
                const res = await fetch(`${BASE_URL}Review/getReviews/${prodId}`, { headers: getHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    const reviews = data.data || (Array.isArray(data) ? data : []);
                    // Attach product info so we can display it in the review list
                    return Array.isArray(reviews) ? reviews.map(r => ({ ...r, product })) : [];
                }
                return [];
            } catch (err) {
                return [];
            }
        });
        
        const reviewsArrays = await Promise.all(reviewPromises);
        let allReviews = [];
        reviewsArrays.forEach(arr => {
            if (Array.isArray(arr)) {
                allReviews = allReviews.concat(arr);
            }
        });
        
        // Sort by newest first
        return allReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
        console.error("Error fetching all reviews via fallback:", error);
        return [];
    }
};

export const deleteReview = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}Review/deleteReview/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || `Error: ${response.status}` };
        }

        return await response.json().catch(() => ({ success: true, message: "Deleted successfully" }));
    } catch (error) {
        console.error("Error deleting review:", error);
        return { success: false, message: "Network error" };
    }
};

