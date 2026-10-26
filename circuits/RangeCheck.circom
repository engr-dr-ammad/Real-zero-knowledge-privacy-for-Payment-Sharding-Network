pragma circom 2.0.0;

include "circomlibjs/poseidon.circom";
include "circomlibjs/comparators.circom";

template RangeCheck(n) {
  signal input value;
  signal input minValue;
  signal input maxValue;
  signal output isValid;

  component isGteMin = GreaterEqThan(n);
  component isLteMax = LessEqThan(n);

  isGteMin.in[0] <== value;
  isGteMin.in[1] <== minValue;

  isLteMax.in[0] <== value;
  isLteMax.in[1] <== maxValue;

  isValid <== isGteMin.out * isLteMax.out;
}
