// Original file: proto/payment.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { ChargeRequest as _payment_ChargeRequest, ChargeRequest__Output as _payment_ChargeRequest__Output } from '../payment/ChargeRequest';
import type { ChargeResponse as _payment_ChargeResponse, ChargeResponse__Output as _payment_ChargeResponse__Output } from '../payment/ChargeResponse';
import type { RefundRequest as _payment_RefundRequest, RefundRequest__Output as _payment_RefundRequest__Output } from '../payment/RefundRequest';
import type { RefundResponse as _payment_RefundResponse, RefundResponse__Output as _payment_RefundResponse__Output } from '../payment/RefundResponse';

export interface PaymentServiceClient extends grpc.Client {
  Charge(argument: _payment_ChargeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  Charge(argument: _payment_ChargeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  Charge(argument: _payment_ChargeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  Charge(argument: _payment_ChargeRequest, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  charge(argument: _payment_ChargeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  charge(argument: _payment_ChargeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  charge(argument: _payment_ChargeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  charge(argument: _payment_ChargeRequest, callback: grpc.requestCallback<_payment_ChargeResponse__Output>): grpc.ClientUnaryCall;
  
  Refund(argument: _payment_RefundRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  Refund(argument: _payment_RefundRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  Refund(argument: _payment_RefundRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  Refund(argument: _payment_RefundRequest, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  refund(argument: _payment_RefundRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  refund(argument: _payment_RefundRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  refund(argument: _payment_RefundRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  refund(argument: _payment_RefundRequest, callback: grpc.requestCallback<_payment_RefundResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface PaymentServiceHandlers extends grpc.UntypedServiceImplementation {
  Charge: grpc.handleUnaryCall<_payment_ChargeRequest__Output, _payment_ChargeResponse>;
  
  Refund: grpc.handleUnaryCall<_payment_RefundRequest__Output, _payment_RefundResponse>;
  
}

export interface PaymentServiceDefinition extends grpc.ServiceDefinition {
  Charge: MethodDefinition<_payment_ChargeRequest, _payment_ChargeResponse, _payment_ChargeRequest__Output, _payment_ChargeResponse__Output>
  Refund: MethodDefinition<_payment_RefundRequest, _payment_RefundResponse, _payment_RefundRequest__Output, _payment_RefundResponse__Output>
}
