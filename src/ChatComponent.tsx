import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';

interface ChatMessage {
  sender: 'user' | 'ollama';
  text: string;
}

interface ChatComponentProps {
  selectedModel: string | null; // Aggiunto il modello selezionato
}

const ChatComponent: React.FC<ChatComponentProps> = ({ selectedModel }) => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = React.useRef<Toast>(null);

  const sendMessage = async () => {
    if (!message || !selectedModel) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Seleziona un modello prima di inviare il messaggio.',
        life: 3000,
      });
      return;
    }
    setLoading(true);
  
    // Aggiungere il messaggio dell'utente alla chat
    setChatHistory([...chatHistory, { sender: 'user', text: message }]);
  
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: selectedModel, prompt: message }), // Usare il modello selezionato
      });
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = ""; // Variabile per costruire la risposta completa
  
      while (!done) {
        const { value, done: readerDone } = await reader?.read()!;
        done = readerDone;
  
        const chunk = decoder.decode(value, { stream: true });
        console.log("Chunk ricevuto:", chunk);
  
        // Dividi i chunk in righe per gestire le risposte JSON
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
  
        // Elaboriamo ogni linea JSON individualmente
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            fullResponse += json.response; // Aggiungi il frammento di risposta
  
            // Se il server indica che la risposta è completata
            if (json.done) {
              setChatHistory((prevChat) => [
                ...prevChat,
                { sender: 'user', text: message },
                { sender: 'ollama', text: fullResponse }, // Aggiungi la risposta completa
              ]);
              setMessage(''); // Ripulisci il campo di input
            }
          } catch (e) {
            console.error("Errore durante il parsing del JSON:", e);
          }
        }
      }
    } catch (error) {
      console.error("Errore durante l'invio del messaggio:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Errore',
        detail: 'Errore durante l\'invio del messaggio.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="p-field p-fluid">
        <span className="p-input-icon-right">
          <i className="pi pi-send" />
          <InputText
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
          />
        </span>
        {loading && <ProgressSpinner style={{ width: '20px', height: '20px' }} />}
      </div>

      <Button
        label="Invia"
        icon="pi pi-check"
        onClick={sendMessage}
        loading={loading}
        disabled={!selectedModel} // Disabilita il pulsante se nessun modello è selezionato
      />

      <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
        {chatHistory.map((msg, index) => (
          <Message
            key={index}
            severity={msg.sender === 'user' ? 'info' : 'success'}
            text={`${msg.sender === 'user' ? 'Tu' : 'Ollama'}: ${msg.text}`}
            className="p-mb-2"
          />
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
