import React, { useState, useEffect } from 'react';
import { 
  PageType, Product, Category, CartItem, Order, Coupon, OrderStatus, BlogPost 
} from './types';
import { PRODUCTS, BLOGS } from './data';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Component imports
import Header from './components/Header';
import AuthGate from './components/AuthGate';
import FloatingWidgets from './components/FloatingWidgets';
import LiveChat from './components/LiveChat';
import QuickViewModal from './components/QuickViewModal';
import DynamicIcon from './components/DynamicIcon';

// Pages imports
import Home from './pages/Home';
import Shop from './pages/Shop';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import Legal from './pages/Legal';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Dashboard from './pages/Dashboard';
import ProductDetails from './pages/ProductDetails';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeProductId, setActiveProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Search parameters relayed to Shop
  const [searchQuery, setSearchQuery] = useState('');

  // Cart Local Persistence block
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('accstorex_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist Local Persistence block
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('accstorex_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Global Orders database pre-seeded with some realistic sample history
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('accstorex_orders');
    if (saved) return JSON.parse(saved);

    // Default pre-seeded test orders
    const seedOrders: Order[] = [
      {
        id: 'ORD-88401',
        date: '2026-05-18',
        items: [
          {
            id: 'fb-ads-seed',
            product: PRODUCTS[0], // Buy Facebook Ads Account
            quantity: 1
          }
        ],
        total: 49.99,
        status: 'delivered',
        email: 'mjjahan854@gmail.com',
        paymentMethod: 'CRYPTO',
        trackingId: 'ATX-882740'
      },
      {
        id: 'ORD-11520',
        date: '2026-05-20',
        items: [
          {
            id: 'bulk-gmail-seed',
            product: PRODUCTS[10], // Buy Gmail Accounts Bulk
            quantity: 1
          }
        ],
        total: 15.00,
        status: 'delivered',
        email: 'mjjahan854@gmail.com',
        paymentMethod: 'CARD',
        trackingId: 'ATX-191025'
      }
    ];
    localStorage.setItem('accstorex_orders', JSON.stringify(seedOrders));
    return seedOrders;
  });

  // Admin dynamic Coupons database
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);

  // User session state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('accstorex_user_email') || null;
  });

  // Synchronize dynamic products array to support listing updates
  const [activeCatalog, setActiveCatalog] = useState<Product[]>(() => {
    const saved = localStorage.getItem('accstorex_catalog');
    if (saved) return JSON.parse(saved);
    return PRODUCTS;
  });

  // Synchronize blog posts
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('accstorex_blogs');
    if (saved) return JSON.parse(saved);
    return BLOGS;
  });

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('accstorex_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('accstorex_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('accstorex_orders', JSON.stringify(orders));
  }, [orders]);

  // Hash Routing Logic Sync
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      
      const validPages: PageType[] = [
        'home', 'shop', 'about-us', 'contact-us', 'blog', 'faq', 
        'dashboard', 'cart', 'checkout', 'order-tracking', 'privacy-policy', 'terms', 'product-details', 'admin-login'
      ];
      
      if (rawHash.startsWith('product/')) {
        const id = rawHash.replace('product/', '');
        setActiveProductId(id);
        setCurrentPage('product-details');
      } else if (validPages.includes(rawHash as PageType)) {
        setCurrentPage(rawHash as PageType);
      } else if (!window.location.hash) {
        setCurrentPage('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Trigger on initial check
    if (window.location.hash) {
      handleHashChange();
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (target: string) => {
    window.location.hash = target;
    const validPages: PageType[] = [
      'home', 'shop', 'about-us', 'contact-us', 'blog', 'faq', 
      'dashboard', 'cart', 'checkout', 'order-tracking', 'privacy-policy', 'terms', 'product-details', 'admin-login'
    ];
    if (validPages.includes(target as PageType)) {
      setCurrentPage(target as PageType);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { id: `item-${Date.now()}`, product, quantity: qty }];
    });
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Admin order triggers
  const handleCreateOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleAdminCreateProduct = (p: Product) => {
    setActiveCatalog(prev => {
      const updated = [p, ...prev];
      localStorage.setItem('accstorex_catalog', JSON.stringify(updated));
      return updated;
    });
    // Inject dynamically into baseline
    PRODUCTS.unshift(p);
  };

  const handleAdminUpdateProduct = (p: Product) => {
    setActiveCatalog(prev => {
      const updated = prev.map(item => item.id === p.id ? p : item);
      localStorage.setItem('accstorex_catalog', JSON.stringify(updated));
      return updated;
    });
    const idx = PRODUCTS.findIndex(item => item.id === p.id);
    if (idx !== -1) {
      PRODUCTS[idx] = p;
    }
  };

  const handleAdminCreateBlog = (newBlog: BlogPost) => {
    setBlogs(prev => {
      const updated = [newBlog, ...prev];
      localStorage.setItem('accstorex_blogs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAdminUpdateBlog = (updatedBlog: BlogPost) => {
    setBlogs(prev => {
      const updated = prev.map(b => b.id === updatedBlog.id ? updatedBlog : b);
      localStorage.setItem('accstorex_blogs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAdminDeleteBlog = (blogId: string) => {
    setBlogs(prev => {
      const updated = prev.filter(b => b.id !== blogId);
      localStorage.setItem('accstorex_blogs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('accstorex_user_email', email);
    setCurrentUserEmail(email);
    if (email.toLowerCase() === 'mjjahan854@gmail.com') {
      navigateTo('dashboard');
    } else {
      navigateTo('home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accstorex_user_email');
    localStorage.removeItem('accstorex_user_name');
    setCurrentUserEmail(null);
  };

  const handleAdminCreateCoupon = (coupon: Coupon) => {
    setAdminCoupons(prev => [coupon, ...prev]);
  };

  const handleAdminUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status } : o
    ));
  };

  // Declaring active user details
  const currentUserName = currentUserEmail 
    ? (currentUserEmail === 'mjjahan854@gmail.com' ? 'M. Jahan (Admin)' : (localStorage.getItem('accstorex_user_name') || 'Valued Client'))
    : null;
  const userObject = currentUserEmail && currentUserName 
    ? { email: currentUserEmail, name: currentUserName } 
    : null;

  return (
    <div className="bg-[#F9FAFB] text-[#111827] min-h-screen flex flex-col justify-between font-sans selection:bg-blue-650/10 selection:text-blue-600">
      
      {/* 1. Header sticky navigation bar */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        cart={cart}
        wishlist={wishlist}
        onSearchChange={setSearchQuery}
        currentUser={userObject}
        onLogout={handleLogout}
      />

      {/* 2. Main Page Router switcher (strictly client-side) */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home
            onNavigate={navigateTo}
            onQuickView={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onSearchChange={(q) => { setSearchQuery(q); navigateTo('shop'); }}
          />
        )}

        {currentPage === 'shop' && (
          <Shop
            onQuickView={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            initialSearchQuery={searchQuery}
          />
        )}

        {currentPage === 'about-us' && (
          <AboutUs onNavigate={navigateTo} />
        )}

        {currentPage === 'contact-us' && (
          <ContactUs />
        )}

        {currentPage === 'blog' && (
          <Blog blogsList={blogs} />
        )}

        {currentPage === 'faq' && (
          <FAQ />
        )}

        {(currentPage === 'privacy-policy' || currentPage === 'terms') && (
          <Legal />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            cart={cart}
            onNavigate={navigateTo}
            onClearCart={handleClearCart}
            onCreateOrder={handleCreateOrder}
            adminCoupons={adminCoupons}
          />
        )}

        {currentPage === 'order-tracking' && (
          <OrderTracking
            ordersList={orders}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'dashboard' && (
          currentUserEmail ? (
            <Dashboard
              ordersList={orders}
              onNavigate={navigateTo}
              onAdminCreateProduct={handleAdminCreateProduct}
              onAdminUpdateProduct={handleAdminUpdateProduct}
              onAdminCreateCoupon={handleAdminCreateCoupon}
              onAdminUpdateOrderStatus={handleAdminUpdateOrderStatus}
              adminCoupons={adminCoupons}
              currentUserEmail={currentUserEmail}
              activeCatalog={activeCatalog}
              blogsList={blogs}
              onAdminCreateBlog={handleAdminCreateBlog}
              onAdminUpdateBlog={handleAdminUpdateBlog}
              onAdminDeleteBlog={handleAdminDeleteBlog}
            />
          ) : (
            <div className="max-w-md mx-auto py-8">
              <AuthGate onLoginSuccess={handleLoginSuccess} />
            </div>
          )
        )}

        {currentPage === 'admin-login' && (
          <div className="max-w-md mx-auto py-8">
            <AuthGate onLoginSuccess={handleLoginSuccess} isAdminMode={true} />
          </div>
        )}

        {currentPage === 'product-details' && (
          <ProductDetails
            productId={activeProductId}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* 3. Global Floating support and livechat bots */}
      <FloatingWidgets />
      <LiveChat />

      {/* 4. Quick View popup modal slot */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 5. Professional Corporate Footer */}
      <footer className="bg-white border-t border-gray-250 pt-16 pb-8 text-xs text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Logo Details Column (4/12) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-black text-xl">A</div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#111827] to-[#2563EB]">AccStoreX</span>
            </div>
            
            <p className="text-[11px] leading-relaxed text-gray-400 max-w-sm">
              Standard agency partner for aged advertising profiles, KYC digital payment gateways, high limit cryptocurrency exchange accounts, and deliverable SOCKS5 SMTP networks.
            </p>

            <div className="text-[10px] font-mono tracking-wider font-bold text-gray-400">
              © 2026 AccStoreX. BRAND REGISTRY accstorex.com
            </div>
          </div>

          {/* Page Quick Links (2/12) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-sm font-bold text-gray-900 tracking-wide mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left font-medium">
                  Homepage
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left font-medium">
                  Shop Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('order-tracking')} className="hover:text-blue-650 text-gray-505 transition-colors cursor-pointer text-left font-medium">
                  Track Delivery 🚀
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('blog')} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left font-medium">
                  Insights & Guides
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact-us')} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left font-medium">
                  Direct Support
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Shortcuts Quick Filter list (3/12) */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-sm font-bold text-gray-900 tracking-wide mb-4">Core Categories</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <button onClick={() => { setSearchQuery('cat:ads-accounts'); navigateTo('shop'); }} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left">
                  • Ads Accounts (Aged BM)
                </button>
              </li>
              <li>
                <button onClick={() => { setSearchQuery('cat:payment-accounts'); navigateTo('shop'); }} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left">
                  • Verified Payment Gateways
                </button>
              </li>
              <li>
                <button onClick={() => { setSearchQuery('cat:crypto-accounts'); navigateTo('shop'); }} className="hover:text-blue-65s text-gray-505 transition-colors cursor-pointer text-left">
                  • KYC Crypto Accounts
                </button>
              </li>
              <li>
                <button onClick={() => { setSearchQuery('cat:email-accounts'); navigateTo('shop'); }} className="hover:text-blue-605 text-gray-505 transition-colors cursor-pointer text-left">
                  • Bulk Aged Gmail PVA
                </button>
              </li>
              <li>
                <button onClick={() => { setSearchQuery('cat:social-accounts'); navigateTo('shop'); }} className="hover:text-blue-650 text-gray-505 transition-colors cursor-pointer text-left">
                  • Social Profiles PVA
                </button>
              </li>
            </ul>
          </div>

          {/* Secure details and contact channels (3/12) */}
          <div className="lg:col-span-3 text-left space-y-4">
            <h4 className="text-sm font-bold text-gray-900 tracking-wide mb-1">Contact Office</h4>
            
            <div className="space-y-2 text-[11px] leading-relaxed text-gray-450">
              <p>
                <strong className="text-gray-700 block text-xs">Telegram Operator Care:</strong>
                <a href="https://t.me/EgSupport24" target="_blank" referrerPolicy="no-referrer" className="text-[#2563EB] hover:underline font-bold">@EgSupport24</a>
              </p>
              
              <p>
                <strong className="text-gray-700 block text-xs">WhatsApp Carrier Support:</strong>
                <a href="https://wa.me/13073939979" target="_blank" referrerPolicy="no-referrer" className="text-emerald-600 hover:underline font-bold">+1 (307) 393-9979</a>
              </p>

              <p>
                <strong className="text-gray-700 block text-xs">Administrative Corporate Address:</strong>
                <span className="text-gray-500">AccStoreX, 30 N Gould St, Suite R, Sheridan, WY 82801, USA</span>
              </p>
            </div>
          </div>

        </div>

        {/* Payment badges lines */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-gray-150 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-gray-400 font-bold font-mono tracking-wider text-[10px]">
            <span>CREDIT CARD</span>
            <span>•</span>
            <span>WIRE TRANSFER</span>
            <span>•</span>
            <span>BITCOIN ETH USDT ERC20</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono flex-wrap">
            <button onClick={() => navigateTo('privacy-policy')} className="hover:text-blue-600 font-bold text-gray-400 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <span className="text-gray-200">•</span>
            <button onClick={() => navigateTo('terms')} className="hover:text-blue-600 font-bold text-gray-400 transition-colors transition-all cursor-pointer">
              Terms & Conditions
            </button>
            <span className="text-gray-200">•</span>
            <button id="footer-admin-login-link" onClick={() => navigateTo('admin-login')} className="hover:text-blue-650 font-black text-blue-500 hover:underline transition-colors cursor-pointer flex items-center gap-1">
              👑 Admin Login Gateway
            </button>
          </div>
        </div>

      </footer>

      {/* Vercel Speed Insights */}
      <SpeedInsights />

    </div>
  );
}
