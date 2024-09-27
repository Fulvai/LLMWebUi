import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import ModelSelect from './ModelSelect';

interface ModelDownloadDrawerProps {
  visible: boolean;
  onHide: () => void;
}

const ModelDownloadDrawer: React.FC<ModelDownloadDrawerProps> = ({ visible, onHide }) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = React.useRef<Toast>(null);

  const downloadModel = async () => {
    if (!selectedModel) return;

    setLoading(true);
    setProgress(0); // Reset progress

    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: selectedModel }),
      });

      // Simulare progresso con aggiornamento di esempio
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader?.read()!;
        done = readerDone;

        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk); // Stampa i dati ricevuti

        const parsedChunk = JSON.parse(chunk);
        if (parsedChunk.status === 'downloading digestname') {
          const percentage = Math.min(100, (parsedChunk.completed / parsedChunk.total) * 100);
          setProgress(percentage);
        } else if (parsedChunk.status === 'success') {
          setProgress(100);
          toast.current?.show({
            severity: 'success',
            summary: 'Download completato',
            detail: `Il modello ${selectedModel} è stato scaricato con successo!`,
            life: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Errore nel download del modello:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Errore',
        detail: 'Si è verificato un errore durante il download.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Sidebar visible={visible} onHide={onHide} position="right">
        <h3>Seleziona un Modello da Scaricare</h3>
        <ModelSelect selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

        <div style={{ marginTop: '1rem' }}>
          <Button
            label="Download"
            icon="pi pi-cloud-download"
            onClick={downloadModel}
            disabled={!selectedModel || loading}
            className="p-button-success"
          />
        </div>

        {loading && (
          <div style={{ marginTop: '2rem' }}>
            <ProgressBar value={progress} />
            <p>Progresso: {Math.round(progress)}%</p>
          </div>
        )}
      </Sidebar>
    </>
  );
};

export default ModelDownloadDrawer;
