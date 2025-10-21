import React, { useState } from 'react';
import { useCrucibleCreation, CrucibleTemplate } from '../contexts/CrucibleCreationContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CrucibleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrucibleCreationModal: React.FC<CrucibleCreationModalProps> = ({ isOpen, onClose }) => {
  const { templates, createCrucible } = useCrucibleCreation();
  const { addCrucible } = useCrucible();
  const [selectedTemplate, setSelectedTemplate] = useState<CrucibleTemplate | null>(null);
  const [customConfig, setCustomConfig] = useState({
    name: '',
    symbol: '',
    description: '',
    apr: 0.08,
    minDeposit: 1,
    maxDeposit: 1000,
    lockPeriod: 30
  });
  const [step, setStep] = useState<'template' | 'customize' | 'confirm'>('template');

  const handleTemplateSelect = (template: CrucibleTemplate) => {
    setSelectedTemplate(template);
    setCustomConfig({
      name: template.name,
      symbol: template.symbol,
      description: template.description,
      apr: template.apr,
      minDeposit: template.minDeposit,
      maxDeposit: template.maxDeposit,
      lockPeriod: template.lockPeriod
    });
    setStep('customize');
  };

  const handleCreateCrucible = () => {
    if (selectedTemplate) {
      const crucibleConfig = {
        ...selectedTemplate,
        ...customConfig,
        id: `custom_${Date.now()}`
      };
      
      // Create the crucible in the creation context
      createCrucible(crucibleConfig);
      
      // Add the crucible to the main crucibles list
      const newCrucible = {
        id: crucibleConfig.id,
        name: crucibleConfig.name,
        symbol: crucibleConfig.symbol,
        tvl: 0, // Start with 0 TVL
        apr: crucibleConfig.apr,
        status: 'active' as const,
        userDeposit: 0, // Start with 0 user deposit
        userShares: 0, // Start with 0 user shares
        icon: selectedTemplate.icon
      };
      
      addCrucible(newCrucible);
      
      onClose();
      setStep('template');
      setSelectedTemplate(null);
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-forge-gray p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">🔥 Create FOGO Crucible</h2>
            <p className="text-gray-400 text-sm mt-1">Design your custom FOGO token strategy</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'template' ? 'bg-forge-primary text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-sm font-bold">1</div>
              <span>Template</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-600" />
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'customize' ? 'bg-forge-primary text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-sm font-bold">2</div>
              <span>Customize</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-600" />
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step === 'confirm' ? 'bg-forge-primary text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-sm font-bold">3</div>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 'template' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">🔥 Choose Your FOGO Strategy</h3>
              <p className="text-gray-400">Select a template to start building your custom FOGO crucible</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="card bg-forge-gray border-gray-700 hover:border-forge-primary cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">{template.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{template.name}</h4>
                      <p className="text-gray-400 text-sm">{template.symbol}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">APY:</span>
                      <span className="text-forge-accent font-medium">{formatPercentage(template.apr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min Deposit:</span>
                      <span className="text-white">{formatCurrency(template.minDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lock Period:</span>
                      <span className="text-white">{template.lockPeriod} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customize */}
        {step === 'customize' && selectedTemplate && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Customize Your Crucible</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Symbol</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                  value={customConfig.symbol}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, symbol: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary h-20"
                  value={customConfig.description}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">APR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                  value={customConfig.apr * 100}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, apr: parseFloat(e.target.value) / 100 }))}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Min Deposit</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                  value={customConfig.minDeposit}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, minDeposit: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Max Deposit</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                  value={customConfig.maxDeposit}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, maxDeposit: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Lock Period (days)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-forge-primary"
                  value={customConfig.lockPeriod}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, lockPeriod: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep('template')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedTemplate && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Crucible Creation</h3>
            <div className="card bg-gray-800 border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{selectedTemplate.icon}</div>
                <div>
                  <h4 className="text-xl font-semibold text-white">{customConfig.name}</h4>
                  <p className="text-gray-400">{customConfig.symbol}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{customConfig.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">APR:</span>
                  <p className="text-forge-accent font-medium">{formatPercentage(customConfig.apr)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Min Deposit:</span>
                  <p className="text-white">{formatCurrency(customConfig.minDeposit)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Max Deposit:</span>
                  <p className="text-white">{formatCurrency(customConfig.maxDeposit)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Lock Period:</span>
                  <p className="text-white">{customConfig.lockPeriod} days</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep('customize')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleCreateCrucible}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckIcon className="h-5 w-5" />
                <span>Create Crucible</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
