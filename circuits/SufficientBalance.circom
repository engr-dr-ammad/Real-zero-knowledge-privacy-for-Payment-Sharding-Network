pragma circom 2.0.0;

include "circomlibjs/poseidon.circom";
include "circomlibjs/comparators.circom";

template SufficientBalance() {
  signal input userBalance;
  signal input minimumRequired;
  signal input salt;
  signal input balanceCommitment;

  signal output isValid;
  signal output balanceHash;

  // Verify balance commitment matches the hashed balance
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== userBalance;
  poseidon.inputs[1] <== salt;

  balanceHash <== poseidon.out;

  // Verify the commitment hash matches the input
  balanceHash === balanceCommitment;

  // Check that balance >= minimumRequired
  component isGreaterOrEqual = GreaterEqThan(64);
  isGreaterOrEqual.in[0] <== userBalance;
  isGreaterOrEqual.in[1] <== minimumRequired;

  isValid <== isGreaterOrEqual.out;
  isValid === 1;
}
