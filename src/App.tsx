import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import ModelDownloadDrawer from './components/modeldownload/ModelDownloadDrawer';
import ChatComponent from './components/chatcomponent/ChatComponent';
import CreateModel from './components/createmodel/CreateModel';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';
import './App.css';
import { Dropdown } from 'primereact/dropdown';
import ManageModelsDrawer from './components/managemodel/ManageModelDrawer';

interface Model {
  label: string;
  value: string;
}

const AppContent: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [manageDrawerVisible, setManageDrawerVisible] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchDownloadedModels();
  }, []);

  const menuItems = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Crea Modello',
      icon: 'pi pi-fw pi-plus',
      command: () => navigate('/create-model')
    }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <Menubar model={menuItems} />

      <Routes>
        <Route path="/create-model" element={<CreateModel />} />
        <Route
          path="/"
          element={
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
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
                  onClick={() => setManageDrawerVisible(true)}
                />
                <Button
                  label="Scarica Modello"
                  icon="pi pi-download"
                  onClick={() => setDrawerVisible(true)}
                />
              </div>

              <div style={{ marginTop: '2rem' }}>
                <ChatComponent selectedModel={selectedModel} />
              </div>
            </div>
          }
        />
      </Routes>

      <ModelDownloadDrawer
        visible={drawerVisible}
        onHide={() => setDrawerVisible(false)}
        fetchDownloadedModels={fetchDownloadedModels}
      />
      <ManageModelsDrawer
        visible={manageDrawerVisible}
        onHide={() => setManageDrawerVisible(false)}
        downloadedModels={downloadedModels}
        onModelDelete={fetchDownloadedModels}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;