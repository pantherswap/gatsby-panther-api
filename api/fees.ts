import { NowRequest, NowResponse } from "@vercel/node";
import axios from "axios";

interface Network {
  totalTxs: number;
  totalGasUsed: number;
  totalGas: number;
  totalGasUSDT: number;
  avgGasUsed: number;
  avgGasUSDT: number;
}

interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

const getPrice = async (symbol: string): Promise<string> => {
  const request = await axios.get("https://api.binance.com/api/v3/avgPrice", {
    params: {
      symbol: `${symbol}USDT`,
    },
  });

  const { price } = request.data;
  return price;
};

const getGasPrice = async (): Promise<string> => {
  const request = await axios.get("https://api.etherscan.io/api", {
    params: {
      module: "gastracker",
      action: "gasoracle",
      apikey: process.env.ETHERSCAN_API_KEY,
    },
  });

  const { FastGasPrice } = request.data.result;
  return FastGasPrice;
};

const getTxs = async (address: string): Promise<Transaction[]> => {
  const request = await axios.get(`https://api.bscscan.com/api`, {
    params: {
      module: "account",
      action: "txlist",
      address,
      startblock: 0,
      endblock: 99999999,
      sort: "desc",
      apikey: process.env.BSCSCAN_API_KEY,
    },
  });

  const { result } = request.data;
  return result;
};

const getStatForNetwork = async (
  transactions: Transaction[],
  price: string,
  estimatedGasPrice: string | undefined
): Promise<Network> => {
  const totalTxs = transactions.length;
  const gasUsed = transactions.map((tx: Transaction) => parseInt(tx.gasUsed));
  const gasPrice = transactions.map((tx: Transaction) => parseInt(estimatedGasPrice ?? tx.gasPrice));
  const totalGas =
    transactions.reduce(
      (acc: number, tx: Transaction) => acc + parseInt(tx.gasUsed) * parseInt(estimatedGasPrice ?? tx.gasPrice),
      0
    ) / 1e18;
  const totalGasUSDT =
    (transactions.reduce(
      (acc: number, tx: Transaction) => acc + parseInt(tx.gasUsed) * parseInt(estimatedGasPrice ?? tx.gasPrice),
      0
    ) /
      1e18) *
    Number(price);
  const totalGasUsed = gasUsed.reduce((acc: number, value: number) => acc + value, 0);
  const totalGasPrice = gasPrice.reduce((acc: number, value: number) => acc + value, 0);
  const avgGasUsed = totalGasPrice / totalTxs / 1e9;
  const avgGasUSDT = totalGasUSDT / totalTxs;

  return {
    totalTxs,
    totalGasUsed,
    totalGas,
    totalGasUSDT,
    avgGasUsed,
    avgGasUSDT,
  };
};

export default async (req: NowRequest, res: NowResponse) => {
  const { address } = req.query;

  const sanitized: string = address as string;
  const txs: Transaction[] = await getTxs(sanitized);
  const succeeded: Transaction[] = txs.filter((tx: Transaction) => tx.from === sanitized.toLowerCase());

  const gasPrice: string = await getGasPrice();
  const bscNetwork = await getStatForNetwork(succeeded, await getPrice("BNB"), undefined);
  const ethNetwork = await getStatForNetwork(succeeded, await getPrice("ETH"), (Number(gasPrice) * 1e9).toString());

  res.json({ address, chains: { eth: ethNetwork, bsc: bscNetwork } });
};
