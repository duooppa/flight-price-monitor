# Flight Price Monitor - Project TODO

## Phase 1: Backend Infrastructure & Data Model
- [x] Research and integrate flight price API (Amadeus, Skyscanner, or similar)
- [x] Design database schema for flights, prices, routes, and price history
- [ ] Implement flight data ingestion service
- [x] Create tRPC procedures for flight queries and filters
- [ ] Implement direct vs. connecting flight classification logic
- [ ] Set up price change detection and tracking

## Phase 2: Real-time Features
- [ ] Implement WebSocket support for live price updates
- [ ] Create background job for periodic price polling
- [ ] Build price alert system (email/in-app notifications)
- [ ] Implement price history storage and retrieval

## Phase 3: Frontend - Core UI
- [x] Design minimalist dashboard layout with asymmetric structure
- [x] Implement global color scheme and typography (modern, clean aesthetic)
- [x] Build main search component (departure, arrival, date picker)
- [x] Create flight results table with real-time price updates
- [x] Implement direct/connecting flight filter toggle

## Phase 4: Frontend - Advanced Features
- [ ] Build price trend chart component (historical data visualization)
- [x] Implement saved routes/favorites feature
- [x] Create price alert management interface
- [ ] Build user preferences panel
- [ ] Add route comparison view

## Phase 5: Frontend - Polish & Performance
- [x] Implement skeleton loaders for better perceived performance
- [x] Add empty states and error handling
- [ ] Optimize real-time updates with debouncing
- [x] Implement responsive design for mobile/tablet
- [ ] Add micro-interactions and smooth transitions

## Phase 5: Advanced Features & Utilities
- [x] Implement direct vs. connecting flight classification logic
- [x] Set up price change detection and tracking
- [x] Create flight data processing utilities
- [x] Build price alert service with notification system
- [x] Implement alert triggering logic

## Phase 6: Testing & Optimization
- [ ] Test API integration and data accuracy
- [ ] Verify real-time update functionality
- [ ] Performance optimization (query caching, lazy loading)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness verification

## Phase 7: Deployment & Launch
- [ ] Create checkpoint for stable version
- [ ] Deploy to production
- [ ] Set up monitoring and logging
- [ ] Final quality assurance
