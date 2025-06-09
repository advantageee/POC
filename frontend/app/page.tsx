import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export default function Home() {
  const features: Feature[] = [
    {
      icon: BuildingOfficeIcon,
      title: 'Company Intelligence',
      description: 'Deep insights into company profiles, leadership, funding history, and business metrics'
    },
    {
      icon: ChartBarIcon,
      title: 'Investment Tracking',
      description: 'Monitor funding rounds, track investment opportunities, and analyze market trends'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Smart Search',
      description: 'AI-powered similarity search to discover companies matching your investment criteria'
    },
    {
      icon: BoltIcon,
      title: 'Real-time Signals',
      description: 'Stay informed with automated alerts on company activities and market events'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Investment 
            <span className="text-blue-600 block">Intelligence Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover, analyze, and track investment opportunities with comprehensive company intelligence, 
            real-time market signals, and AI-driven insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Explore Companies
            </Link>
            <Link 
              href="/search"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Search & Discover
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for investment research
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines multiple data sources with AI analysis to provide 
              comprehensive investment intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to supercharge your investment research?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of investors using AI-powered intelligence to make better decisions.
          </p>
          <Link 
            href="/dashboard"
            className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Start Exploring          </Link>
        </div>
      </section>
    </div>
  );
}
