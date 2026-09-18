// Original file: proto/payment.proto


export interface RefundResponse {
  'success'?: (boolean);
  'status'?: (string);
  'paymentId'?: (string);
}

export interface RefundResponse__Output {
  'success': (boolean);
  'status': (string);
  'paymentId': (string);
}
