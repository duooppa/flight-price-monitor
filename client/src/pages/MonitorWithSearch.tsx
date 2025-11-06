import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingDown,
  Award,
  Zap,
  AlertTriangle,
  ExternalLink,
  Plane,
  Heart,
  Loader2,
  Filter,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function MonitorWithSearch() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("PVG");
  const [departureDate, setDepartureDate] = useState("2024-11-15");
  const [showDirect, setShowDirect] = useState(true);
  const [showConnecting, setShowConnecting] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [userAmexPoints, setUserAmexPoints] = useState(150000);

  // Call the real flight search API
  const { data: searchResults, isLoading, error } = trpc.flights.search.useQuery(
    {
      origin,
      destination,
      departureDate,
      adults: 1,
      cabinClass: "economy",
    },
    {
      enabled: !!origin && !!destination && !!departureDate,
    }
  );

  const flights = searchResults?.flights || [];
  const directFlights = searchResults?.directFlights || [];
  const connectingFlights = searchResults?.connectingFlights || [];

  // Filter flights based on selection
  const filteredFlights = flights.filter((flight: any) => {
    if (flight.isDirectFlight && !showDirect) return false;
    if (!flight.isDirectFlight && !showConnecting) return false;
    return true;
  });

  const selectedFlightData = filteredFlights.find((f: any) => f.id === selectedFlight);

  const calculateAmexValue = (price: number) => {
    const pointsPerCent = 100 / 1.3;
    return Math.round(price / 100 * pointsPerCent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-blue-900">Flight Monitor</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold text-blue-900">
              {userAmexPoints.toLocaleString()} Amex Points
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Panel */}
        <Card className="p-6 mb-8 border-blue-200 bg-white">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Search Flights</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-blue-700 block mb-2">
                From
              </label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                placeholder="JFK"
                maxLength={3}
                className="border-blue-200"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-700 block mb-2">
                To
              </label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="PVG"
                maxLength={3}
                className="border-blue-200"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-700 block mb-2">
                Departure
              </label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="border-blue-200"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 pt-4 border-t border-blue-200">
            <Filter className="w-4 h-4 text-blue-600" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDirect}
                onChange={(e) => setShowDirect(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-blue-700">
                Direct ({directFlights.length})
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showConnecting}
                onChange={(e) => setShowConnecting(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-blue-700">
                Connecting ({connectingFlights.length})
              </span>
            </label>
          </div>
        </Card>

        {error && (
          <Card className="p-4 mb-8 border-red-200 bg-red-50">
            <p className="text-red-700">
              {error instanceof Error ? error.message : "Failed to search flights"}
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Flight List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-900">
                {origin} → {destination}
              </h2>
              <div className="text-sm text-blue-600">
                {filteredFlights.length} flights found
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredFlights.length === 0 ? (
              <Card className="p-8 text-center border-blue-200">
                <Plane className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600">No flights found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredFlights.map((flight: any) => (
                  <Card
                    key={flight.id}
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      selectedFlight === flight.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-blue-200 hover:border-blue-400"
                    }`}
                    onClick={() => setSelectedFlight(flight.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-blue-900 flex items-center gap-2">
                          <Plane className="w-4 h-4" />
                          {flight.airline}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          {flight.departure.time} - {flight.arrival.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          ${(flight.price / 100).toFixed(0)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-sm mb-3 pt-3 border-t border-blue-200">
                      <div>
                        <div className="text-blue-600">Duration</div>
                        <div className="font-semibold text-blue-900">
                          {flight.duration}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600">Stops</div>
                        <div className="font-semibold text-blue-900">
                          {flight.stops === 0 ? "Direct" : flight.stops}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600">Cabin</div>
                        <div className="font-semibold text-blue-900 capitalize">
                          {flight.cabin}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600">Aircraft</div>
                        <div className="font-semibold text-blue-900">
                          {flight.aircraft}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-700 hover:bg-blue-800">
                        Book
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details Panel */}
          {selectedFlightData && (
            <div className="space-y-4">
              {/* Amex Calculator */}
              <Card className="p-4 border-2 border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-yellow-900">Amex Points</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded p-3 border border-yellow-200">
                    <div className="text-sm text-yellow-700 mb-1">Cash Price</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      ${(selectedFlightData.price / 100).toFixed(0)}
                    </div>
                  </div>

                  <div className="bg-white rounded p-3 border border-yellow-200">
                    <div className="text-sm text-yellow-700 mb-1">Points Needed</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {calculateAmexValue(selectedFlightData.price).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white rounded p-3 border border-yellow-200">
                    <div className="text-sm text-yellow-700 mb-1">Points Value</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      $
                      {(
                        (selectedFlightData.price / 100) /
                        (calculateAmexValue(selectedFlightData.price) / 10000)
                      ).toFixed(2)}
                      /pt
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded p-3 border border-yellow-200">
                    <div className="text-sm font-semibold text-yellow-900 mb-2">
                      Your Points: {userAmexPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-yellow-700">
                      {userAmexPoints >= calculateAmexValue(selectedFlightData.price)
                        ? "✓ You can afford this flight with points!"
                        : `✗ Need ${(calculateAmexValue(selectedFlightData.price) - userAmexPoints).toLocaleString()} more points`}
                    </div>
                  </div>

                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    Redeem with Points
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  >
                    Pay with Cash
                  </Button>
                </div>
              </Card>

              {/* Flight Details */}
              <Card className="p-4 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">Flight Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Airline</span>
                    <span className="font-semibold text-blue-900">
                      {selectedFlightData.airline}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Flight Number</span>
                    <span className="font-semibold text-blue-900">
                      {selectedFlightData.carrierCode}{selectedFlightData.flightNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Aircraft</span>
                    <span className="font-semibold text-blue-900">
                      {selectedFlightData.aircraft}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Cabin</span>
                    <span className="font-semibold text-blue-900 capitalize">
                      {selectedFlightData.cabin}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
