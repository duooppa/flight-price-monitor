import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Heart,
  Bell,
  Trash2,
  Plus,
  ArrowLeft,
  TrendingDown,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Please sign in to access your dashboard</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
            <div className="ml-auto text-sm text-slate-600">
              Welcome, <span className="font-semibold">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Saved Routes
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Price Alerts
            </TabsTrigger>
          </TabsList>

          {/* Saved Routes Tab */}
          <TabsContent value="routes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Your Saved Routes</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Route
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 1,
                  name: "New York to Shanghai",
                  origin: "JFK",
                  destination: "PVG",
                  lastPrice: 580,
                  lowestPrice: 450,
                  priceChange: -22.4,
                  lastUpdated: "2 hours ago",
                },
                {
                  id: 2,
                  name: "Los Angeles to Shanghai",
                  origin: "LAX",
                  destination: "PVG",
                  lastPrice: 520,
                  lowestPrice: 480,
                  priceChange: -7.7,
                  lastUpdated: "1 hour ago",
                },
                {
                  id: 3,
                  name: "San Francisco to Beijing",
                  origin: "SFO",
                  destination: "PEI",
                  lastPrice: 510,
                  lowestPrice: 420,
                  priceChange: -17.6,
                  lastUpdated: "3 hours ago",
                },
              ].map((route) => (
                <SavedRouteCard key={route.id} route={route} />
              ))}
            </div>

            {/* Empty State */}
            {false && (
              <Card className="p-8 text-center">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No saved routes yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Start monitoring flights to save your favorite routes
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Price Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Your Price Alerts</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Alert
              </Button>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  route: "JFK → PVG",
                  targetPrice: 500,
                  currentPrice: 520,
                  status: "watching",
                  createdAt: "5 days ago",
                },
                {
                  id: 2,
                  route: "LAX → PVG",
                  targetPrice: 450,
                  currentPrice: 520,
                  status: "watching",
                  createdAt: "3 days ago",
                },
                {
                  id: 3,
                  route: "SFO → SHA",
                  targetPrice: 400,
                  currentPrice: 510,
                  status: "watching",
                  createdAt: "1 day ago",
                },
              ].map((alert) => (
                <PriceAlertCard key={alert.id} alert={alert} />
              ))}
            </div>

            {/* Empty State */}
            {false && (
              <Card className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No price alerts yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Create alerts to get notified when prices drop
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SavedRouteCard({ route }: { route: any }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{route.name}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {route.origin} → {route.destination}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 pt-3 border-t border-slate-200">
        <div>
          <p className="text-xs text-slate-600">Current Price</p>
          <p className="font-semibold text-slate-900">${route.lastPrice}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Lowest Price</p>
          <p className="font-semibold text-slate-900">${route.lowestPrice}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Change</p>
          <p className="font-semibold text-green-600 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            {route.priceChange}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Updated {route.lastUpdated}</p>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          View Flights
        </Button>
      </div>
    </Card>
  );
}

function PriceAlertCard({ alert }: { alert: any }) {
  const [isActive, setIsActive] = useState(alert.status === "watching");

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-900">{alert.route}</h3>
            {isActive ? (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Watching
              </span>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                Inactive
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Target Price</p>
              <p className="font-semibold text-slate-900">${alert.targetPrice}</p>
            </div>
            <div>
              <p className="text-slate-600">Current Price</p>
              <p className="font-semibold text-slate-900">${alert.currentPrice}</p>
            </div>
            <div>
              <p className="text-slate-600">Created</p>
              <p className="text-slate-600">{alert.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? "Disable" : "Enable"}
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
