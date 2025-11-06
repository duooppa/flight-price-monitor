# Flight Price API Research & Selection

## APIs Evaluated

### 1. Skyscanner Flights Live Prices API (SELECTED)
**URL:** https://developers.skyscanner.net/docs/flights-live-prices/overview

**Advantages:**
- Real-time flight pricing from multiple supply partners
- Two-endpoint workflow: `/create` (fast initial results) and `/poll` (complete results)
- Supports direct and connecting flight differentiation
- Includes flight leg and segment data for stopover analysis
- Provides sustainability/emissions data
- Returns detailed itinerary information with deep links
- Supports multiple carriers, agents, and filtering options

**Endpoints:**
- `POST /apiservices/v3/flights/live/search/create` - Initiate search
- `POST /apiservices/v3/flights/live/search/poll/{sessionToken}` - Retrieve results

**Key Request Parameters:**
- `market`: Market code (e.g., US, CN)
- `locale`: Language (e.g., en-US, zh-CN)
- `currency`: Currency code (e.g., USD, CNY)
- `queryLegs`: Origin/destination pairs with dates
- `adults`: Number of adult passengers
- `childrenAges`: Optional children ages
- `cabinClass`: Cabin class (economy, business, etc.)
- `nearbyAirports`: Include nearby airports in search

**Response Structure:**
- `Itineraries`: Bookable flight options
- `Legs`: Flight segments (1 for direct, multiple for connections)
- `Segments`: Individual flight stops with stopover details
- `Places`: Airport information
- `Carriers`: Airline information
- `Agents`: OTA booking agent information
- `Stats`: Aggregated data (min price, duration, stops distribution)

**Pricing:** Requires API key registration

### 2. Amadeus Flight Offers Search API
**URL:** https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search

**Advantages:**
- Access to 400+ airlines
- Comprehensive flight search with booking data
- Flight Price Analysis API for historical pricing
- Flight Choice Prediction for demand forecasting

**Disadvantages:**
- Requires separate authentication
- More complex integration

**Decision:** Secondary option if Skyscanner integration fails

### 3. Other APIs Researched
- **Aviationstack**: Real-time flight tracking (not pricing-focused)
- **Flightradar24**: Aircraft position tracking (not for booking)
- **FlightAware**: Flight tracking data (not pricing)
- **Google Flights API (SerpAPI)**: Web scraping approach (less reliable)

## Recommended Architecture

### Backend Data Flow
1. **Flight Search Request** → Skyscanner `/create` endpoint
2. **Async Polling** → Skyscanner `/poll` endpoint with session token
3. **Data Storage** → MySQL database for flights, prices, and history
4. **Real-time Updates** → WebSocket to push new results to frontend

### Database Schema
- `flights` - Flight itinerary records
- `flight_legs` - Flight segments (direct vs connecting)
- `flight_segments` - Individual flight stops
- `price_history` - Historical pricing for trend analysis
- `saved_routes` - User-saved flight routes
- `price_alerts` - User price alert preferences

### Key Features to Implement
1. **Direct vs Connecting Detection** - Analyze leg count in response
2. **Price Change Tracking** - Store historical prices and detect changes
3. **Real-time Monitoring** - Periodic polling with WebSocket updates
4. **Smart Alerts** - Notify users of significant price drops
5. **Route Comparison** - Compare prices across multiple dates
6. **Trend Analysis** - Historical price charts

## Next Steps
1. Register for Skyscanner API access
2. Implement backend service for flight data ingestion
3. Create database schema
4. Build tRPC procedures for flight queries
5. Develop real-time WebSocket support
6. Create minimalist frontend dashboard
