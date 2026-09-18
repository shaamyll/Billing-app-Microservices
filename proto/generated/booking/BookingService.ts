// Original file: proto/booking.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { BookingResponse as _booking_BookingResponse, BookingResponse__Output as _booking_BookingResponse__Output } from '../booking/BookingResponse';
import type { CheckAvailabilityRequest as _booking_CheckAvailabilityRequest, CheckAvailabilityRequest__Output as _booking_CheckAvailabilityRequest__Output } from '../booking/CheckAvailabilityRequest';
import type { CheckAvailabilityResponse as _booking_CheckAvailabilityResponse, CheckAvailabilityResponse__Output as _booking_CheckAvailabilityResponse__Output } from '../booking/CheckAvailabilityResponse';
import type { ConfirmRequest as _booking_ConfirmRequest, ConfirmRequest__Output as _booking_ConfirmRequest__Output } from '../booking/ConfirmRequest';
import type { HoldRequest as _booking_HoldRequest, HoldRequest__Output as _booking_HoldRequest__Output } from '../booking/HoldRequest';
import type { ReleaseRequest as _booking_ReleaseRequest, ReleaseRequest__Output as _booking_ReleaseRequest__Output } from '../booking/ReleaseRequest';

export interface BookingServiceClient extends grpc.Client {
  CheckAvailability(argument: _booking_CheckAvailabilityRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  CheckAvailability(argument: _booking_CheckAvailabilityRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  CheckAvailability(argument: _booking_CheckAvailabilityRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  CheckAvailability(argument: _booking_CheckAvailabilityRequest, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  checkAvailability(argument: _booking_CheckAvailabilityRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  checkAvailability(argument: _booking_CheckAvailabilityRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  checkAvailability(argument: _booking_CheckAvailabilityRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  checkAvailability(argument: _booking_CheckAvailabilityRequest, callback: grpc.requestCallback<_booking_CheckAvailabilityResponse__Output>): grpc.ClientUnaryCall;
  
  Confirm(argument: _booking_ConfirmRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Confirm(argument: _booking_ConfirmRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Confirm(argument: _booking_ConfirmRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Confirm(argument: _booking_ConfirmRequest, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  confirm(argument: _booking_ConfirmRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  confirm(argument: _booking_ConfirmRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  confirm(argument: _booking_ConfirmRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  confirm(argument: _booking_ConfirmRequest, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  
  Hold(argument: _booking_HoldRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Hold(argument: _booking_HoldRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Hold(argument: _booking_HoldRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Hold(argument: _booking_HoldRequest, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  hold(argument: _booking_HoldRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  hold(argument: _booking_HoldRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  hold(argument: _booking_HoldRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  hold(argument: _booking_HoldRequest, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  
  Release(argument: _booking_ReleaseRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Release(argument: _booking_ReleaseRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Release(argument: _booking_ReleaseRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  Release(argument: _booking_ReleaseRequest, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  release(argument: _booking_ReleaseRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  release(argument: _booking_ReleaseRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  release(argument: _booking_ReleaseRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  release(argument: _booking_ReleaseRequest, callback: grpc.requestCallback<_booking_BookingResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface BookingServiceHandlers extends grpc.UntypedServiceImplementation {
  CheckAvailability: grpc.handleUnaryCall<_booking_CheckAvailabilityRequest__Output, _booking_CheckAvailabilityResponse>;
  
  Confirm: grpc.handleUnaryCall<_booking_ConfirmRequest__Output, _booking_BookingResponse>;
  
  Hold: grpc.handleUnaryCall<_booking_HoldRequest__Output, _booking_BookingResponse>;
  
  Release: grpc.handleUnaryCall<_booking_ReleaseRequest__Output, _booking_BookingResponse>;
  
}

export interface BookingServiceDefinition extends grpc.ServiceDefinition {
  CheckAvailability: MethodDefinition<_booking_CheckAvailabilityRequest, _booking_CheckAvailabilityResponse, _booking_CheckAvailabilityRequest__Output, _booking_CheckAvailabilityResponse__Output>
  Confirm: MethodDefinition<_booking_ConfirmRequest, _booking_BookingResponse, _booking_ConfirmRequest__Output, _booking_BookingResponse__Output>
  Hold: MethodDefinition<_booking_HoldRequest, _booking_BookingResponse, _booking_HoldRequest__Output, _booking_BookingResponse__Output>
  Release: MethodDefinition<_booking_ReleaseRequest, _booking_BookingResponse, _booking_ReleaseRequest__Output, _booking_BookingResponse__Output>
}
