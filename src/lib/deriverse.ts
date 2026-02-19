import { Engine } from '@deriverse/kit';
import { createSolanaRpc, devnet, mainnet, address, type Address } from '@solana/kit';
import type {
  GetClientDataResponse,
  GetClientPerpOrdersInfoResponse,
  GetClientSpotOrdersInfoResponse,
  GetClientSpotOrdersResponse,
  GetClientPerpOrdersResponse,
  Instrument,
} from '@deriverse/kit';

// Re-export types we need
export type {
  GetClientDataResponse,
  GetClientPerpOrdersInfoResponse,
  GetClientSpotOrdersInfoResponse,
  Instrument,
};

const RPC_URL = import.meta.env.VITE_RPC_HTTP || 'https://api.devnet.solana.com';

// Configuration from environment variables
const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID || 'Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu'; // Default to known ID, but allow override
const VERSION = Number(import.meta.env.VITE_VERSION) || 12;

let engineInstance: Engine | null = null;
let engineInitialized = false;

export async function getEngine(): Promise<Engine> {
  if (engineInstance && engineInitialized) return engineInstance;

  const isMainnet = RPC_URL.includes('mainnet');
  const transport = isMainnet ? mainnet(RPC_URL) : devnet(RPC_URL);
  const rpc = createSolanaRpc(transport);

  try {
    console.log(`Connecting to Deriverse: programId=${PROGRAM_ID}, version=${VERSION}`);
    const engine = new Engine(rpc, {
      programId: address(PROGRAM_ID) as unknown as Address<string>,
      version: VERSION,
      uiNumbers: true,
    });

    try {
      const success = await engine.initialize();
      // Check if initialization was successful and root state is available
      if (success && engine.rootStateModel) {
        console.log(`Connected! Root state loaded. Instruments: ${engine.rootStateModel.instrCount}, Tokens: ${engine.rootStateModel.tokensCount}, Clients: ${engine.rootStateModel.clientsCount}`);
        engineInstance = engine;
        engineInitialized = true;
        return engine;
      }
      throw new Error(`Engine initialization returned ${success}`);
    } catch (initError: any) {
      // Silence expected buffer errors when connecting to wrong network/program
      if (initError instanceof RangeError || initError.message?.includes('buffer length')) {
        throw new Error('Deriverse program not found on this network (Buffer mismatch).');
      }
      throw initError;
    }
  } catch (e: any) {
    console.warn(`Deriverse Connection Note: ${e.message}`);
    // Only log full error if it's not our clean "network mismatch" error
    if (e.message !== 'Deriverse program not found on this network (Buffer mismatch).') {
      console.error(e);
    }
    throw new Error('Could not connect to Deriverse program (Network mismatch). Using Demo Data.');
  }
}

export interface MarketInstrument {
  instrId: number;
  assetSymbol: string;
  crncySymbol: string;
  spotLastPx: number;
  spotBestBid: number;
  spotBestAsk: number;
  spotDayHigh: number;
  spotDayLow: number;
  spotDayVolume: number;
  spotDayTrades: number;
  spotAlltimeTrades: number;
  perpLastPx: number;
  perpBestBid: number;
  perpBestAsk: number;
  perpDayHigh: number;
  perpDayLow: number;
  perpDayVolume: number;
  perpDayTrades: number;
  perpAlltimeTrades: number;
  perpOpenInterest: number;
  perpFundingRate: number;
  maxLeverage: number;
  perpClientsCount: number;
  spotBids: { px: number; qty: number }[];
  spotAsks: { px: number; qty: number }[];
  perpBids: { px: number; qty: number }[];
  perpAsks: { px: number; qty: number }[];
  assetMint: string;
  crncyMint: string;
}

export interface ClientBalance {
  tokenId: number;
  amount: number;
  symbol: string;
  mint: string;
}

export interface PerpPosition {
  instrId: number;
  symbol: string;
  perps: number; // position size (+ = long, - = short)
  funds: number; // margin
  inOrdersPerps: number;
  inOrdersFunds: number;
  fees: number;
  rebates: number;
  fundingFunds: number;
  socLossFunds: number;
  lossCoverage: number;
  result: number; // realized PnL
  cost: number; // position cost
  leverage: number;
  markPrice: number;
  unrealizedPnl: number;
}

export interface SpotOrdersInfo {
  instrId: number;
  symbol: string;
  bidsCount: number;
  asksCount: number;
  tempAssetTokens: number;
  tempCrncyTokens: number;
  inOrdersAssetTokens: number;
  inOrdersCrncyTokens: number;
}

export interface DeriverseData {
  instruments: MarketInstrument[];
  clientData: GetClientDataResponse | null;
  balances: ClientBalance[];
  perpPositions: PerpPosition[];
  spotOrders: SpotOrdersInfo[];
  totalSpotTrades: number;
  totalPerpTrades: number;
  totalRealizedPnl: number;
  totalFees: number;
  totalRebates: number;
  totalFundingPaid: number;
  points: number;
}

// Known devnet token symbols (map mint address → symbol)
const KNOWN_TOKENS: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'SOL',
  '9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP': 'wSOL',
  'A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj': 'USDC',
  '2LRkpTchSWzhksNxprPqnAw5KppWHVGvVNsd16ant1Bv': 'USDC',
};

function getTokenSymbol(mint: string, tokenId: number): string {
  return KNOWN_TOKENS[mint] || `Token-${tokenId}`;
}

export async function fetchMarketData(): Promise<MarketInstrument[]> {
  const engine = await getEngine();
  const instruments: MarketInstrument[] = [];

  // Load all instruments from chain (instruments Map starts empty after initialize)
  const instrCount = engine.rootStateModel.instrCount;
  for (let instrId = 0; instrId < instrCount; instrId++) {
    try {
      await engine.updateInstrData({ instrId });
    } catch (e) {
      console.warn(`Failed to load instrument ${instrId}:`, e);
      continue;
    }
  }

  for (const [instrId, instr] of engine.instruments) {
    const h = instr.header;
    const assetToken = engine.tokens.get(h.assetTokenId);
    const crncyToken = engine.tokens.get(h.crncyTokenId);

    const assetMint = assetToken?.address?.toString() || '';
    const crncyMint = crncyToken?.address?.toString() || '';

    instruments.push({
      instrId,
      assetSymbol: getTokenSymbol(assetMint, h.assetTokenId),
      crncySymbol: getTokenSymbol(crncyMint, h.crncyTokenId),
      spotLastPx: h.lastPx,
      spotBestBid: h.bestBid,
      spotBestAsk: h.bestAsk,
      spotDayHigh: h.dayHigh,
      spotDayLow: h.dayLow,
      spotDayVolume: h.dayAssetTokens,
      spotDayTrades: h.dayTrades,
      spotAlltimeTrades: h.alltimeTrades,
      perpLastPx: h.perpLastPx,
      perpBestBid: h.perpBestBid,
      perpBestAsk: h.perpBestAsk,
      perpDayHigh: h.perpDayHigh,
      perpDayLow: h.perpDayLow,
      perpDayVolume: h.perpDayAssetTokens,
      perpDayTrades: h.perpDayTrades,
      perpAlltimeTrades: h.perpAlltimeTrades,
      perpOpenInterest: h.perpOpenInt,
      perpFundingRate: h.perpFundingRate,
      maxLeverage: h.maxLeverage,
      perpClientsCount: h.perpClientsCount,
      spotBids: instr.spotBids.map(b => ({ px: b.px, qty: b.qty })),
      spotAsks: instr.spotAsks.map(a => ({ px: a.px, qty: a.qty })),
      perpBids: instr.perpBids.map(b => ({ px: b.px, qty: b.qty })),
      perpAsks: instr.perpAsks.map(a => ({ px: a.px, qty: a.qty })),
      assetMint,
      crncyMint,
    });
  }

  return instruments;
}

export async function fetchClientData(walletAddress: string): Promise<DeriverseData> {
  const engine = await getEngine();

  // Set signer to read client data
  await engine.setSigner(walletAddress as unknown as Address<string>);

  const instruments = await fetchMarketData();

  // If no client found, return market data only
  if (!engine.originalClientId) {
    return {
      instruments,
      clientData: null,
      balances: [],
      perpPositions: [],
      spotOrders: [],
      totalSpotTrades: 0,
      totalPerpTrades: 0,
      totalRealizedPnl: 0,
      totalFees: 0,
      totalRebates: 0,
      totalFundingPaid: 0,
      points: 0,
    };
  }

  const clientData = await engine.getClientData();

  // Parse token balances
  const balances: ClientBalance[] = [];
  for (const [tokenId, tokenData] of clientData.tokens) {
    const token = engine.tokens.get(tokenId);
    const mint = token?.address?.toString() || '';
    balances.push({
      tokenId,
      amount: tokenData.amount,
      symbol: getTokenSymbol(mint, tokenId),
      mint,
    });
  }

  // Parse perp positions
  const perpPositions: PerpPosition[] = [];
  for (const [instrId, perpData] of clientData.perp) {
    try {
      const perpInfo = await engine.getClientPerpOrdersInfo({
        clientId: perpData.clientId,
        instrId,
      });

      const instr = instruments.find(i => i.instrId === instrId);
      const symbol = instr ? `${instr.assetSymbol}/${instr.crncySymbol}` : `Instr-${instrId}`;
      const markPrice = instr?.perpLastPx || 0;
      const leverage = perpInfo.mask & 0xFF;

      // Calculate unrealized PnL
      const posSize = perpInfo.perps;
      const unrealizedPnl = posSize !== 0 ? posSize * markPrice - perpInfo.cost : 0;

      perpPositions.push({
        instrId,
        symbol,
        perps: perpInfo.perps,
        funds: perpInfo.funds,
        inOrdersPerps: perpInfo.inOrdersPerps,
        inOrdersFunds: perpInfo.inOrdersFunds,
        fees: perpInfo.fees,
        rebates: perpInfo.rebates,
        fundingFunds: perpInfo.fundingFunds,
        socLossFunds: perpInfo.socLossFunds,
        lossCoverage: perpInfo.lossCoverage,
        result: perpInfo.result,
        cost: perpInfo.cost,
        leverage: leverage || 1,
        markPrice,
        unrealizedPnl,
      });
    } catch (e) {
      console.warn(`Failed to fetch perp info for instrument ${instrId}:`, e);
    }
  }

  // Parse spot orders info
  const spotOrders: SpotOrdersInfo[] = [];
  for (const [instrId, spotData] of clientData.spot) {
    try {
      const spotInfo = await engine.getClientSpotOrdersInfo({
        clientId: spotData.clientId,
        instrId,
      });

      const instr = instruments.find(i => i.instrId === instrId);
      const symbol = instr ? `${instr.assetSymbol}/${instr.crncySymbol}` : `Instr-${instrId}`;

      spotOrders.push({
        instrId,
        symbol,
        bidsCount: spotInfo.bidsCount,
        asksCount: spotInfo.asksCount,
        tempAssetTokens: spotInfo.tempAssetTokens,
        tempCrncyTokens: spotInfo.tempCrncyTokens,
        inOrdersAssetTokens: spotInfo.inOrdersAssetTokens,
        inOrdersCrncyTokens: spotInfo.inOrdersCrncyTokens,
      });
    } catch (e) {
      console.warn(`Failed to fetch spot info for instrument ${instrId}:`, e);
    }
  }

  const totalRealizedPnl = perpPositions.reduce((s, p) => s + p.result, 0);
  const totalFees = perpPositions.reduce((s, p) => s + p.fees, 0);
  const totalRebates = perpPositions.reduce((s, p) => s + p.rebates, 0);
  const totalFundingPaid = perpPositions.reduce((s, p) => s + p.fundingFunds, 0);

  return {
    instruments,
    clientData,
    balances,
    perpPositions,
    spotOrders,
    totalSpotTrades: clientData.spotTrades,
    totalPerpTrades: clientData.perpTrades,
    totalRealizedPnl,
    totalFees,
    totalRebates,
    totalFundingPaid,
    points: clientData.points,
  };
}
