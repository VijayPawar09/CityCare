import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  Shield,
  Lightbulb,
  Heart,
  Eye,
  EyeOff,
  Lock,
  User
} from 'lucide-react';
import LoginModal from '../components/LoginModal/LoginModal';

// Login Modal Component


// Main Homepage Component
const CityConnectHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const heroSlides = [
    {
      title: "Building Better Communities Together",
      subtitle: "Report issues, track progress, and stay connected with your city",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop",
      cta: "Report an Issue"
    },
    {
      title: "Your Voice Matters",
      subtitle: "Help improve our city by reporting problems and suggesting solutions",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop",
      cta: "Get Involved"
    }
  ];

  const stats = [
    { number: "2,847", label: "Issues Resolved", icon: CheckCircle, color: "text-green-500" },
    { number: "156", label: "In Progress", icon: Clock, color: "text-yellow-500" },
    { number: "89", label: "New Reports", icon: AlertTriangle, color: "text-red-500" },
    { number: "98%", label: "Satisfaction Rate", icon: Star, color: "text-blue-500" }
  ];

  const services = [
    {
      title: "Report Issues",
      description: "Quickly report potholes, broken streetlights, and other city problems",
      icon: AlertTriangle,
      color: "bg-gradient-to-br from-red-500 to-pink-600",
      isReportIssue: true
    },
    {
      title: "City Services",
      description: "Access permits, licenses, and other municipal services online",
      icon: Building2,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      link: "/services"
    },
    {
      title: "Events Calendar",
      description: "Stay updated with community events and city council meetings",
      icon: Calendar,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      link: "/events"
    },
    {
      title: "News & Updates",
      description: "Get the latest news and announcements from city hall",
      icon: FileText,
      color: "bg-gradient-to-br from-green-500 to-teal-600",
      link: "/news"
    },
    {
      title: "Contact Officials",
      description: "Reach out to your elected representatives and city staff",
      icon: Users,
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      link: "/contact"
    },
    {
      title: "Emergency Services",
      description: "Quick access to emergency contacts and safety information",
      icon: Shield,
      color: "bg-gradient-to-br from-red-600 to-red-700",
      link: "/emergency"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Resident",
      content: "I reported a pothole on my street and it was fixed within 3 days. Amazing response time!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Mike Chen",
      role: "Business Owner",
      content: "The permit process is so much easier now. Everything can be done online efficiently.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Community Leader",
      content: "This platform has really improved communication between residents and city officials.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">City Care</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
              <button 
                onClick={openLoginModal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Report Issue
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2">Home</a>
                <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2">Services</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2">About</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2">Contact</a>
                <button 
                  onClick={openLoginModal}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium mx-4"
                >
                  Report Issue
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
        ></div>
        
        <div className="relative z-20 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-[fadeInUp_1s_ease_0.2s_forwards]">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-0 animate-[fadeInUp_1s_ease_0.4s_forwards]">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fadeInUp_1s_ease_0.6s_forwards]">
              <button 
                onClick={openLoginModal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <span>{heroSlides[currentSlide].cta}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-800 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4 ${stat.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">City Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access all city services from one convenient platform. We're here to serve you better.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  onClick={service.isReportIssue ? openLoginModal : undefined}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-8 h-full">
                    <div className={`w-16 h-16 ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Learn More</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Report Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Lightbulb className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-6">See Something? Say Something!</h2>
          <p className="text-xl mb-8 opacity-90">
            Report issues in your neighborhood and help us make our city better for everyone.
          </p>
          <button 
            onClick={openLoginModal}
            className="bg-white text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Report an Issue Now</span>
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Citizens Say</h2>
            <p className="text-xl text-gray-600">
              Real feedback from real people in our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">City Connect</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Connecting citizens with their city government for a better community. 
                Report issues, access services, and stay informed.
              </p>
              <div className="flex items-center space-x-2 text-gray-300">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Made with love for our community</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={openLoginModal} className="hover:text-white transition-colors text-left">Report Issue</button></li>
                <li><a href="#" className="hover:text-white transition-colors">City Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 City Hall Plaza</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@cityconnect.gov</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 City Connect. All rights reserved. Built for the community, by the community.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CityConnectHomepage;