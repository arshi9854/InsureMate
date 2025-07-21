import React, { useState, useEffect } from 'react';

interface AnalyticsTrends {
  risk_trends: Array<{
    category: string;
    avg_cost: number;
    count: number;
  }>;
  smoking_analysis: Array<{
    smoker: string;
    avg_cost: number;
    count: number;
  }>;
  bmi_analysis: Array<{
    category: string;
    avg_cost: number;
    count: number;
  }>;
}

interface ModelPerformance {
  model_version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  rmse: number;
  mae: number;
  feature_importance: Record<string, number>;
  model_weights: Record<string, number>;
  last_updated: string;
}

const AdvancedAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'performance'>('trends');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [trendsResponse, performanceResponse] = await Promise.all([
        fetch('http://localhost:8000/analytics/trends', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }),
        fetch('http://localhost:8000/model/performance', {
          headers: { 'Authorization': 'Bearer demo-token' }
        })
      ]);

      if (trendsResponse.ok && performanceResponse.ok) {
        const trendsData = await trendsResponse.json();
        const performanceData = await performanceResponse.json();
        setTrends(trendsData);
        setPerformance(performanceData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'Very High Risk':
        return 'bg-red-500';
      case 'High Risk':
        return 'bg-orange-500';
      case 'Medium Risk':
        return 'bg-yellow-500';
      case 'Low Risk':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'trends'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Analytics Trends
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'performance'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🤖 Model Performance
          </button>
        </div>

        {activeTab === 'trends' && trends && (
          <div className="space-y-8">
            {/* Risk Category Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cost Analysis by Risk Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trends.risk_trends.map((trend, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(trend.category)} mr-2`}></div>
                      <span className="font-medium text-gray-900">{trend.category}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(trend.avg_cost)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {trend.count} predictions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smoking Impact Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Smoking Impact Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trends.smoking_analysis.map((analysis, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {analysis.smoker === 'yes' ? '🚬' : '🚭'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {analysis.smoker === 'yes' ? 'Smokers' : 'Non-Smokers'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {analysis.count} individuals
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(analysis.avg_cost)}
                        </div>
                        <div className="text-sm text-gray-600">Average Cost</div>
                      </div>
                    </div>
                    
                    {analysis.smoker === 'yes' && trends.smoking_analysis.length === 2 && (
                      <div className="mt-4 p-3 bg-red-100 rounded-lg">
                        <div className="text-sm text-red-800">
                          <strong>Impact:</strong> Smokers pay{' '}
                          {Math.round(
                            (analysis.avg_cost / trends.smoking_analysis.find(a => a.smoker === 'no')!.avg_cost) * 100 - 100
                          )}% more than non-smokers
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BMI Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                BMI Category Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trends.bmi_analysis.map((analysis, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        {analysis.category}
                      </div>
                      <div className="text-2xl font-bold text-indigo-600 mb-1">
                        {formatCurrency(analysis.avg_cost)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {analysis.count} cases
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && performance && (
          <div className="space-y-8">
            {/* Model Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Model Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{(performance.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-green-100">Accuracy</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{(performance.precision * 100).toFixed(1)}%</div>
                  <div className="text-blue-100">Precision</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{(performance.recall * 100).toFixed(1)}%</div>
                  <div className="text-purple-100">Recall</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{(performance.f1_score * 100).toFixed(1)}%</div>
                  <div className="text-orange-100">F1 Score</div>
                </div>
              </div>
            </div>

            {/* Error Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Error Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-gray-900">
                    ${performance.rmse.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Root Mean Square Error (RMSE)</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Lower values indicate better model performance
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-gray-900">
                    ${performance.mae.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Mean Absolute Error (MAE)</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Average prediction error in dollars
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Importance */}
            {performance.feature_importance && Object.keys(performance.feature_importance).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Feature Importance
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-3">
                    {Object.entries(performance.feature_importance)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 8)
                      .map(([feature, importance], index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-32 text-sm text-gray-600 capitalize">
                            {feature.replace('_', ' ')}
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${(importance * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {(importance * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Model Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Model Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Model Version</div>
                    <div className="font-medium text-gray-900">{performance.model_version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="font-medium text-gray-900">
                      {new Date(performance.last_updated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {performance.model_weights && Object.keys(performance.model_weights).length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Ensemble Model Weights</div>
                    <div className="flex space-x-4">
                      {Object.entries(performance.model_weights).map(([model, weight], index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {model.replace('_', ' ')}
                          </div>
                          <div className="text-lg font-bold text-indigo-600">
                            {(weight * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;