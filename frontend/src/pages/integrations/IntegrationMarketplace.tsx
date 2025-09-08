import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  StarIcon,
  HeartIcon,
  DownloadIcon,
  PlusIcon,
  CodeBracketIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { integrationsApi } from '../../services/api';

interface MarketplaceIntegration {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  version: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  tags: string[];
  iconUrl: string;
  screenshots: string[];
  pricing: 'free' | 'paid' | 'freemium';
  price?: number;
  currency?: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  lastUpdated: string;
  createdAt: string;
  verified: boolean;
  featured: boolean;
  documentation: {
    setup: string;
    usage: string;
    examples: string[];
  };
  supportedVersions: string[];
  dependencies: string[];
  permissions: string[];
  sourceCodeUrl?: string;
  demoUrl?: string;
  status: 'active' | 'deprecated' | 'beta';
  compatibility: {
    minVersion: string;
    maxVersion?: string;
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

const CATEGORIES = [
  'All Categories',
  'CRM',
  'Communication',
  'Productivity',
  'Marketing',
  'E-commerce',
  'Cloud Storage',
  'Developer Tools',
  'Social Media',
  'Analytics',
  'Security',
  'Finance',
  'AI & ML',
  'IoT',
  'Custom'
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'updated', label: 'Recently Updated' }
];

export const IntegrationMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<MarketplaceIntegration | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  // Fetch marketplace integrations
  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ['marketplace-integrations', searchQuery, selectedCategory, sortBy, priceFilter],
    queryFn: () => integrationsApi.searchMarketplace({
      query: searchQuery,
      category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
      sortBy,
      priceFilter,
      limit: 50
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user favorites
  const { data: userFavorites } = useQuery({
    queryKey: ['user-favorites'],
    queryFn: () => integrationsApi.getFavorites(),
    onSuccess: (data) => {
      setFavorites(new Set(data.map((item: any) => item.integrationId)));
    }
  });

  // Install integration mutation
  const installMutation = useMutation({
    mutationFn: (integrationId: string) => integrationsApi.installFromMarketplace(integrationId),
    onSuccess: () => {
      toast.success('Integration installed successfully!');
      queryClient.invalidateQueries(['connected-integrations']);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to install integration');
    }
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ integrationId, isFavorite }: { integrationId: string; isFavorite: boolean }) =>
      isFavorite 
        ? integrationsApi.addToFavorites(integrationId)
        : integrationsApi.removeFromFavorites(integrationId),
    onSuccess: (_, variables) => {
      const newFavorites = new Set(favorites);
      if (variables.isFavorite) {
        newFavorites.add(variables.integrationId);
        toast.success('Added to favorites');
      } else {
        newFavorites.delete(variables.integrationId);
        toast.success('Removed from favorites');
      }
      setFavorites(newFavorites);
      queryClient.invalidateQueries(['user-favorites']);
    }
  });

  const togglePriceFilter = (price: string) => {
    setPriceFilter(prev => 
      prev.includes(price) 
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  const getPriceDisplay = (integration: MarketplaceIntegration) => {
    if (integration.pricing === 'free') return 'Free';
    if (integration.pricing === 'freemium') return 'Freemium';
    if (integration.price) {
      return `${integration.currency || '$'}${integration.price}`;
    }
    return 'Paid';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarSolidIcon className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Marketplace</h1>
          <p className="text-gray-600">Discover and install integrations from the community</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => {/* Navigate to create integration */}}
          >
            Submit Integration
          </Button>
          <Button
            variant="ghost"
            leftIcon={<CodeBracketIcon className="w-4 h-4" />}
            onClick={() => window.open('https://docs.lethimdo.com/integration-api', '_blank')}
          >
            Developer Docs
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* Filter Toggle */}
            <Button
              variant="ghost"
              leftIcon={<FunnelIcon className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <div className="space-y-2">
                    {['free', 'freemium', 'paid'].map(price => (
                      <label key={price} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={priceFilter.includes(price)}
                          onChange={() => togglePriceFilter(price)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations?.map((integration: MarketplaceIntegration) => (
          <Card key={integration.id} hover>
            <CardBody>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.iconUrl}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      {integration.verified && (
                        <CheckBadgeIcon className="h-4 w-4 text-primary-600" title="Verified" />
                      )}
                      {integration.featured && (
                        <Badge variant="primary" size="sm">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {getRatingStars(integration.rating)}
                        <span className="text-xs text-gray-500">
                          ({integration.reviewCount})
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {integration.downloads.toLocaleString()} downloads
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => favoriteMutation.mutate({
                    integrationId: integration.id,
                    isFavorite: !favorites.has(integration.id)
                  })}
                  className="text-gray-400 hover:text-red-500"
                  disabled={favoriteMutation.isPending}
                >
                  {favorites.has(integration.id) ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {integration.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {integration.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
                {integration.tags.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{integration.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src={integration.author.avatar}
                  alt={integration.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600">{integration.author.name}</span>
                {integration.author.verified && (
                  <CheckBadgeIcon className="h-4 w-4 text-primary-600" />
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {getPriceDisplay(integration)}
                  </span>
                  <span className="text-xs text-gray-500">v{integration.version}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => installMutation.mutate(integration.id)}
                    isLoading={installMutation.isPending}
                    leftIcon={<DownloadIcon className="w-4 h-4" />}
                  >
                    Install
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {integrations && integrations.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setPriceFilter([]);
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => {/* Navigate to submit integration */}}
                >
                  Submit Integration
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load integrations</h3>
              <p className="text-gray-600 mb-4">
                There was an error loading the marketplace. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Integration Details Modal would go here */}
    </div>
  );
};