export interface Question {
  q: string;
  options: string[];
  answer: number; // index
}

// PLACEHOLDER POOL — replace with the real 200 questions later.
// The structure is what matters; the app shuffles and picks 10.
const PLACEHOLDERS: Question[] = Array.from({ length: 50 }, (_, i) => ({
  q: `Placeholder question #${i + 1}: which option is correct?`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: i % 4,
}));

// A few real-feeling web3 sample questions so the demo is meaningful.
const SAMPLE: Question[] = [
  {
    q: "What does EVM stand for?",
    options: ["Ethereum Virtual Machine", "Encrypted Vault Module", "External Value Mempool", "Edge Validator Mesh"],
    answer: 0,
  },
  {
    q: "Which unit is the smallest denomination of ETH?",
    options: ["Gwei", "Wei", "Finney", "Szabo"],
    answer: 1,
  },
  {
    q: "What is a smart contract?",
    options: ["A signed PDF", "Self-executing code on a blockchain", "A wallet seed phrase", "A consensus algorithm"],
    answer: 1,
  },
  {
    q: "Which consensus does Ethereum use today?",
    options: ["Proof of Work", "Proof of Authority", "Proof of Stake", "Proof of History"],
    answer: 2,
  },
  {
    q: "What is gas used for?",
    options: ["Storing files", "Paying for computation", "Mining rewards only", "Validator slashing"],
    answer: 1,
  },
  {
    q: "What does an ERC-20 standard define?",
    options: ["NFTs", "Fungible tokens", "Multisig wallets", "Bridges"],
    answer: 1,
  },
  {
    q: "Which is a Layer 2 scaling solution?",
    options: ["Optimism", "Solana", "Cosmos Hub", "Bitcoin"],
    answer: 0,
  },
  {
    q: "What is the seed phrase?",
    options: ["Public address", "Recovery for your wallet", "Network identifier", "Gas estimator"],
    answer: 1,
  },
  {
    q: "What is the role of a validator?",
    options: ["Design tokenomics", "Propose & attest blocks", "Run DEX frontends", "Audit contracts"],
    answer: 1,
  },
  {
    q: "What is a DAO?",
    options: ["Decentralized Autonomous Organization", "Digital Asset Oracle", "Distributed Auth Object", "Data Access Object"],
    answer: 0,
  },
];

export const QUESTION_POOL: Question[] = [...SAMPLE, ...PLACEHOLDERS];

export function pickRandom(pool: Question[], n: number): Question[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
