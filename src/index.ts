import { ProofGenerator } from './ProofGenerator.js';
import { ProofVerifier } from './ProofVerifier.js';
import { CryptoUtils } from './crypto.js';
import {
  BalanceProofInput,
  HoldingLimitProofInput,
  TransactionComplianceProofInput,
  ZKProof,
  ProofCommitment,
  VerificationResult
} from './types';

export class PaymentShardingNetwork {
  private proofGenerator: ProofGenerator;
  private proofVerifier: ProofVerifier;

  constructor() {
    this.proofGenerator = new ProofGenerator();
    this.proofVerifier = new ProofVerifier();
  }

  async initialize(): Promise<void> {
    await this.proofGenerator.initializeCircuits();
    await this.proofVerifier.initializeVerifyingKeys();
  }

  /**
   * Prove that a user has at least the minimum required balance
   * WITHOUT revealing the actual balance amount
   */
  async proveBalanceSufficiency(
    userBalance: bigint,
    minimumRequired: bigint
  ): Promise<{ proof: ZKProof; commitment: ProofCommitment }> {
    const commitment = this.proofGenerator.createCommitment(userBalance, 'balance');

    const proofInput: BalanceProofInput = {
      userBalance,
      minimumRequired,
      salt: commitment.salt,
      balanceCommitment: commitment.commitmentHash
    };

    const proof = await this.proofGenerator.generateBalanceProof(proofInput);

    return { proof, commitment };
  }

  /**
   * Prove compliance with digital euro holding limits
   * WITHOUT revealing the actual holding amount
   */
  async proveHoldingCompliance(
    eurosHeld: bigint,
    maximumAllowed: bigint
  ): Promise<{ proof: ZKProof; commitment: ProofCommitment }> {
    const commitment = this.proofGenerator.createCommitment(eurosHeld, 'holding');

    const proofInput: HoldingLimitProofInput = {
      eurosHeld,
      maximumAllowed,
      salt: commitment.salt,
      holdingCommitment: commitment.commitmentHash
    };

    const proof = await this.proofGenerator.generateHoldingLimitProof(proofInput);

    return { proof, commitment };
  }

  /**
   * Prove transaction compliance in a single proof
   * Verifies sufficient funds AND compliance with holding limits
   */
  async proveTransactionCompliance(
    userBalance: bigint,
    transactionAmount: bigint,
    holdingLimit: bigint
  ): Promise<{ proof: ZKProof; commitment: ProofCommitment }> {
    const commitment = this.proofGenerator.createCommitment(userBalance, 'transaction');

    const proofInput: TransactionComplianceProofInput = {
      userBalance,
      transactionAmount,
      holdingLimit,
      salt: commitment.salt,
      balanceCommitment: commitment.commitmentHash
    };

    const proof = await this.proofGenerator.generateTransactionComplianceProof(proofInput);

    return { proof, commitment };
  }

  /**
   * Verify a zero-knowledge proof of balance
   */
  async verifyBalanceProof(proof: ZKProof): Promise<VerificationResult> {
    return this.proofVerifier.verifyBalanceProof(proof);
  }

  /**
   * Verify a zero-knowledge proof of holding compliance
   */
  async verifyHoldingLimitProof(proof: ZKProof): Promise<VerificationResult> {
    return this.proofVerifier.verifyHoldingLimitProof(proof);
  }

  /**
   * Verify a transaction compliance proof
   */
  async verifyTransactionComplianceProof(proof: ZKProof): Promise<VerificationResult> {
    return this.proofVerifier.verifyTransactionComplianceProof(proof);
  }

  /**
   * Batch verify multiple proofs
   */
  async verifyProofBatch(proofs: ZKProof[]): Promise<VerificationResult[]> {
    return this.proofVerifier.batchVerifyProofs(proofs);
  }

  /**
   * Get crypto utilities for manual commitment creation
   */
  getCryptoUtils(): typeof CryptoUtils {
    return CryptoUtils;
  }
}

export {
  BalanceProofInput,
  HoldingLimitProofInput,
  TransactionComplianceProofInput,
  ZKProof,
  ProofCommitment,
  VerificationResult
};

export default PaymentShardingNetwork;
