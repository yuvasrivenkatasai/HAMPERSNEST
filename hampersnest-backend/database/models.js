import mongoose from 'mongoose';

// 1. User (Admin) Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
}, { timestamps: true });

// 2. Product Schema
const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  masterCategory: {
    type: String,
    trim: true,
    default: 'Traditional'
  },
  customization: {
    type: [String],
    default: []
  },
  shipping: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  description: {
    type: String,
    trim: true
  },
  details: {
    type: [String],
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// 3. Order Schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  items: [
    {
      productId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      customizations: {
        wrappingStyle: {
          type: String,
          default: 'Standard'
        },
        ribbonColor: {
          type: String,
          default: 'None'
        },
        giftTag: {
          type: String,
          default: ''
        }
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  eventType: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered'],
    default: 'Pending'
  }
}, { timestamps: true });

// 4. Inquiry (Contact Message) Schema
const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  eventType: {
    type: String,
    trim: true,
    default: 'General'
  },
  quantity: {
    type: Number,
    default: 10
  },
  subject: {
    type: String,
    trim: true,
    default: 'Custom Gifting Inquiry'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Read', 'Unread'],
    default: 'Unread'
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Inquiry = mongoose.model('Inquiry', inquirySchema);

// 5. Settings Schema
const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

export const Setting = mongoose.model('Setting', settingSchema);

// 6. Gallery Item Schema
const galleryItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

