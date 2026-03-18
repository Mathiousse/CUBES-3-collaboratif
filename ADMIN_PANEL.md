# Admin Panel - Menu Management

## Overview

The admin panel allows administrators to manage menu items for the food delivery platform.

## Features

- **View all menu items** - Grid display with name, description, and price
- **Add new items** - Create new menu items with name, description, and price
- **Edit existing items** - Update any menu item details
- **Delete items** - Remove items from the menu

## Access

### Creating an Admin User

Run the following command to create an admin user:

```bash
npm run create-admin
```

**Default Credentials:**
- Email: `admin@admin.com`
- Password: `admin123`

**Note:** Change these credentials in production!

### Logging In

1. Go to the frontend application (http://localhost:3000)
2. Login with admin credentials
3. You will be redirected to the Admin Dashboard

## API Endpoints

The admin panel uses the Logistics API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logistique/menu-items` | Get all menu items |
| POST | `/api/logistique/menu-items` | Create new menu item |
| PUT | `/api/logistique/menu-items/:id` | Update menu item |
| DELETE | `/api/logistique/menu-items/:id` | Delete menu item |

### Request Body (POST/PUT)

```json
{
  "name": "Classic Burger",
  "description": "Juicy beef patty with fresh vegetables",
  "price": 12.99
}
```

## Architecture

```
Frontend (React)
    ↓
API Gateway (Express)
    ↓
Logistics API (Symfony + PostgreSQL)
```

## Files Modified

1. `logistique-api/src/Controller/MenuController.php` - Added CRUD endpoints
2. `frontend/src/components/AdminDashboard.js` - New admin component
3. `frontend/src/styles/AdminDashboard.css` - Admin styling
4. `frontend/src/App.js` - Added ADMIN role routing
5. `scripts/create-admin.js` - Admin user creation script
6. `package.json` - Added create-admin script
