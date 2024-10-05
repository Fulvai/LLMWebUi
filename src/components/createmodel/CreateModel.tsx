import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import ModelSelect from '../modelselect/ModelSelect'; // Per il download dei modelli
import { Dropdown } from 'primereact/dropdown'; // Per visualizzare i modelli scaricati
import './CreateModel.css';

interface CreateModelProps {
  downloadedModels: { label: string; value: string }[]; // I modelli scaricati
}

const CreateModel: React.FC<CreateModelProps> = ({ downloadedModels }) => {
  const [modelName, setModelName] = useState(''); // Nome del modello
  const [systemText, setSystemText] = useState(''); // Testo fornito dall'utente
  const [selectedModel, setSelectedModel] = useState<string | null>(null); // Stato per il modello selezionato
  const [loading, setLoading] = useState(false);
  const toast = React.useRef<Toast>(null);

  const handleCreateModel = async () => {
    if (!modelName || !systemText || !selectedModel) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Errore',
        detail: 'Nome del modello, testo del sistema e selezione del modello sono richiesti.',
        life: 3000,
      });
      return;
    }

    const modelfileContent = `FROM ${selectedModel}\nSYSTEM ${systemText}`;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:11434/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          modelfile: modelfileContent,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader?.read()!;
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Successo',
        detail: 'Modello creato con successo!',
        life: 3000,
      });
    } catch (error) {
      console.error('Errore nella creazione del modello:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Errore',
        detail: 'Errore nella creazione del modello.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-model-container">
      <div className="create-model-form">
        <Toast ref={toast} />
        <h2>Crea un Nuovo Modello</h2>
        
        {/* Campo per il nome del modello */}
        <InputText
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Nome del Modello"
        />

        {/* Dropdown per la selezione dei modelli scaricati */}
        <Dropdown
          value={selectedModel}
          options={downloadedModels} 
          onChange={(e) => setSelectedModel(e.value)}
          placeholder="Seleziona un modello scaricato"
          style={{ width: '100%' }}
        />

        {/* Campo per il contenuto del sistema (testo dell'utente) */}
        <InputText
          value={systemText}
          onChange={(e) => setSystemText(e.target.value)}
          placeholder="Testo del Sistema"
        />

        {/* Pulsante per creare il modello */}
        <Button
          label="Crea Modello"
          icon="pi pi-plus"
          onClick={handleCreateModel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateModel;
