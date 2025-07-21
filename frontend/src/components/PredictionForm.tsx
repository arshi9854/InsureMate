import React, { useState } from 'react';

interface FormData {
  age: number;
  sex: string;
  bmi: number;
  children: number;
  smoker: string;
  region: string;
}

interface PredictionFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    age: 30,
    sex: 'male',
    bmi: 25.0,
    children: 0,
    smoker: 'no',
    region: 'northeast'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'children' ? parseInt(value) : 
               name === 'bmi' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Insurance Cost Prediction
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="18"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* BMI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BMI (Body Mass Index)
          </label>
          <input
            type="number"
            name="bmi"
            value={formData.bmi}
            onChange={handleChange}
            min="10"
            max="60"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Normal: 18.5-24.9, Overweight: 25-29.9, Obese: 30+
          </p>
        </div>

        {/* Children */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Children
          </label>
          <input
            type="number"
            name="children"
            value={formData.children}
            onChange={handleChange}
            min="0"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Smoker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Smoking Status
          </label>
          <select
            name="smoker"
            value={formData.smoker}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="no">Non-Smoker</option>
            <option value="yes">Smoker</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="northeast">Northeast</option>
            <option value="northwest">Northwest</option>
            <option value="southeast">Southeast</option>
            <option value="southwest">Southwest</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Calculating...
            </div>
          ) : (
            'Predict Insurance Cost'
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;