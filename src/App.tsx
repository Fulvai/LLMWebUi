import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import ModelDownloadDrawer from './ModelDownloadDrawer';
import ChatComponent from './ChatComponent';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';
import { Dropdown  } from 'primereact/dropdown';

interface Model {
  label: string;
  value: string;
}

const App: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  
  const fetchDownloadedModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      console.log(data);
      const models = data.models.map((model: { name: string; model: string }) => ({
        label: model.name, 
        value: model.model,
      }));

      setDownloadedModels(models);
    } catch (error) {
      console.error('Errore nel caricamento dei modelli scaricati:', error);
    }
  };

  // Caricare i modelli scaricati al montaggio del componente
  useEffect(() => {
    fetchDownloadedModels();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Dropdown per i modelli scaricati */}
        <Dropdown
          value={selectedModel}
          options={downloadedModels}
          onChange={(e) => setSelectedModel(e.value)}
          placeholder="Seleziona un modello"
          style={{ width: '300px' }}
        />

        {/* Pulsante per aprire il drawer */}
        <Button
          label="Scarica Modello"
          icon="pi pi-download"
          onClick={() => setDrawerVisible(true)}
        />
      </div>

      {/* Drawer per il download dei modelli */}
      <ModelDownloadDrawer
        visible={drawerVisible}
        onHide={() => setDrawerVisible(false)}
      />

      {/* Component di chat */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Chat con Ollama</h2>
        <ChatComponent selectedModel={selectedModel} />
      </div>
    </div>
  );
};

export default App;
