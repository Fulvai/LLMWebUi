import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import './ChatComponent.css'; // Import del file CSS

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatComponentProps {
  selectedModel: string | null;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ selectedModel }) => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Storia della chat
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Aggiunto ref per l'input

  // Scroll automatico quando un nuovo messaggio viene aggiunto
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Focus automatico sull'input al montaggio e quando la risposta è completata
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus(); // Imposta il focus sull'input se non è in caricamento
    }
  }, [loading]); // Aggiorniamo il focus solo quando loading cambia

  // Funzione per cancellare tutti i messaggi
  const clearMessages = () => {
    setChatHistory([]); // Svuota lo stato chatHistory per rimuovere tutti i messaggi
    toast.current?.show({
      severity: 'info',
      summary: 'Chat Pulita',
      detail: 'Tutti i messaggi sono stati cancellati.',
      life: 3000,
    });
  };

  // Gestire l'invio con il tasto Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

    // Aggiungere il messaggio dell'utente alla chat
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory((prevChat) => [...prevChat, newUserMessage]);
    setMessage(''); // Pulire l'input subito dopo l'invio
    setLoading(true);

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...chatHistory, newUserMessage], // Includi l'intero contesto della chat
          stream: true, // Usa il true per ottenere lo streaming della risposta
        }),
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
            fullResponse += json.message.content; // Aggiungi il frammento di risposta

            // Se il server indica che la risposta è completata
            if (json.done) {
              const botMessage: ChatMessage = { role: 'assistant', content: fullResponse };
              setChatHistory((prevChat) => [
                ...prevChat,
                botMessage, // Aggiungi la risposta del bot
              ]);
              setLoading(false);

              // Dopo la risposta del modello, metti il focus sull'input (già gestito da useEffect su loading)
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
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <Toast ref={toast} />
      
      {/* Pulsante per cancellare i messaggi */}
      <div className="clear-button-container">
        <Button
          label="Cancella Messaggi"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={clearMessages}
        />
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        <div className="messages-container">
          <div className="spacer"></div>
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </div>
      <div className="input-container">
        <span className="input-text">
          <InputText
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            onKeyPress={handleKeyPress}
            disabled={loading}
            ref={inputRef} // Aggiunto ref per l'input
          />
        </span>
        <Button
          label="Invia"
          icon="pi pi-send"
          onClick={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ChatComponent;
