import React, { useEffect, useRef, useState } from 'react';
import { playTypeSound } from '../utils/audio';

interface TerminalProps {
  logs: { id: string; text: string; timestamp: number }[];
  typingSpeed: number;
  soundEnabled: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, typingSpeed, soundEnabled }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [displayedLogs, setDisplayedLogs] = useState<{ id: string; text: string; fullText: string; isTyping: boolean }[]>([]);

  useEffect(() => {
    setDisplayedLogs(prev => {
      const newLogs = [...prev];
      logs.forEach(log => {
        if (!newLogs.find(l => l.id === log.id)) {
          newLogs.push({ id: log.id, text: '', fullText: log.text, isTyping: true });
        }
      });
      if (newLogs.length > 200) {
        return newLogs.slice(newLogs.length - 200);
      }
      return newLogs;
    });
  }, [logs]);

  useEffect(() => {
    const typingLogIndex = displayedLogs.findIndex(l => l.isTyping);
    if (typingLogIndex === -1) return;

    const log = displayedLogs[typingLogIndex];
    if (log.text.length < log.fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedLogs(prev => {
          const next = [...prev];
          next[typingLogIndex] = {
            ...log,
            text: log.fullText.slice(0, log.text.length + 1)
          };
          return next;
        });
        if (soundEnabled && log.text.length % 3 === 0) {
          playTypeSound();
        }
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      setDisplayedLogs(prev => {
        const next = [...prev];
        next[typingLogIndex] = { ...log, isTyping: false };
        return next;
      });
    }
  }, [displayedLogs, typingSpeed, soundEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [displayedLogs]);

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-[#33ff00] bg-[#051005] border border-[#33ff00]/30 rounded shadow-[0_0_10px_rgba(51,255,0,0.1)] custom-scrollbar">
      {displayedLogs.map(log => (
        <div key={log.id} className="mb-1 break-words">
          <span className="opacity-50 mr-2">{'>'}</span>
          {log.text}
          {log.isTyping && <span className="animate-pulse ml-1">_</span>}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
