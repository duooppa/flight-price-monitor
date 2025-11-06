import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Plane, TrendingDown, Bell } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-lg text-slate-900">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/monitor")}>
              Monitor
            </Button>
            {user && (
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{user.name}</span>
              </div>
            ) : (
              <Button asChild>
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
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Real-time Flight Prices
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Monitor US-China flight prices in real-time. Track direct and connecting flights, get instant alerts on price drops.
            </p>

            {/* Search Card */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      From
                    </label>
                    <Input
                      placeholder="JFK, LAX, SFO..."
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      To
                    </label>
                    <Input
                      placeholder="PVG, SHA, CAN..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value.toUpperCase())}
                      className="text-center font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Departure Date
                  </label>
                  <Input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 flex items-center justify-center gap-2"
                  disabled={!origin || !destination || !departureDate}
                >
                  Search Flights
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Quick Routes */}
            <div className="mt-6">
              <p className="text-sm text-slate-600 mb-3">Popular routes:</p>
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
                    className="text-xs"
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
              icon={<TrendingDown className="w-6 h-6 text-green-600" />}
              title="Price Tracking"
              description="Monitor price changes in real-time with historical trend analysis"
            />
            <FeatureCard
              icon={<Plane className="w-6 h-6 text-blue-600" />}
              title="Smart Filtering"
              description="Easily filter between direct flights and connecting flights"
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-orange-600" />}
              title="Price Alerts"
              description="Get notified instantly when prices drop below your target"
            />
            <FeatureCard
              icon={<Plane className="w-6 h-6 text-purple-600" />}
              title="Saved Routes"
              description="Save your favorite routes for quick access and monitoring"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <p className="text-slate-600 mt-2">Daily Price Updates</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <p className="text-slate-600 mt-2">US-China Routes</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">Real-time</div>
              <p className="text-slate-600 mt-2">Live Monitoring</p>
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
    <Card className="p-4 border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
}
