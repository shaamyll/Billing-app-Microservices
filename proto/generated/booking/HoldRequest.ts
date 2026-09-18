// Original file: proto/booking.proto


export interface HoldRequest {
  'tripId'?: (string);
  'seatId'?: (string);
  'userId'?: (string);
  'fromStopSeq'?: (number);
  'toStopSeq'?: (number);
}

export interface HoldRequest__Output {
  'tripId': (string);
  'seatId': (string);
  'userId': (string);
  'fromStopSeq': (number);
  'toStopSeq': (number);
}
