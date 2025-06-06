import React from 'react';
import { Chrome, Globe, Monitor, Laptop } from 'lucide-react';

const BrowserCompatibility = () => {
  const browsers = [
    {
      name: 'Google Chrome',
      icon: <Chrome className="w-8 h-8 text-blue-500" />,
      version: 'Version 60+',
      status: 'Fully Supported'
    },
    {
      name: 'Mozilla Firefox',
      icon: <Globe className="w-8 h-8 text-orange-500" />,
      version: 'Version 60+',
      status: 'Fully Supported'
    },
    {
      name: 'Safari',
      icon: <Monitor className="w-8 h-8 text-blue-400" />,
      version: 'Version 12+',
      status: 'Fully Supported'
    },
    {
      name: 'Microsoft Edge',
      icon: <Laptop className="w-8 h-8 text-blue-600" />,
      version: 'Version 79+',
      status: 'Fully Supported'
    }
  ];

  return (
    <div className="bg-slate-800 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Browser Compatibility</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {browsers.map((browser, index) => (
          <div key={index} className="bg-slate-900 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              {browser.icon}
              <h3 className="ml-3 font-semibold">{browser.name}</h3>
            </div>
            <div className="text-sm text-slate-400">
              <p>{browser.version}</p>
              <p className="text-green-400 mt-1">{browser.status}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-400">
        For the best experience, we recommend using the latest version of any of these browsers.
        Our facial recognition technology requires a modern browser with camera access.
      </p>
    </div>
  );
};

export default BrowserCompatibility; 