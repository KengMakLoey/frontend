import { useState, useEffect, useRef } from 'react';
import type { QueueData } from './types';
import { WS_URL } from './api';

// ==================== WEBSOCKET HOOK ====================
export function useQueueWebSocket(
  vn: string | undefined, 
  onUpdate: (data: QueueData) => void
): { isConnected: boolean } {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!vn) {
      setIsConnected(false);
      return;
    }

    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      try {
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
          if (!isMounted || !ws.current) return;
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          ws.current.send(JSON.stringify({ type: 'subscribe', vn }));
        };

        ws.current.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'queue_update') {
              onUpdate(message.data);
            } else if (message.type === 'subscribed') {
              console.log('✅ Subscribed to VN:', message.vn);
            }
          } catch (err) {
            console.error('WebSocket message parse error:', err);
          }
        };

        ws.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };

        ws.current.onclose = () => {
          if (!isMounted) return;
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          
          reconnectTimeout.current = setTimeout(() => {
            if (isMounted) {
              console.log('🔄 Attempting to reconnect...');
              connect();
            }
          }, 3000);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [vn, onUpdate]);

  return { isConnected };
}