import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import ModelDownloadDrawer from './components/modeldownload/ModelDownloadDrawer';
import ChatComponent from './components/chatcomponent/ChatComponent';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';
import { Dropdown  } from 'primereact/dropdown';
import ManageModelsDrawer from './components/managemodel/ManageModelDrawer';

interface Model {
  label: string;
  value: string;
}

const App: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [manageDrawerVisible, setManageDrawerVisible] = useState(false);
  
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
 <Button
          label="Gestisci i Modelli"
          icon="pi pi-cog"
          onClick={() => setManageDrawerVisible(true)} // Apre il drawer di gestione
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
        fetchDownloadedModels={fetchDownloadedModels}
      />
       <ManageModelsDrawer
        visible={manageDrawerVisible}
        onHide={() => setManageDrawerVisible(false)}
        downloadedModels={downloadedModels} // Passa i modelli scaricati
        onModelDelete={fetchDownloadedModels} // Aggiorna la lista dei modelli dopo la cancellazione
      />

      {/* Component di chat */}
      <div style={{ marginTop: '2rem' }}>
        <ChatComponent selectedModel={selectedModel} />
      </div>
    </div>
  );
};

export default App;
