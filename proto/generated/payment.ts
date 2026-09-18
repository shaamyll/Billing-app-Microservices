import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { ChargeRequest as _payment_ChargeRequest, ChargeRequest__Output as _payment_ChargeRequest__Output } from './payment/ChargeRequest';
import type { ChargeResponse as _payment_ChargeResponse, ChargeResponse__Output as _payment_ChargeResponse__Output } from './payment/ChargeResponse';
import type { PaymentServiceClient as _payment_PaymentServiceClient, PaymentServiceDefinition as _payment_PaymentServiceDefinition } from './payment/PaymentService';
import type { RefundRequest as _payment_RefundRequest, RefundRequest__Output as _payment_RefundRequest__Output } from './payment/RefundRequest';
import type { RefundResponse as _payment_RefundResponse, RefundResponse__Output as _payment_RefundResponse__Output } from './payment/RefundResponse';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  payment: {
    ChargeRequest: MessageTypeDefinition<_payment_ChargeRequest, _payment_ChargeRequest__Output>
    ChargeResponse: MessageTypeDefinition<_payment_ChargeResponse, _payment_ChargeResponse__Output>
    PaymentService: SubtypeConstructor<typeof grpc.Client, _payment_PaymentServiceClient> & { service: _payment_PaymentServiceDefinition }
    PaymentStatus: EnumTypeDefinition
    RefundRequest: MessageTypeDefinition<_payment_RefundRequest, _payment_RefundRequest__Output>
    RefundResponse: MessageTypeDefinition<_payment_RefundResponse, _payment_RefundResponse__Output>
  }
}

