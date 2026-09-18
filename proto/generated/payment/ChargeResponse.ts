// Original file: proto/payment.proto


export interface ChargeResponse {
  'success'?: (boolean);
  'paymentId'?: (string);
  'status'?: (string);
  'failureReason'?: (string);
}

export interface ChargeResponse__Output {
  'success': (boolean);
  'paymentId': (string);
  'status': (string);
  'failureReason': (string);
}
