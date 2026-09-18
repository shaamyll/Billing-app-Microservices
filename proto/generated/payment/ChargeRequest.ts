// Original file: proto/payment.proto


export interface ChargeRequest {
  'bookingId'?: (string);
  'userId'?: (string);
  'amount'?: (number | string);
  'currency'?: (string);
  'idempotencyKey'?: (string);
}

export interface ChargeRequest__Output {
  'bookingId': (string);
  'userId': (string);
  'amount': (number);
  'currency': (string);
  'idempotencyKey': (string);
}
