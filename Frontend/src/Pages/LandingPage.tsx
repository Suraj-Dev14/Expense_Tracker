import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  ArrowRight,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  CheckCircle,
  Shield,
  Smartphone,
  Users,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<number>(0);

  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description:
        "Get detailed insights into your spending patterns with interactive charts and trends analysis.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: Target,
      title: "Budget Management",
      description:
        "Set category-based budgets and get real-time alerts when you're approaching your limits.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: PieChart,
      title: "Expense Tracking",
      description:
        "Easily categorize and track all your income and expenses with our intuitive interface.",
      image: "/placeholder.svg?height=300&width=400",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content:
        "ExpenseFlow has completely transformed how I manage my business finances. The insights are incredible!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Freelancer",
      content:
        "Finally, an expense tracker that's both powerful and easy to use. I love the budget alerts feature.",
      rating: 4,
    },
    {
      name: "Emily Davis",
      role: "Student",
      content:
        "Perfect for tracking my student budget. The mobile app makes it so convenient to log expenses on the go.",
      rating: 5,
    },
  ];

  const benefits = [
    "Track unlimited transactions",
    "Set custom budget categories",
    "Export data to CSV/PDF",
    "Real-time spending alerts",
    "Multi-device synchronization",
    "Bank-level security",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80  backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-xl text-slate-800 ">
                ExpenseFlow
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-slate-600  hover:text-slate-800  transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-slate-600  hover:text-slate-800  transition-colors"
              >
                Why Us?
              </a>
              <a
                href="#reviews"
                className="text-slate-600  hover:text-slate-800  transition-colors"
              >
                Reviews
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/auth");
                }}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                onClick={() => {
                  navigate("/auth");
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800  ">
              ✨ New: AI-Powered Insights Available
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800  mb-6">
              Take Control of Your
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Finances
              </span>
            </h1>
            <p className="text-xl text-slate-600  mb-8 max-w-3xl mx-auto">
              ExpenseFlow is the smart expense tracker that helps you monitor
              income, expenses, and savings with real-time insights,
              personalized budgets, and beautiful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  navigate("/auth");
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 py-3"
              >
                Start Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white  rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 flex items-center px-4 gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700 ">
                          Total Income
                        </span>
                        <TrendingUp className="h-4 w-4 text-green-600 " />
                      </div>
                      <div className="text-2xl font-bold text-green-800 ">
                        $5,240
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700 ">
                          Total Expenses
                        </span>
                        <DollarSign className="h-4 w-4 text-red-600 " />
                      </div>
                      <div className="text-2xl font-bold text-red-800 ">
                        $3,180
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 ">
                          Net Savings
                        </span>
                        <Target className="h-4 w-4 text-blue-600 " />
                      </div>
                      <div className="text-2xl font-bold text-blue-800 ">
                        $2,060
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-blue-500 " />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800  mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-xl text-slate-600  max-w-3xl mx-auto">
              Powerful features designed to give you complete control over your
              financial life
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? "border-blue-500 shadow-lg bg-blue-50 "
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            activeFeature === index
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100  text-slate-600 "
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800  mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-slate-600 ">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const Icon = features[activeFeature].icon;
                      return <Icon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <h4 className="text-xl font-semibold text-slate-800  mb-2">
                    {features[activeFeature].title}
                  </h4>
                  <p className="text-slate-600 ">
                    Interactive preview coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800  mb-6">
                Why Choose ExpenseFlow?
              </h2>
              <p className="text-xl text-slate-600  mb-8">
                Join thousands of users who have transformed their financial
                habits with our comprehensive expense tracking solution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 ">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 ">10K+</div>
                  <div className="text-sm text-slate-600 ">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 ">4.9★</div>
                  <div className="text-sm text-slate-600 ">App Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 ">$2M+</div>
                  <div className="text-sm text-slate-600 ">Money Tracked</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-blue-600  mx-auto mb-4" />
                  <h3 className="font-semibold text-blue-800  mb-2">
                    Bank-Level Security
                  </h3>
                  <p className="text-sm text-blue-700 ">
                    Your data is encrypted and protected with industry-standard
                    security measures.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <Smartphone className="w-12 h-12 text-green-600  mx-auto mb-4" />
                  <h3 className="font-semibold text-green-800  mb-2">
                    Mobile First
                  </h3>
                  <p className="text-sm text-green-700 ">
                    Track expenses on the go with our responsive mobile
                    interface.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-600  mx-auto mb-4" />
                  <h3 className="font-semibold text-purple-800  mb-2">
                    Smart Analytics
                  </h3>
                  <p className="text-sm text-purple-700 ">
                    Get actionable insights with AI-powered spending analysis.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-orange-600  mx-auto mb-4" />
                  <h3 className="font-semibold text-orange-800  mb-2">
                    24/7 Support
                  </h3>
                  <p className="text-sm text-orange-700 ">
                    Get help whenever you need it with our dedicated support
                    team.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 bg-white ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800  mb-4">
              Loved by Users Worldwide
            </h2>
            <p className="text-xl text-slate-600 ">
              See what our users have to say about ExpenseFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-50  border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={`${index}-${i}`}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-700  mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-slate-800 ">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600 ">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already transformed their financial
            habits with ExpenseFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => {
                navigate("/auth");
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
            >
              Start Tracking Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2023 ExpenseFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};