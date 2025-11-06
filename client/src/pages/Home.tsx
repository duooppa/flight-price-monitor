import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Plane, TrendingDown, Bell, Zap, Award } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("PVG");
  const [departureDate, setDepartureDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
    });
    navigate(`/monitor?${params}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* United Airlines Header */}
      <header className="border-b border-blue-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-blue-900">{APP_TITLE}</div>
              <div className="text-xs text-blue-600 font-semibold">Powered by United Airlines</div>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/monitor")} className="text-blue-900 hover:text-blue-700">
              Monitor
            </Button>
            {user && (
              <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-blue-900 hover:text-blue-700">
                Dashboard
              </Button>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="font-semibold text-blue-900">{user.name}</div>
                  <div className="text-xs text-blue-600">MileagePlus Member</div>
                </div>
              </div>
            ) : (
              <Button asChild className="bg-blue-700 hover:bg-blue-800 text-white">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Search Interface */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                ✈️ UNITED AIRLINES EXCLUSIVE
              </span>
            </div>
            <h1 className="text-5xl font-bold text-blue-900 mb-4">
              Smart Flight Pricing
            </h1>
            <p className="text-xl text-blue-700 mb-2">
              Monitor US-China flight prices with Amex points optimization
            </p>
            <p className="text-lg text-blue-600 mb-8">
              Find the best deals, maximize your rewards, and travel smarter with United MileagePlus
            </p>

            {/* Search Card */}
            <Card className="p-6 border-0 shadow-lg bg-white">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">
                      From
                    </label>
                    <Input
                      placeholder="JFK, LAX, SFO..."
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="text-center font-bold text-blue-900 border-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">
                      To
                    </label>
                    <Input
                      placeholder="PVG, SHA, CAN..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value.toUpperCase())}
                      className="text-center font-bold text-blue-900 border-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">
                    Departure Date
                  </label>
                  <Input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="border-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold py-3 flex items-center justify-center gap-2 rounded-lg"
                    disabled={!origin || !destination || !departureDate}
                  >
                    Search Flights
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => navigate("/monitor-advanced")}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                  >
                    Smart Redemption Finder
                    <Award className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Routes */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-blue-900 mb-3">Popular Routes:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { from: "JFK", to: "PVG", label: "New York → Shanghai" },
                  { from: "LAX", to: "PVG", label: "Los Angeles → Shanghai" },
                  { from: "SFO", to: "SHA", label: "San Francisco → Shanghai" },
                ].map((route) => (
                  <Button
                    key={`${route.from}-${route.to}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOrigin(route.from);
                      setDestination(route.to);
                    }}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {route.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className="space-y-4">
            <FeatureCard
              icon={<TrendingDown className="w-6 h-6 text-blue-700" />}
              title="Price Tracking"
              description="Real-time monitoring with historical trend analysis and price drop alerts"
            />
            <FeatureCard
              icon={<Award className="w-6 h-6 text-yellow-600" />}
              title="Amex Points Optimizer"
              description="Calculate the best way to redeem Amex points for maximum value"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-blue-700" />}
              title="Upgrade Opportunities"
              description="Get notified of seat upgrade chances and cabin class improvements"
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-orange-600" />}
              title="Smart Alerts"
              description="Instant notifications for price drops, delays, and redemption opportunities"
            />
            <FeatureCard
              icon={<Plane className="w-6 h-6 text-blue-700" />}
              title="Saved Routes"
              description="Save favorite routes and track prices automatically"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-300">1000+</div>
              <p className="text-blue-100 mt-2">Daily Price Updates</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300">50+</div>
              <p className="text-blue-100 mt-2">US-China Routes</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300">Real-time</div>
              <p className="text-blue-100 mt-2">Live Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amex Integration Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-yellow-600" />
            <h2 className="text-3xl font-bold text-blue-900">Amex Points Redemption</h2>
          </div>
          <p className="text-blue-700 mb-6 text-lg">
            Maximize your American Express points with our intelligent redemption calculator. Compare cash prices vs points value and find the best way to book your flights.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold mb-2">Cash Price</div>
              <div className="text-2xl font-bold text-blue-900">$580</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold mb-2">Points Required</div>
              <div className="text-2xl font-bold text-blue-900">45,000</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold mb-2">Points Value</div>
              <div className="text-2xl font-bold text-yellow-600">$0.013/pt</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-4 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white">
      <div className="flex gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-bold text-blue-900">{title}</h3>
          <p className="text-sm text-blue-600 mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
}
