import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Basic',
      price: 'RD$ 2,500',
      period: 'per month',
      description: 'Ideal for small businesses and startups',
      features: [
        'Up to 100 monthly verifications',
        'Basic facial verification',
        'Email support',
        'Response time: 24 hours',
        'Basic reports'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      price: 'RD$ 5,000',
      period: 'per month',
      description: 'Perfect for growing businesses',
      features: [
        'Up to 500 monthly verifications',
        'Advanced facial verification',
        'Document OCR',
        'Priority support',
        'Response time: 12 hours',
        'Detailed reports',
        'Custom API'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'RD$ 10,000',
      period: 'per month',
      description: 'For large companies and corporations',
      features: [
        'Unlimited verifications',
        'Advanced facial verification',
        'Document OCR',
        '24/7 support',
        'Response time: 4 hours',
        'Custom reports',
        'Dedicated API',
        'Guaranteed SLA',
        'Custom integration'
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Plans & Pricing</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include access to our identity verification API.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? 'bg-blue-600 transform scale-105'
                  : 'bg-slate-800'
              }`}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="text-3xl font-bold mb-1">{plan.price}</div>
                <div className="text-slate-400">{plan.period}</div>
                <p className="mt-4 text-sm text-slate-300">{plan.description}</p>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-1" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-slate-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
          <p className="text-slate-400 mb-8">
            Contact us to create a plan that fits your specific needs.
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 