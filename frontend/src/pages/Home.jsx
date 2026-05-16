import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search } from 'lucide-react';

const API_URL = 'http://localhost:5001';

const categoryEmojis = {
  burger: '🍔',
  pizza: '🍕',
  biryani: '🍚',
  pasta: '🍝',
  momos: '🥟',
  fries: '🍟',
  sandwich: '🥪',
  wrap: '🌯',
  noodles: '🍜',
  drink: '🥤',
  dessert: '🍫',
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const handleCategoryFilter = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    if (cat === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === cat));
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setActiveCategory('all');
    if (!query.trim()) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h1>
          Delicious Food, <span className="highlight">Delivered Fast</span>
        </h1>
        <p>
          Order from our handcrafted menu or just chat with our AI assistant —
          it can take your order, suggest food, and track deliveries!
        </p>

        {/* Search Bar */}
        <div
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#747d8c',
            }}
          />
          <input
            type="text"
            placeholder="Search for burgers, pizza, biryani..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#16213e',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2 className="section-title">Browse by Category</h2>
        <div className="category-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(cat)}
            >
              <span className="emoji">{cat === 'all' ? '🍽️' : categoryEmojis[cat] || '🍴'}</span>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <h2 className="section-title">
          {activeCategory === 'all'
            ? 'Our Full Menu'
            : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}{' '}
          <span style={{ color: '#747d8c', fontWeight: 400, fontSize: '1rem' }}>
            ({filteredProducts.length} items)
          </span>
        </h2>

        {loading ? (
          <p style={{ color: '#747d8c', textAlign: 'center', padding: '3rem' }}>
            Loading menu...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: '#747d8c', textAlign: 'center', padding: '3rem' }}>
            No items found. Try a different search!
          </p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-card-img"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                  }}
                />
                <div className="product-card-body">
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-desc">{product.description}</p>
                  <div className="product-card-footer">
                    <span className="product-price">₹{product.price}</span>
                    <button className="add-btn">
                      <ShoppingCart size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
