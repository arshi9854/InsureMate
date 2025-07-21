import React, { useState, useEffect } from 'react';

interface RiskFactor {
  name: string;
  impact: string;
  description: string;
  multiplier?: string;
  threshold?: string;
  trend?: string;
  variation?: string;
}

const RiskFactors: React.FC = () => {
  const [factors, setFactors] = useState<RiskFactor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskFactors();
  }, []);

  const fetchRiskFactors = async () => {
    try {
      const response = await fetch('http://localhost:8000/risk-factors');
      
      if (response.ok) {
        const data = await response.json();
        setFactors(data.factors);
      }
    } catch (error) {
      console.error('Failed to fetch risk factors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'very high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'very high':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Insurance Cost Risk Factors
        </h2>
        <p className="text-gray-600">
          Understanding the key factors that influence medical insurance costs can help you make informed decisions about your health and coverage.
        </p>
      </div>

      {/* Risk Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {factors.map((factor, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getImpactIcon(factor.impact)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {factor.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(factor.impact)}`}>
                    {factor.impact} Impact
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              {factor.description}
            </p>
            
            <div className="space-y-2">
              {factor.multiplier && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cost Multiplier:</span>
                  <span className="font-medium text-gray-900">{factor.multiplier}</span>
                </div>
              )}
              
              {factor.threshold && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Threshold:</span>
                  <span className="font-medium text-gray-900">{factor.threshold}</span>
                </div>
              )}
              
              {factor.trend && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trend:</span>
                  <span className="font-medium text-gray-900">{factor.trend}</span>
                </div>
              )}
              
              {factor.variation && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Variation:</span>
                  <span className="font-medium text-gray-900">{factor.variation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Cost Optimization Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Immediate Actions</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Quit smoking to reduce costs by up to 75%</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Maintain healthy BMI (18.5-24.9) through diet and exercise</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Consider preventive care to avoid future complications</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Long-term Strategies</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">→</span>
                <span>Regular health screenings and check-ups</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">→</span>
                <span>Lifestyle modifications for chronic condition management</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">→</span>
                <span>Compare insurance plans based on your risk profile</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistical Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">
          📊 Key Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">4x</div>
            <div className="text-indigo-100">Higher costs for smokers</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">86%</div>
            <div className="text-indigo-100">Model prediction accuracy</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">$13K</div>
            <div className="text-indigo-100">Average annual cost</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskFactors;