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
  ExternalLink,
  CheckCircle,
  Crown,
  DollarSign,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";

export default function MonitorAdvanced() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedFlight, setSelectedFlight] = useState<string | null>("1");
  const [userAmexPoints, setUserAmexPoints] = useState(150000);

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
        isInternational: true,
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
        isInternational: true,
      },
    ],
    []
  );

  const selectedFlightData = mockFlights.find((f) => f.id === selectedFlight);

  // Mock redemption options
  const redemptionOptions = useMemo(
    () => [
      {
        rank: 1,
        airline: "China Southern",
        method: "points",
        cashPrice: 58000,
        pointsRequired: 17000,
        pointsValue: 341, // ¢ per point
        totalCost: 58000,
        savings: 0,
        savingsPercent: 0,
        bookingUrl: "https://www.csair.com/",
        recommendation: "BEST VALUE - Cheapest option!",
        badge: "🏆 BEST",
      },
      {
        rank: 2,
        airline: "China Eastern",
        method: "points",
        cashPrice: 58000,
        pointsRequired: 18000,
        pointsValue: 322, // ¢ per point
        totalCost: 58000,
        savings: 0,
        savingsPercent: 0,
        bookingUrl: "https://www.ceair.com/",
        recommendation: "Good value - 2nd best option",
        badge: "🥈 GOOD",
      },
      {
        rank: 3,
        airline: "Air China",
        method: "points",
        cashPrice: 58000,
        pointsRequired: 20000,
        pointsValue: 290, // ¢ per point
        totalCost: 58000,
        savings: 0,
        savingsPercent: 0,
        bookingUrl: "https://www.airchina.com/",
        recommendation: "Decent value - 3rd option",
        badge: "🥉 OK",
      },
      {
        rank: 4,
        airline: "United",
        method: "points",
        cashPrice: 58000,
        pointsRequired: 30000,
        pointsValue: 193, // ¢ per point
        totalCost: 58000,
        savings: 0,
        savingsPercent: 0,
        bookingUrl: "https://www.united.com/",
        recommendation: "Lower value - not recommended",
        badge: "⚠️ LOWER",
      },
      {
        rank: 5,
        airline: "American",
        method: "points",
        cashPrice: 58000,
        pointsRequired: 25000,
        pointsValue: 232, // ¢ per point
        totalCost: 58000,
        savings: 0,
        savingsPercent: 0,
        bookingUrl: "https://www.aa.com/",
        recommendation: "Average value",
        badge: "→ AVERAGE",
      },
      {
        rank: 6,
        airline: "Delta",
        method: "points",
        cashPrice: 58000,
        pointsRequired: 28000,
        pointsValue: 207, // ¢ per point
        totalCost: 58000,
        savings: 0,
        savingsPercent: 0,
        bookingUrl: "https://www.delta.com/",
        recommendation: "Lower value",
        badge: "↓ LOWER",
      },
    ],
    []
  );

  const bestOption = redemptionOptions[0];
  const savingsVsCash = 58000 - (bestOption.pointsRequired * bestOption.pointsValue) / 100;

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
            <h1 className="text-2xl font-bold text-blue-900">Smart Redemption Finder</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Flight Selection */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Select Flight</h2>
            <div className="space-y-3">
              {mockFlights.map((flight) => (
                <Card
                  key={flight.id}
                  className={`p-3 cursor-pointer border-2 transition-all ${
                    selectedFlight === flight.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-blue-200 hover:border-blue-400"
                  }`}
                  onClick={() => setSelectedFlight(flight.id)}
                >
                  <div className="font-bold text-blue-900 text-sm">
                    {flight.origin} → {flight.destination}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    ${(flight.price / 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-600">
                    {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Redemption Comparison */}
          {selectedFlightData && (
            <div className="lg:col-span-3">
              {/* Best Deal Highlight */}
              <Card className="p-6 mb-6 border-2 border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-6 h-6 text-green-600" />
                      <h3 className="text-2xl font-bold text-green-900">
                        Best Deal Found!
                      </h3>
                    </div>
                    <p className="text-green-700">
                      Save the most with {bestOption.airline}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-green-900">
                      {bestOption.pointsValue.toFixed(0)}¢
                    </div>
                    <div className="text-sm text-green-700">per point</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-green-300">
                    <div className="text-xs text-green-700 font-semibold mb-1">
                      Points Needed
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {bestOption.pointsRequired.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-300">
                    <div className="text-xs text-green-700 font-semibold mb-1">
                      Cash Price
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      ${(selectedFlightData.price / 100).toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-300">
                    <div className="text-xs text-green-700 font-semibold mb-1">
                      You Save
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ${(savingsVsCash / 100).toFixed(0)}
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 flex items-center justify-center gap-2"
                >
                  <a href={bestOption.bookingUrl} target="_blank" rel="noopener noreferrer">
                    Book with {bestOption.airline}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </Card>

              {/* All Options Comparison */}
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                All Airline Options (Ranked by Value)
              </h3>

              <div className="space-y-3">
                {redemptionOptions.map((option, idx) => (
                  <Card
                    key={idx}
                    className={`p-4 border-2 transition-all ${
                      idx === 0
                        ? "border-green-400 bg-green-50"
                        : "border-blue-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl font-bold text-blue-900 min-w-[2rem]">
                          #{option.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-blue-900">
                              {option.airline}
                            </span>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {option.badge}
                            </span>
                          </div>
                          <p className="text-sm text-blue-600">
                            {option.recommendation}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {option.pointsValue.toFixed(0)}¢
                        </div>
                        <div className="text-xs text-blue-600">per point</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                      <div className="bg-white rounded p-2 border border-blue-200">
                        <div className="text-xs text-blue-600 font-semibold">
                          Points
                        </div>
                        <div className="font-bold text-blue-900">
                          {option.pointsRequired.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white rounded p-2 border border-blue-200">
                        <div className="text-xs text-blue-600 font-semibold">
                          Cash
                        </div>
                        <div className="font-bold text-blue-900">
                          ${(option.cashPrice / 100).toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-white rounded p-2 border border-blue-200">
                        <div className="text-xs text-blue-600 font-semibold">
                          Afford?
                        </div>
                        <div className="font-bold text-blue-900">
                          {userAmexPoints >= option.pointsRequired ? (
                            <span className="text-green-600">✓ Yes</span>
                          ) : (
                            <span className="text-red-600">✗ No</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-white rounded p-2 border border-blue-200">
                        <div className="text-xs text-blue-600 font-semibold">
                          Method
                        </div>
                        <div className="font-bold text-blue-900 capitalize">
                          {option.method}
                        </div>
                      </div>
                    </div>

                    <Button
                      asChild
                      className={`w-full flex items-center justify-center gap-2 ${
                        idx === 0
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white`}
                    >
                      <a
                        href={option.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Book with {option.airline}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Savings Summary */}
              <Card className="mt-6 p-4 border-blue-200 bg-blue-50">
                <h4 className="font-bold text-blue-900 mb-3">Savings Summary</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-sm text-blue-600">Best vs Cash</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${(savingsVsCash / 100).toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">Points Value</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {bestOption.pointsValue.toFixed(2)}¢
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">Your Points</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {userAmexPoints >= bestOption.pointsRequired ? (
                        <span className="text-green-600">✓ Enough</span>
                      ) : (
                        <span className="text-red-600">✗ Short</span>
                      )}
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
