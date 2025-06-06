import React from 'react';
import { Shield, Lock, Trash2, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const PrivacyPage = () => {
  const navigate = useNavigate();

  const privacyPoints = [
    {
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      title: "Data Protection",
      description: "We use advanced encryption and security measures to protect your personal information."
    },
    {
      icon: <Lock className="w-8 h-8 text-blue-400" />,
      title: "Secure Storage",
      description: "Your data is stored in secure servers with restricted access and regular security audits."
    },
    {
      icon: <Trash2 className="w-8 h-8 text-blue-400" />,
      title: "Data Deletion",
      description: "We automatically delete verification data after 30 days, ensuring your privacy."
    },
    {
      icon: <FileCheck className="w-8 h-8 text-blue-400" />,
      title: "Compliance",
      description: "Our processes comply with international data protection standards and regulations."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Our Privacy Commitment</h1>
          <p className="text-xl text-slate-400">
            At Matcher Doc, your data privacy and security are our top priority
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {privacyPoints.map((point, index) => (
            <div key={index} className="bg-slate-800 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                {point.icon}
                <h3 className="text-xl font-semibold ml-4">{point.title}</h3>
              </div>
              <p className="text-slate-300">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-6">How Our Process Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Selfie Capture</h3>
                <p className="text-slate-300">
                  We capture a real-time selfie to ensure the authenticity of the person.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Document Verification</h3>
                <p className="text-slate-300">
                  We validate the authenticity of the ID document against official databases.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Facial Comparison</h3>
                <p className="text-slate-300">
                  We use advanced algorithms to compare the selfie with the document photo.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Deletion</h3>
                <p className="text-slate-300">
                  Once verification is complete, we delete all images and personal data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-slate-400 mb-8">
            If you have any questions about our privacy policy or data handling,
            please don't hesitate to contact us.
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 