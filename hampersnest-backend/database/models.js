import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

// 1. User (Admin) Model
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Admin' // Super Admin, Admin, Manager
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  permissions: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('permissions');
      if (!val) return null;
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return null; }
    },
    set(val) {
      this.setDataValue('permissions', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  }
}, {
  tableName: 'users',
  timestamps: true
});

// 2. Product Model
export const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    unique: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discountPrice: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  originalPrice: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('images');
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('images', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  videoUrls: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('videoUrls');
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('videoUrls', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  masterCategory: {
    type: DataTypes.STRING,
    defaultValue: 'Traditional'
  },
  subCategory: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  occasion: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('tags');
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('tags', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  customization: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('customization');
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('customization', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  shipping: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('shipping');
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('shipping', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  availableQuantity: {
    type: DataTypes.VIRTUAL,
    get() {
      const stock = this.getDataValue('stockQuantity') || 0;
      const reserved = this.getDataValue('reservedQuantity') || 0;
      return stock - reserved;
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 4.5
  },
  description: {
    type: DataTypes.TEXT
  },
  shortDescription: {
    type: DataTypes.TEXT
  },
  details: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('details');
      if (!val) return [];
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('details', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  customGiftTagEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  addonsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  customizationText: {
    type: DataTypes.TEXT,
    defaultValue: 'Make your gift extra special by adding a custom gift tag and selecting add-ons.'
  },
  deliveryInfoText: {
    type: DataTypes.TEXT,
    defaultValue: 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

// 3. Order Model
export const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customer: {
    type: DataTypes.BLOB, // Contains Name, Phone, Email, Delivery Address, City
    allowNull: false,
    get() {
      const val = this.getDataValue('customer');
      if (!val) return {};
      try {
        return typeof val === 'string' ? JSON.parse(val) : JSON.parse(val.toString('utf8'));
      } catch(e) { return {}; }
    },
    set(val) {
      this.setDataValue('customer', Buffer.from(JSON.stringify(val || {})));
    }
  },
  items: {
    type: DataTypes.BLOB,
    allowNull: false,
    get() {
      const val = this.getDataValue('items');
      if (!val) return [];
      try {
        return typeof val === 'string' ? JSON.parse(val) : JSON.parse(val.toString('utf8'));
      } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('items', Buffer.from(JSON.stringify(val || [])));
    }
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  budget: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryDate: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  internalNotes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  history: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('history');
      if (!val) return [];
      try {
        return typeof val === 'string' ? JSON.parse(val) : val;
      } catch(e) { return []; }
    },
    set(val) {
      this.setDataValue('history', typeof val === 'string' ? val : JSON.stringify(val || []));
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending' // Pending, Confirmed, Processing, Packed, Shipped, Delivered, Cancelled
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'Website' // Website, WhatsApp, Instagram, Facebook, Walk-In Customer, Phone Call, Exhibition/Event, Referral, Other
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Pending' // Pending, Partially Paid, Paid
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  advancePaid: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'orders',
  timestamps: true
});

// 4. Inquiry (Contact Message) Model
export const Inquiry = sequelize.define('Inquiry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  eventType: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  budget: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  subject: {
    type: DataTypes.STRING,
    defaultValue: 'Custom Gifting Inquiry'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'New' // New, Contacted, In Progress, Converted, Closed
  },
  leadNotes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  assignedAdmin: {
    type: DataTypes.STRING,
    defaultValue: 'Unassigned'
  },
  history: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'inquiries',
  timestamps: true
});

// 5. Setting Model
export const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// 6. Gallery Item Model
export const GalleryItem = sequelize.define('GalleryItem', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  fileSize: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  dimensions: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  mediaType: {
    type: DataTypes.STRING,
    defaultValue: 'Image'
  },
  width: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  height: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'gallery_items',
  timestamps: true
});

// 7. Category Model
export const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  timestamps: true
});

// 8. Audit Log Model
export const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  adminUser: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false // Audit logs generally just need createdAt
});

// 9. Hero Banner Model
export const HeroBanner = sequelize.define('HeroBanner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Main Homepage Hero'
  },
  mainImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  floatingImageTop: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  floatingImageBottom: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hero_banners',
  timestamps: true
});

// 10. Testimonial Model
export const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quote: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  event: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'testimonials',
  timestamps: true
});

// 11. Category Showcase Model (for Homepage)
export const CategoryShowcase = sequelize.define('CategoryShowcase', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'fa-solid fa-gift'
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  targetCollection: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'category_showcase',
  timestamps: true
});

// Associations
Category.hasMany(Product, { foreignKey: 'category', sourceKey: 'id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category', targetKey: 'id', as: 'categoryDetails' });

// Self-referencing association for sub-categories
Category.hasMany(Category, { as: 'subCategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parentCategory', foreignKey: 'parentId' });
