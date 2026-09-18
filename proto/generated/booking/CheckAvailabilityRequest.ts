// Original file: proto/booking.proto


export interface CheckAvailabilityRequest {
  'tripId'?: (string);
  'seatId'?: (string);
  'fromStopSeq'?: (number);
  'toStopSeq'?: (number);
}

export interface CheckAvailabilityRequest__Output {
  'tripId': (string);
  'seatId': (string);
  'fromStopSeq': (number);
  'toStopSeq': (number);
}
