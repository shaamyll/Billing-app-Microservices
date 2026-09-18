import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { BookingResponse as _booking_BookingResponse, BookingResponse__Output as _booking_BookingResponse__Output } from './booking/BookingResponse';
import type { BookingServiceClient as _booking_BookingServiceClient, BookingServiceDefinition as _booking_BookingServiceDefinition } from './booking/BookingService';
import type { CheckAvailabilityRequest as _booking_CheckAvailabilityRequest, CheckAvailabilityRequest__Output as _booking_CheckAvailabilityRequest__Output } from './booking/CheckAvailabilityRequest';
import type { CheckAvailabilityResponse as _booking_CheckAvailabilityResponse, CheckAvailabilityResponse__Output as _booking_CheckAvailabilityResponse__Output } from './booking/CheckAvailabilityResponse';
import type { ConfirmRequest as _booking_ConfirmRequest, ConfirmRequest__Output as _booking_ConfirmRequest__Output } from './booking/ConfirmRequest';
import type { HoldRequest as _booking_HoldRequest, HoldRequest__Output as _booking_HoldRequest__Output } from './booking/HoldRequest';
import type { ReleaseRequest as _booking_ReleaseRequest, ReleaseRequest__Output as _booking_ReleaseRequest__Output } from './booking/ReleaseRequest';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  booking: {
    BookingResponse: MessageTypeDefinition<_booking_BookingResponse, _booking_BookingResponse__Output>
    BookingService: SubtypeConstructor<typeof grpc.Client, _booking_BookingServiceClient> & { service: _booking_BookingServiceDefinition }
    BookingStatus: EnumTypeDefinition
    CheckAvailabilityRequest: MessageTypeDefinition<_booking_CheckAvailabilityRequest, _booking_CheckAvailabilityRequest__Output>
    CheckAvailabilityResponse: MessageTypeDefinition<_booking_CheckAvailabilityResponse, _booking_CheckAvailabilityResponse__Output>
    ConfirmRequest: MessageTypeDefinition<_booking_ConfirmRequest, _booking_ConfirmRequest__Output>
    HoldRequest: MessageTypeDefinition<_booking_HoldRequest, _booking_HoldRequest__Output>
    ReleaseRequest: MessageTypeDefinition<_booking_ReleaseRequest, _booking_ReleaseRequest__Output>
  }
}

