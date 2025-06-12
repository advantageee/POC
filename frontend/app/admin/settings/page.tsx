'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  CogIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CloudIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface ServiceConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTested?: string;
  fields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  value: string;
  placeholder: string;
  required: boolean;
  masked?: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [maskedFields, setMaskedFields] = useState<Set<string>>(new Set());

  const [services, setServices] = useState<ServiceConfig[]>([
    {
      name: 'Apollo.io',
      icon: <GlobeAltIcon className="h-6 w-6" />,
      description: 'Company and contact data from Apollo.io API',
      status: 'connected',
      lastTested: '2 minutes ago',
      fields: [
        {
          key: 'apollo_api_key',
          label: 'API Key',
          type: 'password',
          value: 'Grxi_g98_sg9B0gwGmDnnA',
          placeholder: 'Enter Apollo.io API key',
          required: true,
          masked: true,
        },
        {
          key: 'apollo_base_url',
          label: 'Base URL',
          type: 'url',
          value: 'https://api.apollo.io/v1',
          placeholder: 'https://api.apollo.io/v1',
          required: true,
        },
      ],
    },
    {
      name: 'Twitter API',
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      description: 'Real-time signals and social media monitoring',
      status: 'connected',
      lastTested: '5 minutes ago',
      fields: [
        {
          key: 'twitter_api_key',
          label: 'API Key',
          type: 'password',
          value: 'Kt8Bg1eDCHIK0BwxLYDB6VH1y',
          placeholder: 'Enter Twitter API key',
          required: true,
          masked: true,
        },
        {
          key: 'twitter_api_secret',
          label: 'API Secret',
          type: 'password',
          value: 'b47Bc8CQRiwoiyqFmngq8GJ9cpUTi8VOV8nzUOrlpPShkjQYNd',
          placeholder: 'Enter Twitter API secret',
          required: true,
          masked: true,
        },
        {
          key: 'twitter_bearer_token',
          label: 'Bearer Token',
          type: 'password',
          value: 'AAAAAAAAAAAAAAAAAAAAAGcf2QEAAAAAhWC0%2B50Re7UP6BfNGJn%2Bk%2Bx8Sos%3D8UYFuZ9Q4sR8bHnETXUUueZjzFMiCsgYIAXW0eqgFYYMuWEnnf',
          placeholder: 'Enter Twitter Bearer token',
          required: true,
          masked: true,
        },
      ],
    },
    {
      name: 'Azure OpenAI',
      icon: <CloudIcon className="h-6 w-6" />,
      description: 'AI-powered analysis and enrichment services',
      status: 'connected',
      lastTested: '1 minute ago',
      fields: [
        {
          key: 'openai_endpoint',
          label: 'Endpoint URL',
          type: 'url',
          value: 'https://AdvantageAI.openai.azure.com/',
          placeholder: 'https://your-resource.openai.azure.com/',
          required: true,
        },
        {
          key: 'openai_api_key',
          label: 'API Key',
          type: 'password',
          value: '6a49d2914c1b4066b1c7046feaa3f95a',
          placeholder: 'Enter Azure OpenAI API key',
          required: true,
          masked: true,
        },
        {
          key: 'openai_model',
          label: 'Model',
          type: 'text',
          value: 'gpt-4o',
          placeholder: 'gpt-4o',
          required: true,
        },
      ],
    },
    {
      name: 'Database',
      icon: <CloudIcon className="h-6 w-6" />,
      description: 'PostgreSQL database connection',
      status: 'connected',
      lastTested: 'Just now',
      fields: [
        {
          key: 'db_connection_string',
          label: 'Connection String',
          type: 'password',
          value: 'Host=localhost;Database=investorcodex;Username=postgres;Password=password',
          placeholder: 'Host=localhost;Database=investorcodex;Username=postgres;Password=yourpassword',
          required: true,
          masked: true,
        },
      ],
    },
    {
      name: 'Vector DB',
      icon: <CloudIcon className="h-6 w-6" />,
      description: 'Embeddings and similarity search storage',
      status: 'disconnected',
      lastTested: 'Never',
      fields: [
        {
          key: 'vectordb_endpoint',
          label: 'Endpoint',
          type: 'url',
          value: '',
          placeholder: 'https://my-vector-db.ai/',
          required: true,
        },
        {
          key: 'vectordb_index',
          label: 'Index',
          type: 'text',
          value: '',
          placeholder: 'companies',
          required: true,
        },
        {
          key: 'vectordb_key',
          label: 'API Key',
          type: 'password',
          value: '',
          placeholder: 'Key for Vector DB',
          required: true,
          masked: true,
        },
      ],
    },
    {
      name: 'Blob Storage',
      icon: <CloudIcon className="h-6 w-6" />,
      description: 'Used for exported files and documents',
      status: 'disconnected',
      lastTested: 'Never',
      fields: [
        {
          key: 'blob_connection',
          label: 'Connection String',
          type: 'password',
          value: '',
          placeholder: 'Azure Storage connection string',
          required: true,
          masked: true,
        },
        {
          key: 'blob_container',
          label: 'Container',
          type: 'text',
          value: '',
          placeholder: 'exports',
          required: true,
        },
      ],
    },
  ]);

  useEffect(() => {
    // Initialize masked fields
    const initialMaskedFields = new Set<string>();
    services.forEach(service => {
      service.fields.forEach(field => {
        if (field.masked) {
          initialMaskedFields.add(`${service.name}_${field.key}`);
        }
      });
    });
    setMaskedFields(initialMaskedFields);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Disconnected</Badge>;
    }
  };

  const toggleFieldVisibility = (serviceName: string, fieldKey: string) => {
    const key = `${serviceName}_${fieldKey}`;
    setMaskedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const updateFieldValue = (serviceName: string, fieldKey: string, value: string) => {
    setServices(prev => prev.map(service => {
      if (service.name === serviceName) {
        return {
          ...service,
          fields: service.fields.map(field => 
            field.key === fieldKey ? { ...field, value } : field
          )
        };
      }
      return service;
    }));
  };

  const testConnection = async (serviceName: string) => {
    try {
      setLoading(true);
      // TODO: Implement real API test calls
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setServices(prev => prev.map(service => {
        if (service.name === serviceName) {
          return {
            ...service,
            status: 'connected' as const,
            lastTested: 'Just now'
          };
        }
        return service;
      }));
    } catch (error) {
      setServices(prev => prev.map(service => {
        if (service.name === serviceName) {
          return {
            ...service,
            status: 'error' as const,
            lastTested: 'Failed'
          };
        }
        return service;
      }));
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setLoading(true);
      // TODO: Implement real API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskValue = (value: string) => {
    if (value.length <= 8) return '*'.repeat(value.length);
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
                <p className="text-gray-600">Manage API keys and service integrations</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={saveConfiguration}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                {saved && (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm">Saved</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Configuration Cards */}
            <div className="space-y-6">
              {services.map((service) => (
                <Card key={service.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(service.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(service.name)}
                          disabled={loading}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Info */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {getStatusIcon(service.status)}
                        <span>
                          {service.status === 'connected' 
                            ? `Connected - Last tested ${service.lastTested}`
                            : service.status === 'error' 
                            ? 'Connection failed - Check configuration'
                            : 'Not connected'}
                        </span>
                      </div>

                      {/* Configuration Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.fields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="relative">
                              <Input
                                type={field.type === 'password' && maskedFields.has(`${service.name}_${field.key}`) ? 'password' : 'text'}
                                value={
                                  field.type === 'password' && maskedFields.has(`${service.name}_${field.key}`)
                                    ? maskValue(field.value)
                                    : field.value
                                }
                                onChange={(e) => updateFieldValue(service.name, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="pr-10"
                              />
                              {field.type === 'password' && (
                                <button
                                  type="button"
                                  onClick={() => toggleFieldVisibility(service.name, field.key)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {maskedFields.has(`${service.name}_${field.key}`) ? (
                                    <EyeIcon className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CogIcon className="h-5 w-5 mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Backend API</h4>
                    <p className="text-lg font-semibold text-gray-900">http://localhost:5000</p>
                    <p className="text-xs text-gray-500">InvestorCodex.Api v1.0</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Frontend</h4>
                    <p className="text-lg font-semibold text-gray-900">http://localhost:3000</p>
                    <p className="text-xs text-gray-500">Next.js v14</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Environment</h4>
                    <p className="text-lg font-semibold text-gray-900">Development</p>
                    <p className="text-xs text-gray-500">Local setup</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <KeyIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        API keys and sensitive configuration are stored securely. In production, use environment variables 
                        or a secure key management service. Never commit API keys to version control.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
