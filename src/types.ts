export interface BalanceProofInput {
  userBalance: bigint;
  minimumRequired: bigint;
  salt: bigint;
  balanceCommitment: bigint;
}

export interface HoldingLimitProofInput {
  eurosHeld: bigint;
  maximumAllowed: bigint;
  salt: bigint;
  holdingCommitment: bigint;
}

export interface TransactionComplianceProofInput {
  userBalance: bigint;
  transactionAmount: bigint;
  holdingLimit: bigint;
  salt: bigint;
  balanceCommitment: bigint;
}

export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  circuitName: string;
  timestamp: number;
}

export interface VerificationResult {
  isValid: boolean;
  circuitName: string;
  publicSignals: string[];
  error?: string;
}

export interface ProofCommitment {
  commitmentHash: bigint;
  salt: bigint;
  proofType: 'balance' | 'holding' | 'transaction';
}
