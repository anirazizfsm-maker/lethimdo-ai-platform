import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BoltIcon, ChartBarIcon, LightBulbIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navigation */}
      <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center">
          <BoltIcon className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">Lethimdo</span>
        </div>
        <div className="flex space-x-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform
            <span className="text-primary-600"> Natural Language </span>
            into Powerful Workflows
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Lethimdo uses AI to convert your business requirements into executable n8n workflows. 
            Save time, reduce costs, and unlock automation insights with our intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Building Workflows
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Workflow Automation
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features designed to make automation accessible to everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BoltIcon className="h-8 w-8" />}
            title="Natural Language Processing"
            description="Describe your workflow in plain English and watch AI transform it into executable automation."
          />
          <FeatureCard
            icon={<ChartBarIcon className="h-8 w-8" />}
            title="Advanced Analytics"
            description="Track time saved, costs reduced, and ROI metrics with comprehensive dashboard insights."
          />
          <FeatureCard
            icon={<LightBulbIcon className="h-8 w-8" />}
            title="AI-Powered Insights"
            description="Get intelligent recommendations and business optimization suggestions powered by GPT-4."
          />
          <FeatureCard
            icon={<PuzzlePieceIcon className="h-8 w-8" />}
            title="Seamless Integrations"
            description="Connect with 100+ apps including Google Sheets, Slack, Gmail, Notion, and more."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Automate Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses saving time and money with AI-powered workflows
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <BoltIcon className="h-6 w-6 text-primary-400" />
            <span className="ml-2 text-lg font-semibold text-white">Lethimdo</span>
          </div>
          <p className="text-gray-400">
            © 2024 Lethimdo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-soft">
      <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-lg mb-4">
        <div className="text-primary-600">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};