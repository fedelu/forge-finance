// Minimal shim for @solana/transaction-messages to prevent SSR crashes in dev/demo.
export function getVersionedTransactionMessage() {
  return {};
}
export function compileTransaction() {
  return {};
}
export const TRANSACTION_MESSAGE_VERSION = 0;

