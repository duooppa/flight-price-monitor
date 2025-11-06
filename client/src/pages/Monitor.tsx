import { useState, useEffect } from "react";
import { useSearchParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  MapPin,
  Clock,
  DollarSign,
  TrendingDown,
  Heart,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Monitor() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const origin = searchParams.get("origin") || "JFK";
  const destination = searchParams.get("destination") || "PVG";
  const departureDate = searchParams.get("departureDate") || "";

  const [flightType, setFlightType] = useState<"all" | "direct" | "connecting">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">(
    "price"
  );
  const [savedRoutes, setSavedRoutes] = useState<string[]>([]);
  const [routeName, setRouteName] = useState("");

  // Simulated flight data for demo
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate flight search
    setLoading(true);
    const timer = setTimeout(() => {
      const mockFlights = [
        {
          id: 1,
          airline: "United Airlines",
          departure: "10:30 AM",
          arrival: "2:15 PM +1",
          duration: "13h 45m",
          price: 580,
          stops: 0,
          isDirect: true,
          route: "JFK → PVG",
          priceChange: -2.5,
        },
        {
          id: 2,
          airline: "China Eastern",
          departure: "2:00 PM",
          arrival: "5:30 PM +1",
          duration: "13h 30m",
          price: 520,
          stops: 0,
          isDirect: true,
          route: "JFK → PVG",
          priceChange: 1.2,
        },
        {
          id: 3,
          airline: "Air China",
          departure: "8:00 AM",
          arrival: "11:45 PM +1",
          duration: "15h 45m",
          price: 450,
          stops: 1,
          isDirect: false,
          route: "JFK → NRT → PVG",
          priceChange: -5.8,
        },
        {
          id: 4,
          airline: "Cathay Pacific",
          departure: "11:30 AM",
          arrival: "4:00 PM +1",
          duration: "14h 30m",
          price: 510,
          stops: 1,
          isDirect: false,
          route: "JFK → HKG → PVG",
          priceChange: 0.5,
        },
        {
          id: 5,
          airline: "American Airlines",
          departure: "6:00 PM",
          arrival: "8:30 AM +2",
          duration: "16h 30m",
          price: 480,
          stops: 1,
          isDirect: false,
          route: "JFK → ORD → PVG",
          priceChange: -3.2,
        },
      ];

      let filtered = mockFlights;
      if (flightType === "direct") {
        filtered = filtered.filter((f) => f.isDirect);
      } else if (flightType === "connecting") {
        filtered = filtered.filter((f) => !f.isDirect);
      }

      if (sortBy === "price") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === "duration") {
        filtered.sort((a, b) => {
          const aDuration = parseInt(a.duration);
          const bDuration = parseInt(b.duration);
          return aDuration - bDuration;
        });
      }

      setFlights(filtered);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [flightType, sortBy]);

  const handleSaveRoute = () => {
    if (routeName.trim()) {
      setSavedRoutes([...savedRoutes, routeName]);
      setRouteName("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Flight Monitor</h1>
          </div>

          {/* Search Summary */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">{origin}</span>
              <span>→</span>
              <span className="font-semibold">{destination}</span>
            </div>
            {departureDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(departureDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-20">
              <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>

              <div className="space-y-4">
                {/* Flight Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Flight Type
                  </label>
                  <Select value={flightType} onValueChange={(v: any) => setFlightType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Flights</SelectItem>
                      <SelectItem value="direct">Direct Only</SelectItem>
                      <SelectItem value="connecting">Connecting Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price (Low to High)</SelectItem>
                      <SelectItem value="duration">Duration (Short to Long)</SelectItem>
                      <SelectItem value="departure">Departure Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Route */}
                {user && (
                  <div className="border-t border-slate-200 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Save This Route
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Route name"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveRoute}
                        disabled={!routeName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                    {savedRoutes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {savedRoutes.map((route, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                          >
                            ✓ {route}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content - Flight Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : flights.length > 0 ? (
              <div className="space-y-3">
                {flights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} user={user} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No flights found. Try adjusting your filters.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function FlightCard({ flight, user }: { flight: any; user: any }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="font-semibold text-slate-900">{flight.airline}</div>
            {flight.isDirect ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Direct
              </span>
            ) : (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {flight.stops} Stop{flight.stops > 1 ? "s" : ""}
              </span>
            )}
            {flight.priceChange < 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(flight.priceChange)}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <div className="text-sm text-slate-600">Departure</div>
              <div className="font-semibold text-slate-900">{flight.departure}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600">Duration</div>
              <div className="font-semibold text-slate-900 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {flight.duration}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Arrival</div>
              <div className="font-semibold text-slate-900">{flight.arrival}</div>
            </div>
          </div>

          <div className="text-xs text-slate-500">{flight.route}</div>
        </div>

        <div className="text-right flex flex-col items-end gap-3">
          <div className="text-3xl font-bold text-blue-600">${flight.price}</div>
          <div className="flex gap-2">
            {user && (
              <>
                <Button
                  size="sm"
                  variant={isSaved ? "default" : "outline"}
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex items-center gap-1"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
