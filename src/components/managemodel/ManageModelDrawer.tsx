import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

interface Model {
  label: string;
  value: string;
}

interface ManageModelsDrawerProps {
  visible: boolean;
  onHide: () => void;
  downloadedModels: Model[];
  onModelDelete: () => void; // Funzione per aggiornare la lista dopo la cancellazione
}

const ManageModelsDrawer: React.FC<ManageModelsDrawerProps> = ({
  visible,
  onHide,
  downloadedModels,
  onModelDelete
}) => {
  const toast = React.useRef<Toast>(null);

  // Funzione per eliminare un modello
  const deleteModel = async (modelName: string) => {
    try {
      const response = await fetch('http://localhost:11434/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Modello eliminato',
          detail: `Il modello ${modelName} è stato eliminato con successo.`,
          life: 3000,
        });

        onModelDelete(); // Aggiorna la lista dei modelli dopo la cancellazione
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Errore',
          detail: `Impossibile eliminare il modello ${modelName}.`,
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Errore',
        detail: 'Errore durante la cancellazione del modello.',
        life: 3000,
      });
      console.error('Errore durante la cancellazione del modello:', error);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <Sidebar visible={visible} onHide={onHide} position="right">
        <h3>Modelli Scaricati</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {downloadedModels.map((model) => (
            <li key={model.value} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>{model.label}</span>
              <Button
                icon="pi pi-times"
                className="p-button-danger p-button-rounded"
                onClick={() => deleteModel(model.value)}
              />
            </li>
          ))}
        </ul>
      </Sidebar>
    </>
  );
};

export default ManageModelsDrawer;
