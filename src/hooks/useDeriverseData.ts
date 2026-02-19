import { useState, useCallback, useRef } from 'react';
import { fetchClientData, fetchMarketData, type DeriverseData, type MarketInstrument } from '@/lib/deriverse';

export type DataMode = 'live' | 'demo';

export type DataState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'market-only'; instruments: MarketInstrument[]; mode: DataMode; error?: string }
  | { status: 'loaded'; data: DeriverseData; mode: DataMode }
  | { status: 'error'; error: string };

export function useDeriverseData() {
  const [state, setState] = useState<DataState>({ status: 'idle' });
  const [walletAddress, setWalletAddress] = useState('');
  const modeRef = useRef<DataMode>('live');

  const loadMarketData = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const instruments = await fetchMarketData();
      modeRef.current = 'live';
      setState({ status: 'market-only', instruments, mode: 'live' });
    } catch (e: any) {
      console.warn('Live data unavailable, using demo mode:', e);
      modeRef.current = 'demo';

      let errorMessage = e.message || String(e);
      // Customize error for the specific Devnet version mismatch we found
      if (errorMessage.includes('buffer length') || errorMessage.includes('RangeError')) {
        errorMessage = 'Devnet Protocol Version Mismatch (Deployed Contract Incompatible with SDK)';
      }

      // Capture error in state so UI can show why
      setState({
        status: 'market-only',
        instruments: [],
        mode: 'demo',
        error: errorMessage
      });
    }
  }, []);

  const loadClientData = useCallback(async (address: string) => {
    if (!address.trim()) return;
    setState({ status: 'loading' });
    setWalletAddress(address);
    try {
      const data = await fetchClientData(address);
      modeRef.current = 'live';
      setState({ status: 'loaded', data, mode: 'live' });
    } catch (e: any) {
      setState({ status: 'error', error: e instanceof Error ? e.message : 'Failed to load client data' });
    }
  }, []);

  const refresh = useCallback(async () => {
    if (walletAddress) {
      await loadClientData(walletAddress);
    } else {
      await loadMarketData();
    }
  }, [walletAddress, loadClientData, loadMarketData]);

  return { state, walletAddress, setWalletAddress, loadMarketData, loadClientData, refresh };
}
