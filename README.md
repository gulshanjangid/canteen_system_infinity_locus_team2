# Canteen Ordering System

A full-stack web application for managing canteen orders with real-time inventory control and automatic order cancellation.

## Features

- **Menu Management**: Create, read, update, and delete menu items with stock tracking
- **Real-time Inventory**: Stock is locked when items are added to cart and restored on cancellation
- **Order Management**: Place orders with 15-minute auto-cancellation for unconfirmed orders
- **Order History**: View all past and current orders with status tracking
- **Admin Dashboard**: Manage menu items and view order statistics
- **Responsive UI**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **React Context** - State management for cart

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **node-cron** - Scheduled tasks for auto-cancellation
- **Zod** - Schema validation
- **Multer** - File upload handling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteen_project_il
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd codebase/backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up MongoDB**
   - Ensure MongoDB is running on `localhost:27017`
   - No replica set configuration required

4. **Environment Setup**
   
   **Backend** (create `codebase/backend/.env`):
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/canteen
   NODE_ENV=development
   ```

   **Frontend** (create `codebase/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
   ```

## Running the Application

1. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

2. **Start the Backend**
   ```bash
   cd codebase/backend
   npm run dev
   ```
   Backend will be available at `http://localhost:4000`

3. **Start the Frontend**
   ```bash
   cd codebase/frontend
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

## API Endpoints

### Menu Management
- `GET /api/menu` - Get public menu items
- `GET /api/admin/menu` - Get all menu items (admin)
- `POST /api/admin/menu` - Create menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item (soft delete)

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/confirm` - Confirm order
- `POST /api/orders/:id/complete` - Mark order as completed
- `GET /api/orders/history` - Get order history

### Admin
- `POST /api/admin/upload` - Upload image file
- `POST /api/admin/jobs/run-cancellations` - Manually trigger auto-cancellation

## Key Features Explained

### Inventory Locking
- When a user adds an item to cart, stock is immediately decremented
- If the order expires (15 minutes) or is cancelled, stock is restored
- Prevents overselling of limited items

### Auto-Cancellation
- Orders automatically expire after 15 minutes if not confirmed
- Cron job runs every minute to check for expired orders
- Expired orders are marked as "FAILED" and stock is restored

### Order Status Flow
1. **PENDING** - Order placed, waiting for confirmation
2. **CONFIRMED** - Order confirmed by staff
3. **COMPLETED** - Order ready for pickup
4. **FAILED** - Order expired or cancelled

## Project Structure

```
canteen_project_il/
├── codebase/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── models/          # MongoDB models
│   │   │   ├── routes/          # API routes
│   │   │   ├── startup/         # App initialization
│   │   │   └── server.ts        # Main server file
│   │   ├── uploads/             # File uploads
│   │   └── package.json
│   └── frontend/
│       ├── app/                 # Next.js App Router
│       ├── components/          # React components
│       ├── context/             # React Context
│       ├── lib/                 # Utilities
│       ├── types/               # TypeScript types
│       └── package.json
└── README.md
```

## Development

### Adding New Features
1. Backend: Add routes in `codebase/backend/src/routes/`
2. Frontend: Add components in `codebase/frontend/components/`
3. Update types in `codebase/frontend/types/index.ts`

### Database Schema

**MenuItems Collection:**
```typescript
{
  _id: string (UUID)
  name: string
  description: string
  price_paise: number (stored in paise for precision)
  stock_count: number
  is_available: boolean
  image_url?: string
  is_deleted: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}
```

**Orders Collection:**
```typescript
{
  _id: string (UUID)
  client_id?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed'
  items: Array<{
    menu_item_id: string
    name: string
    quantity: number
    price_paise: number
  }>
  total_price_paise: number
  created_at: Date
  expires_at: Date
  updated_at: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.
