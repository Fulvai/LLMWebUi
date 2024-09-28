import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import ModelSelect from '../modelselect/ModelSelect';

interface ModelDownloadDrawerProps {
  visible: boolean;
  onHide: () => void;
  fetchDownloadedModels: () => void; // Funzione per aggiornare i modelli scaricati
}

const ModelDownloadDrawer: React.FC<ModelDownloadDrawerProps> = ({ visible, onHide, fetchDownloadedModels }) => {
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

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = ''; // Buffer per accumulare i dati

      while (!done) {
        const { value, done: readerDone } = await reader?.read()!;
        done = readerDone;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk; // Accumula i dati nello stream
        let boundary = buffer.indexOf('\n'); // Trova il separatore di linea (newline)

        while (boundary !== -1) {
          const completeChunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 1);
          boundary = buffer.indexOf('\n');

          try {
            const parsedChunk = JSON.parse(completeChunk);

            if (parsedChunk.status.startsWith('pulling') && parsedChunk.completed !== undefined && parsedChunk.total !== undefined) {
              const percentage = Math.min(99, (parsedChunk.completed / parsedChunk.total) * 100);
              setProgress(percentage); // Aggiorna lo stato del progresso
            } else if (parsedChunk.status === 'success') {
              setProgress(100); // Imposta il progresso al 100%
              toast.current?.show({
                severity: 'success',
                summary: 'Download completato',
                detail: `Il modello ${selectedModel} è stato scaricato con successo!`,
                life: 3000,
              });

              // Aggiorna la lista dei modelli scaricati
              fetchDownloadedModels(); // Chiama la funzione per aggiornare i modelli
            }
          } catch (e) {
            console.error('Errore durante il parsing del JSON:', e);
          }
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
