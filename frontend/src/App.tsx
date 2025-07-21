import React, { useState, useEffect } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import RiskFactors from './components/RiskFactors.tsx';
import AdvancedAnalytics from './components/AdvancedAnalytics.tsx';
import Header from './components/Header.tsx';
import Login from './components/Login.tsx';
import Signup from './components/Signup.tsx';

interface User {
  email: string;
  name: string;
  token: string;
}

interface PredictionResult {
  predicted_cost: number;
  risk_category: string;
  confidence_score: number;
  factors: {
    age_impact: number;
    bmi_impact: number;
    smoking_impact: number;
    children_impact: number;
    region_multiplier: number;
  };
  timestamp: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'predict' | 'dashboard' | 'factors' | 'analytics'>('predict');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('healthcost_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('healthcost_user');
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleSignup = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setPredictionResult(null);
    setActiveTab('predict');
  };

  const handlePrediction = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || 'demo-token'}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show authentication screens if user is not logged in
  if (!user) {
    if (authMode === 'login') {
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthMode('signup')}
        />
      );
    } else {
      return (
        <Signup 
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
  }

  // Show main application if user is logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} onLogout={handleLogout} />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'predict', label: '🔮 Predict Cost', icon: '🔮' },
              { key: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { key: 'analytics', label: '📈 Analytics', icon: '📈' },
              { key: 'factors', label: '⚠️ Risk Factors', icon: '⚠️' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'predict' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <PredictionForm 
                  onSubmit={handlePrediction} 
                  isLoading={isLoading}
                />
              </div>
              <div>
                {predictionResult && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Prediction Result for {user.name}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                        <div className="text-3xl font-bold">
                          ${predictionResult.predicted_cost.toLocaleString()}
                        </div>
                        <div className="text-blue-100">Estimated Annual Cost</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {predictionResult.risk_category}
                          </div>
                          <div className="text-gray-600">Risk Level</div>
                        </div>
                        
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {(predictionResult.confidence_score * 100).toFixed(1)}%
                          </div>
                          <div className="text-gray-600">Confidence</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                        <div className="space-y-2">
                          {Object.entries(predictionResult.factors).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600 capitalize">
                                {key.replace('_', ' ')}:
                              </span>
                              <span className="font-medium">
                                {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'analytics' && <AdvancedAnalytics />}
          {activeTab === 'factors' && <RiskFactors />}
        </div>
      </main>
    </div>
  );
}

export default App;