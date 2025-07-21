import React, { useState, useEffect } from 'react';

interface HealthMetrics {
  total_predictions: number;
  average_cost: number;
  high_risk_percentage: number;
  model_accuracy: number;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/health-metrics', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Platform Analytics Dashboard
        </h2>
        
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Predictions */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🔮</div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">
                    {metrics.total_predictions.toLocaleString()}
                  </div>
                  <div className="text-blue-100">Total Predictions</div>
                </div>
              </div>
            </div>

            {/* Average Cost */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">💰</div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">
                    ${metrics.average_cost.toLocaleString()}
                  </div>
                  <div className="text-green-100">Average Cost</div>
                </div>
              </div>
            </div>

            {/* High Risk Percentage */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">⚠️</div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">
                    {metrics.high_risk_percentage}%
                  </div>
                  <div className="text-red-100">High Risk Cases</div>
                </div>
              </div>
            </div>

            {/* Model Accuracy */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🎯</div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">
                    {metrics.model_accuracy.toFixed(1)}%
                  </div>
                  <div className="text-purple-100">Model Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        
        <div className="space-y-4">
          {[
            { time: '2 minutes ago', action: 'High-risk prediction generated', cost: '$45,230', user: 'User #1247' },
            { time: '5 minutes ago', action: 'Low-risk prediction generated', cost: '$8,450', user: 'User #1246' },
            { time: '8 minutes ago', action: 'Medium-risk prediction generated', cost: '$18,920', user: 'User #1245' },
            { time: '12 minutes ago', action: 'Model accuracy updated', cost: '86.2%', user: 'System' },
            { time: '15 minutes ago', action: 'High-risk prediction generated', cost: '$52,100', user: 'User #1244' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.time} • {activity.user}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {activity.cost}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Prediction Trends (Last 30 Days)
        </h3>
        
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📈</div>
            <div>Chart visualization would go here</div>
            <div className="text-sm">(Integration with Chart.js/D3.js)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;