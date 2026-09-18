// Original file: proto/booking.proto


export interface BookingResponse {
  'id'?: (string);
  'tripId'?: (string);
  'seatId'?: (string);
  'userId'?: (string);
  'fromStopSeq'?: (number);
  'toStopSeq'?: (number);
  'status'?: (string);
  'holdExpiresAt'?: (string);
  'createdAt'?: (string);
  'updatedAt'?: (string);
}

export interface BookingResponse__Output {
  'id': (string);
  'tripId': (string);
  'seatId': (string);
  'userId': (string);
  'fromStopSeq': (number);
  'toStopSeq': (number);
  'status': (string);
  'holdExpiresAt': (string);
  'createdAt': (string);
  'updatedAt': (string);
}
