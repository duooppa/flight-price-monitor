import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingDown,
  Award,
  Zap,
  AlertTriangle,
  Clock,
  DollarSign,
  Plane,
  Heart,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";

export default function Monitor() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [userAmexPoints, setUserAmexPoints] = useState(100000);

  // Mock flight data
  const mockFlights = useMemo(
    () => [
      {
        id: "1",
        airline: "United Airlines",
        departure: "2024-11-15 14:30",
        arrival: "2024-11-16 18:45",
        origin: "JFK",
        destination: "PVG",
        stops: 0,
        duration: 16,
        price: 58000, // in cents
        currentPrice: 58000,
        previousPrice: 65000,
        priceChange: -10.8,
        cabin: "economy",
        seats: 12,
        delayRisk: 25,
        upgradeChance: 0.65,
        milesEarned: 6000,
      },
      {
        id: "2",
        airline: "United Airlines",
        departure: "2024-11-15 08:00",
        arrival: "2024-11-16 12:15",
        origin: "JFK",
        destination: "PVG",
        stops: 1,
        duration: 18,
        price: 52000,
        currentPrice: 52000,
        previousPrice: 58000,
        priceChange: -10.3,
        cabin: "economy",
        seats: 24,
        delayRisk: 35,
        upgradeChance: 0.45,
        milesEarned: 6000,
      },
      {
        id: "3",
        airline: "United Airlines",
        departure: "2024-11-16 10:00",
        arrival: "2024-11-17 14:30",
        origin: "JFK",
        destination: "PVG",
        stops: 0,
        duration: 16,
        price: 62000,
        currentPrice: 62000,
        previousPrice: 62000,
        priceChange: 0,
        cabin: "economy",
        seats: 5,
        delayRisk: 20,
        upgradeChance: 0.75,
        milesEarned: 6000,
      },
    ],
    []
  );

  const calculateAmexValue = (price: number) => {
    // Typical redemption: 1 point = 1.2-1.5 cents
    const pointsPerCent = 100 / 1.3; // ~77 points per dollar
    return Math.round(price / 100 * pointsPerCent);
  };

  const selectedFlightData = mockFlights.find((f) => f.id === selectedFlight);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Flight List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-900">
                JFK → PVG (Nov 15-16)
              </h2>
              <div className="text-sm text-blue-600">
                {mockFlights.length} flights found
              </div>
            </div>

            <div className="space-y-3">
              {mockFlights.map((flight) => (
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
                        {flight.departure} - {flight.arrival}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        ${(flight.price / 100).toFixed(0)}
                      </div>
                      {flight.priceChange !== 0 && (
                        <div
                          className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                            flight.priceChange < 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <TrendingDown className="w-3 h-3" />
                          {flight.priceChange.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-sm mb-3 pt-3 border-t border-blue-200">
                    <div>
                      <div className="text-blue-600">Duration</div>
                      <div className="font-semibold text-blue-900">
                        {flight.duration}h
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600">Stops</div>
                      <div className="font-semibold text-blue-900">
                        {flight.stops === 0 ? "Direct" : flight.stops}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600">Seats</div>
                      <div
                        className={`font-semibold ${
                          flight.seats < 10 ? "text-orange-600" : "text-blue-900"
                        }`}
                      >
                        {flight.seats} left
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600">Miles</div>
                      <div className="font-semibold text-blue-900">
                        {flight.milesEarned.toLocaleString()}
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

              {/* Flight Intelligence */}
              <Card className="p-4 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">Flight Intelligence</h3>

                <Tabs defaultValue="upgrade" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="upgrade" className="text-xs">
                      Upgrade
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="text-xs">
                      Risk
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upgrade" className="space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <div className="text-sm font-bold text-green-900">
                          Upgrade Probability
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-900 mb-2">
                        {Math.round(selectedFlightData.upgradeChance * 100)}%
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${selectedFlightData.upgradeChance * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-green-700 mt-2">
                        High chance of upgrade to premium economy or business
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="risk" className="space-y-3">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded p-3 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <div className="text-sm font-bold text-orange-900">
                          Delay Risk
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-900 mb-2">
                        {selectedFlightData.delayRisk}%
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${selectedFlightData.delayRisk}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-orange-700 mt-2">
                        Low delay risk - flight likely on time
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Miles Earning */}
              <Card className="p-4 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold text-blue-900">Miles Earning</h3>
                </div>

                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                  <div className="text-sm text-blue-600 mb-1">Base Miles</div>
                  <div className="text-2xl font-bold text-blue-900 mb-3">
                    {selectedFlightData.milesEarned.toLocaleString()}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Elite Bonus (Gold):</span>
                      <span className="font-semibold text-blue-900">
                        +{Math.round(selectedFlightData.milesEarned * 0.25).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Promotion (2x):</span>
                      <span className="font-semibold text-blue-900">
                        +{selectedFlightData.milesEarned.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-bold text-blue-900">Total:</span>
                      <span className="font-bold text-blue-900">
                        {Math.round(
                          selectedFlightData.milesEarned * 2.25
                        ).toLocaleString()}
                      </span>
                    </div>
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
