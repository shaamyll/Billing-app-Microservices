// Original file: proto/payment.proto

export const PaymentStatus = {
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus =
  | 'SUCCEEDED'
  | 0
  | 'FAILED'
  | 1
  | 'REFUNDED'
  | 2

export type PaymentStatus__Output = typeof PaymentStatus[keyof typeof PaymentStatus]
