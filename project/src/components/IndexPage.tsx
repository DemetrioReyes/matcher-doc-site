import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from './Header';

const IndexPage = () => {
  const navigate = useNavigate();

  const benefits = [
    "Instant verification",
    "Maximum security",
    "Regulatory compliance"
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Secure Identity Verification
          </h1>
          <p className="text-xl text-slate-400">
            Our advanced facial verification technology ensures the security and privacy of your data.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How does it work?</h2>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Take a selfie following the instructions</h3>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Capture your ID document</h3>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Our system verifies authenticity</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Benefits</h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/verify')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            Start Verification
          </button>
        </div>

        <footer className="mt-16 text-center text-slate-400">
          <p>© 2025 Matcher Doc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default IndexPage; 