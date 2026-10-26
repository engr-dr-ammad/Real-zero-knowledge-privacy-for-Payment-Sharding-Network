pragma circom 2.0.0;

include "circomlibjs/poseidon.circom";
include "circomlibjs/comparators.circom";

template TransactionCompliance() {
  signal input userBalance;
  signal input transactionAmount;
  signal input holdingLimit;
  signal input salt;
  signal input balanceCommitment;

  signal output isValid;
  signal output balanceHash;

  // Verify balance commitment
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== userBalance;
  poseidon.inputs[1] <== salt;

  balanceHash <== poseidon.out;
  balanceHash === balanceCommitment;

  // Check: balance >= transactionAmount
  component hasSufficientFunds = GreaterEqThan(64);
  hasSufficientFunds.in[0] <== userBalance;
  hasSufficientFunds.in[1] <== transactionAmount;

  // Check: (balance - transactionAmount) <= holdingLimit
  signal remainingBalance <== userBalance - transactionAmount;
  component withinLimit = LessEqThan(64);
  withinLimit.in[0] <== remainingBalance;
  withinLimit.in[1] <== holdingLimit;

  // Both conditions must be true
  isValid <== hasSufficientFunds.out * withinLimit.out;
  isValid === 1;
}
