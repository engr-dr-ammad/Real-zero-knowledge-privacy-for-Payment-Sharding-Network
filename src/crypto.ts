import { createHash } from 'crypto';

export class CryptoUtils {
  static generateSalt(): bigint {
    const randomBytes = createHash('sha256')
      .update(Math.random().toString() + Date.now())
      .digest();
    return BigInt('0x' + randomBytes.toString('hex').substring(0, 16));
  }

  static poseidonHash(a: bigint, b: bigint): bigint {
    // Simulated Poseidon hash (in production, use snarkjs Poseidon implementation)
    const combined = a.toString() + b.toString();
    const hash = createHash('sha256').update(combined).digest('hex');
    return BigInt('0x' + hash.substring(0, 32));
  }

  static createBalanceCommitment(balance: bigint, salt: bigint): bigint {
    return this.poseidonHash(balance, salt);
  }

  static createHoldingCommitment(euros: bigint, salt: bigint): bigint {
    return this.poseidonHash(euros, salt);
  }

  static sha256(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  static verifyCommitment(value: bigint, salt: bigint, commitment: bigint): boolean {
    const calculatedCommitment = this.poseidonHash(value, salt);
    return calculatedCommitment === commitment;
  }
}
