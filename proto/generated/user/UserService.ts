// Original file: proto/user.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { GetUserProfileRequest as _user_GetUserProfileRequest, GetUserProfileRequest__Output as _user_GetUserProfileRequest__Output } from '../user/GetUserProfileRequest';
import type { UserProfileResponse as _user_UserProfileResponse, UserProfileResponse__Output as _user_UserProfileResponse__Output } from '../user/UserProfileResponse';

export interface UserServiceClient extends grpc.Client {
  GetUserProfile(argument: _user_GetUserProfileRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  GetUserProfile(argument: _user_GetUserProfileRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  GetUserProfile(argument: _user_GetUserProfileRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  GetUserProfile(argument: _user_GetUserProfileRequest, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  getUserProfile(argument: _user_GetUserProfileRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  getUserProfile(argument: _user_GetUserProfileRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  getUserProfile(argument: _user_GetUserProfileRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  getUserProfile(argument: _user_GetUserProfileRequest, callback: grpc.requestCallback<_user_UserProfileResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface UserServiceHandlers extends grpc.UntypedServiceImplementation {
  GetUserProfile: grpc.handleUnaryCall<_user_GetUserProfileRequest__Output, _user_UserProfileResponse>;
  
}

export interface UserServiceDefinition extends grpc.ServiceDefinition {
  GetUserProfile: MethodDefinition<_user_GetUserProfileRequest, _user_UserProfileResponse, _user_GetUserProfileRequest__Output, _user_UserProfileResponse__Output>
}
