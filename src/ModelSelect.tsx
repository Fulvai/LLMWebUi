import React from 'react';
import { Dropdown  } from 'primereact/dropdown';

const models = [
  { label: 'Llama 3.2 3B 2.0GB', value: 'llama3.2' },
  { label: 'Llama 3.2 1B 1.3GB', value: 'llama3.2:1b' },
  { label: 'Llama 3.1 8B 4.7GB', value: 'llama3.1' },
  { label: 'Llama 3.1 70B 40GB', value: 'llama3.1:70b' },
  { label: 'Llama 3.1 405B 231GB', value: 'llama3.1:405b' },
  { label: 'Phi 3 Mini 3.8B 2.3GB', value: 'phi3' },
  { label: 'Phi 3 Medium 14B 7.9GB', value: 'phi3:medium' },
  { label: 'Gemma 2 2B 1.6GB', value: 'gemma2:2b' },
  { label: 'Gemma 2 9B 5.5GB', value: 'gemma2' },
  { label: 'Gemma 2 27B 16GB', value: 'gemma2:27b' },
  { label: 'Mistral 7B 4.1GB', value: 'mistral' },
  { label: 'Moondream 2 1.4B 829MB', value: 'moondream' },
  { label: 'Neural Chat 7B 4.1GB', value: 'neural-chat' },
  { label: 'Starling 7B 4.1GB', value: 'starling-lm' },
  { label: 'Code Llama 7B 3.8GB', value: 'codellama' },
  { label: 'Llama 2 Uncensored 7B 3.8GB', value: 'llama2-uncensored' },
  { label: 'LLaVA 7B 4.5GB', value: 'llava' },
  { label: 'Solar 10.7B 6.1GB', value: 'solar' },
];

interface ModelSelectProps {
  selectedModel: string | null;
  setSelectedModel: (model: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ selectedModel, setSelectedModel }) => {
  return (
    <Dropdown 
      value={selectedModel}
      options={models}
      onChange={(e) => setSelectedModel(e.value)}
      style={{ width: '100%' }}
    />
  );
};

export default ModelSelect;
