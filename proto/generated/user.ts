import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { GetUserProfileRequest as _user_GetUserProfileRequest, GetUserProfileRequest__Output as _user_GetUserProfileRequest__Output } from './user/GetUserProfileRequest';
import type { UserProfileResponse as _user_UserProfileResponse, UserProfileResponse__Output as _user_UserProfileResponse__Output } from './user/UserProfileResponse';
import type { UserServiceClient as _user_UserServiceClient, UserServiceDefinition as _user_UserServiceDefinition } from './user/UserService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  user: {
    GetUserProfileRequest: MessageTypeDefinition<_user_GetUserProfileRequest, _user_GetUserProfileRequest__Output>
    UserProfileResponse: MessageTypeDefinition<_user_UserProfileResponse, _user_UserProfileResponse__Output>
    UserService: SubtypeConstructor<typeof grpc.Client, _user_UserServiceClient> & { service: _user_UserServiceDefinition }
  }
}

