Good Food MVP - Comprehensive Project Context & Summary
PROJECT CONTEXT
Business Domain
Good Food is a food delivery platform MVP (Minimum Viable Product) - similar to UberEats or DoorDash. It connects:
Customers who want to order food for home delivery
Delivery Persons who pick up and deliver orders
Restaurant (Good Food) that provides the menu and fulfills orders
Core User Flows
Customer Journey: Browse menu → Add items to cart → Enter delivery address → Pay with Stripe → Track order status
Delivery Person Journey: View available orders → Claim an order → See route on map → Update delivery status → View delivery history
Business Requirements
French market focus (all UI in French, French address system)
Real payment processing (Stripe integration)
Real-time routing and mapping for deliveries
Role-based access (customers can't claim orders, delivery persons can't place orders)
TECHNICAL ARCHITECTURE
Architecture Pattern
Microservices with containerization:
Each service is independent, communicates via REST APIs
API Gateway as single entry point
Event-driven architecture foundation (RabbitMQ for future scaling)
Technology Stack
Frontend
Framework: React 19
Styling: Custom CSS
HTTP Client: Axios
Payment: Stripe.js, @stripe/react-stripe-js
Mapping: Leaflet, React-Leaflet
Routing: OSRM (Open Source Routing Machine) for turn-by-turn directions
Geolocation: French Government's API Adresse for address autocomplete
Backend Services
1. Auth API (Node.js/Express + MongoDB)
Port: 3001
Responsibilities: User registration, authentication, JWT token generation
User roles: CUSTOMER, DELIVERY_PERSON
Password hashing: bcryptjs
2. Commande API (Orders) (Node.js/Express + MongoDB)
Port: 3003
Responsibilities: Order creation, order management, Stripe payment intent creation
Features: Role-based order filtering, delivery assignment, status tracking
Order statuses: PENDING → AWAITING_PICKUP → IN_TRANSIT → DELIVERED
3. Logistique API (Logistics/Menu) (Symfony 7 + PostgreSQL)
Port: 80 (Apache)
Responsibilities: Menu item management, health checks
Migration Note: Originally Node.js/MongoDB, migrated to Symfony/PHP for demonstration of polyglot microservices
Features: Doctrine ORM, NelmioCorsBundle, database seeding
4. API Gateway (Node.js/Express)
Port: 8080
Responsibilities: Request routing, CORS handling, proxy to microservices
Special handling: Direct proxy for French Address API to avoid CORS issues
Databases
auth-db: MongoDB for user data
commande-db: MongoDB for orders
logistique-db: PostgreSQL for menu items
Infrastructure
Docker & Docker Compose: All services containerized
RabbitMQ: Message broker (ready for future event-driven features, not actively used yet)
PROJECT STRUCTURE
CUBES-3-collaboratif/├── docker-compose.yml          # Orchestrates all services├── .gitignore                  # Ignores node_modules, .env, etc.├── package.json               # Root scripts for testing├── test-integration.js        # E2E backend tests├── test-frontend-e2e.js       # E2E frontend tests│├── auth-api/│   ├── Dockerfile│   ├── index.js               # Express server│   ├── models/User.js         # Mongoose schema│   ├── routes/auth.js         # /register, /login│   ├── middleware/authMiddleware.js│   ├── tests/auth.test.js     # Jest/Supertest tests│   └── .env                   # JWT_SECRET, MONGO_URI│├── commande-api/│   ├── Dockerfile│   ├── index.js               # Express server│   ├── models/Order.js        # Mongoose schema (with quantity, addressDetails)│   ├── routes/orders.js       # Create, claim, update, fetch orders│   ├── middleware/authMiddleware.js│   ├── tests/orders.test.js│   └── .env                   # JWT_SECRET, MONGO_URI, STRIPE_SECRET_KEY│├── logistique-api/│   ├── Dockerfile             # PHP 8.2-Apache, Composer, PostgreSQL│   ├── composer.json          # Symfony dependencies│   ├── public/index.php       # Symfony front controller│   ├── src/│   │   ├── Kernel.php│   │   ├── Entity/MenuItem.php│   │   ├── Controller/MenuController.php│   │   └── Command/SeedDatabaseCommand.php│   ├── config/│   │   ├── bundles.php│   │   ├── services.yaml│   │   ├── routes.yaml│   │   └── packages/│   │       ├── doctrine.yaml│   │       ├── framework.yaml│   │       └── nelmio_cors.yaml│   ├── migrations/            # Doctrine migrations│   ├── init-db.sh            # Database initialization script│   └── backup-node-js/       # Original Node.js implementation│├── api-gateway/│   ├── Dockerfile│   ├── index.js              # Proxy to all services + direct address API handler│   └── .env                  # URLs for all backend services│└── frontend/    ├── Dockerfile    ├── package.json          # React, Leaflet, Stripe, Testing Library    ├── public/    └── src/        ├── index.js          # React root (StrictMode disabled for Leaflet)        ├── App.js            # Main component, role-based routing        ├── services/api.js   # Axios instance with JWT        ├── components/        │   ├── Auth.js                    # Login/Register (French)        │   ├── CustomerDashboard.js       # Menu, cart, orders (French)        │   ├── DeliveryDashboard.js       # Order claiming, status updates (French)        │   ├── CheckoutForm.js            # Stripe payment (French)        │   ├── AddressAutocomplete.js     # French address search        │   ├── DeliveryMap.js             # OSRM routing, fetches route data        │   └── MapWrapper.js              # Leaflet lifecycle management        └── styles/            ├── Auth.css            ├── CustomerDashboard.css            ├── DeliveryDashboard.css            ├── CheckoutForm.css            ├── AddressAutocomplete.css            └── DeliveryMap.css
KEY FEATURES IMPLEMENTED
1. Authentication & Authorization
JWT-based authentication
Role-based access control (CUSTOMER, DELIVERY_PERSON)
Middleware validates tokens on protected routes
Tokens stored in localStorage, sent via x-auth-token or Authorization: Bearer
2. Menu & Ordering
Menu items fetched from Symfony API
Shopping cart with quantity management
Price calculations
Order history with active/past filtering
3. Payment Processing
Stripe Payment Intents API
Test mode with publishable and secret keys
Payment confirmation before order creation
Client-secret returned for frontend processing
4. Delivery Management
Delivery persons can see all PENDING orders
Claim orders (sets deliveryPersonId)
Update status through workflow: PENDING → AWAITING_PICKUP → IN_TRANSIT → DELIVERED
Separate tabs for active and completed deliveries
5. French Address System
Integration with api-adresse.data.gouv.fr (French government API)
Real-time autocomplete suggestions
Structured address data: street, city, postalCode, coordinates (lat/lon)
Geocoding for accurate delivery locations
6. Interactive Delivery Maps
Leaflet for map rendering (CartoDB Light theme for clarity)
Restaurant marker (🍔 red) and delivery marker (📍 blue)
Automatic routing via OSRM (router.project-osrm.org)
Polyline route visualization
Distance and duration calculations
Map bounds auto-fit to show entire route
7. Testing Infrastructure
Unit Tests: Jest + Supertest for backend services
Integration Tests: E2E scripts testing full user flows
Frontend Tests: React Testing Library for component testing
Test coverage reporting available
CRITICAL TECHNICAL DECISIONS & FIXES
1. Leaflet Lifecycle Management ⚠️ MOST COMPLEX ISSUE
Problem: "Map container is already initialized" error
Root Causes:
React Strict Mode double-mounting components in development
Leaflet requires a unique DOM element per map instance
React's reconciliation reusing DOM nodes
Solution:
Disabled <React.StrictMode> in frontend/src/index.js
Created MapWrapper.js component that:
Uses timestamp-based key to force new instances: useState(Date.now())
Creates unique DOM id for each map: map-container-${mapKey}
Handles all Leaflet initialization
DeliveryMap.js focuses on data fetching, passes props to MapWrapper
2. OSRM Route Fetching Loop Prevention
Problem: Infinite API calls causing rate limiting
Root Cause: useEffect dependency on object references (deliveryLocation, restaurantLocation) creating new references every render
Solution: Changed dependency to order._id (stable primitive):
useEffect(() => {  fetchRoute();}, [order._id]); // Only fetch when order changes!
3. API Gateway Address Proxy
Problem: 404 errors when calling /api/address/search
Root Cause: http-proxy-middleware misconfiguration
Solution: Replaced middleware with direct Express handler:
app.get('/api/address/search', async (req, res) => {  const response = await axios.get('https://api-adresse.data.gouv.fr/search', {    params: req.query  });  res.json(response.data);});
4. Order Model Enhancement
Added missing fields for proper functionality:
{  items: [{    menuItemId: Number,    name: String,    price: Number,    quantity: Number  // ← Added to display quantities  }],  deliveryAddressDetails: {  // ← Added for mapping    street: String,    city: String,    postalCode: String,    coordinates: { lat: Number, lon: Number }  }}
5. Symfony Migration
Logistique API migrated from Node.js to Symfony:
Custom Dockerfile with PHP 8.2-Apache
Startup script for Composer installation
Database initialization with migrations and seeding
Proper Apache configuration for Symfony public directory
ENVIRONMENT VARIABLES 🔑
Required for Development
docker-compose.yml (already configured):
AUTH_API:  JWT_SECRET: your_jwt_secret_here  MONGO_URI: mongodb://auth-db:27017/authCOMMANDE_API:  JWT_SECRET: your_jwt_secret_here (same as above)  STRIPE_SECRET_KEY: sk_test_... (actual Stripe secret key)  MONGO_URI: mongodb://commande-db:27017/ordersLOGISTIQUE_API:  DATABASE_URL: postgresql://logistics_user:logistics_pass@logistique-db:5432/logistics_dbFRONTEND:  REACT_APP_API_URL: http://localhost:8080/api  REACT_APP_STRIPE_PUBLISHABLE_KEY: pk_test_... (actual Stripe publishable key)
Current Stripe Keys (already in docker-compose.yml):
Publishable: pk_test_51SPKQcPZCiOqc0pUajNftFBGv7Zu2KKUB4TCD9KucmdpYeLejb86p6DQUsN5UUlMEG5Kz8ichicHCaXShHqnJSCT00pWWrHNTP
Secret: (set STRIPE_SECRET_KEY in env or .env — do not commit real key)
HOW TO START THE PROJECT
Prerequisites
Docker Desktop installed and running
Git
Ports available: 3000, 3001, 3002, 3003, 5432, 8080, 27017
Quick Start
# From project root (CUBES-3-collaboratif)docker-compose up --build# Wait for all services to start (~2-3 minutes first time)# Frontend: http://localhost:3000# API Gateway: http://localhost:8080
Testing
# Backend integration testsnode test-integration.js# Frontend E2E testsnode test-frontend-e2e.js# Unit tests (requires services running)npm run test:authnpm run test:commandenpm run test:frontend
WHAT A NEW AI NEEDS TO KNOW
1. Current State
✅ Fully functional MVP with all core features working:
User registration/login
Menu display and ordering
Stripe payment processing
Address autocomplete with geocoding
Delivery assignment and status management
Interactive maps with automatic routing
French localization complete
2. Known Technical Constraints
⚠️ React Strict Mode is disabled to prevent Leaflet double-initialization
⚠️ Each DeliveryMap must have unique key prop based on order._id
⚠️ Use MapWrapper component for all Leaflet maps, never instantiate MapContainer directly
⚠️ Frontend Dockerfile uses --legacy-peer-deps due to React 19 conflicts with react-leaflet
⚠️ OSRM has rate limits: Route fetching is throttled to only fire when order ID changes
3. Code Patterns to Follow
Adding new map instances:
// Always use MapWrapper with unique orderId key<MapWrapper   orderId={order._id}  // Unique key for lifecycle  center={[lat, lon]}  markers={[...]}  route={routeCoordinates}/>
Protected API routes:
// Always use authMiddleware on protected routesrouter.get('/protected', authMiddleware, async (req, res) => {  const userId = req.user.id;    // From JWT  const userRole = req.user.role; // CUSTOMER or DELIVERY_PERSON});
French translations:
All user-facing text must be in French. Examples:
"Loading..." → "Chargement..."
"Sign In" → "Se connecter"
"Order" → "Commande"
"Address" → "Adresse"
4. File Modification Guidelines
High-touch files (frequently modified):
frontend/src/components/*.js - UI components
commande-api/routes/orders.js - Order logic
docker-compose.yml - Service configuration
Fragile files (modify carefully):
frontend/src/index.js - StrictMode is disabled for a reason
frontend/src/components/MapWrapper.js - Complex Leaflet lifecycle
logistique-api/Dockerfile - Custom startup script for Symfony
Auto-generated (don't edit directly):
logistique-api/vendor/ - Composer dependencies
*/node_modules/ - npm dependencies
5. Debugging Tips
Check service health:
docker-compose ps  # All should show "Up"docker-compose logs -f [service-name]  # View logs
Common issues:
"Map container is already initialized": Check that key prop is on DeliveryMap, verify StrictMode is disabled
404 on API calls: Check API Gateway routing in api-gateway/index.js
Stripe errors: Verify keys in docker-compose.yml match Stripe dashboard
CORS errors: Check CORS configuration in each service
Address API not working: Verify /api/address/search route in api-gateway uses direct axios handler
6. Future Enhancement Opportunities
Real-time updates using RabbitMQ (infrastructure ready, not implemented)
Restaurant dashboard for order management
Push notifications for delivery status
Multi-restaurant support
Order rating and reviews
Delivery person location tracking in real-time
Advanced analytics dashboards
TECHNOLOGY RATIONALE
Why Microservices? Scalability, independent deployment, technology flexibility (demonstrated with Symfony migration)
Why Symfony for Logistics? Demonstrates polyglot architecture, showcases PHP/PostgreSQL alongside Node.js/MongoDB
Why Leaflet over Google Maps? Open-source, no API keys required, France-friendly
Why French Address API? Official government data, free, comprehensive French address coverage
Why disable StrictMode? Leaflet's imperative DOM manipulation conflicts with React's double-mounting in dev mode; the benefit of StrictMode (catching bugs) is outweighed by the map initialization errors
This project represents a production-ready MVP architecture with modern best practices: containerization, microservices, proper authentication, real payment processing, and a polished user experience in French. All major technical challenges (especially the complex Leaflet lifecycle management) have been resolved.
