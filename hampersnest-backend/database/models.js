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
  videoUrls: {
    type: DataTypes.JSON,
    defaultValue: []
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
    type: DataTypes.JSON,
    defaultValue: []
  },
  customization: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  shipping: {
    type: DataTypes.JSON,
    defaultValue: []
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
    type: DataTypes.JSON,
    defaultValue: []
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
    type: DataTypes.JSON, // Contains Name, Phone, Email, Delivery Address, City
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
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
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending' // Pending, Confirmed, Processing, Packed, Shipped, Delivered, Cancelled
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
    allowNull: false
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

// Associations
Category.hasMany(Product, { foreignKey: 'category', sourceKey: 'id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category', targetKey: 'id', as: 'categoryDetails' });

// Self-referencing association for sub-categories
Category.hasMany(Category, { as: 'subCategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parentCategory', foreignKey: 'parentId' });
