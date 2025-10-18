import React, { useState } from 'react';
import { useGovernance } from '../contexts/GovernanceContext';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ProposalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalCreationModal: React.FC<ProposalCreationModalProps> = ({ isOpen, onClose }) => {
  const { createProposal } = useGovernance();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'protocol' as 'protocol' | 'treasury' | 'governance' | 'technical',
    endTime: 7, // days
    options: ['Option 1', 'Option 2', 'Option 3']
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endTime = Date.now() + (formData.endTime * 24 * 60 * 60 * 1000);
      
      createProposal({
        title: formData.title,
        description: formData.description,
        status: 'active',
        creator: '0x1234...5678', // Mock creator address
        endTime,
        category: formData.category,
        options: formData.options
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'protocol',
        endTime: 7,
        options: ['Option 1', 'Option 2', 'Option 3']
      });

      onClose();
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, `Option ${prev.options.length + 1}`]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-forge-gray p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Proposal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
              placeholder="Enter a clear, concise title for your proposal"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Description *
            </label>
            <textarea
              required
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
              placeholder="Provide a detailed description of your proposal. Include background, rationale, and expected outcomes."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Category and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Category *
              </label>
              <select
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="protocol">Protocol</option>
                <option value="treasury">Treasury</option>
                <option value="governance">Governance</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Voting Duration (days) *
              </label>
              <select
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: parseInt(e.target.value) }))}
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>

          {/* Voting Options */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Voting Options *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    required
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-forge-primary text-white rounded-lg hover:bg-forge-primary/80 transition-colors"
              >
                Add Option
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-gray-800 border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-2">Preview</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Title:</span>
                <p className="text-white">{formData.title || 'Enter a title...'}</p>
              </div>
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="ml-2 px-2 py-1 bg-forge-primary/20 text-forge-primary rounded text-xs">
                  {formData.category}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="ml-2 text-white">{formData.endTime} days</span>
              </div>
              <div>
                <span className="text-gray-400">Options:</span>
                <div className="mt-1 space-y-1">
                  {formData.options.map((option, index) => (
                    <div key={index} className="text-white">• {option}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  <span>Create Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
