import { Bus, Seat, BusType, SeatType, Prisma } from "../generated/prisma/client";

export type BusModel = Bus;
export type SeatModel = Seat;

export type BusWithSeats = Prisma.BusGetPayload<{
  include: {
    seats: {
      orderBy: {
        seatNumber: "asc";
      };
    };
  };
}>;

export interface CreateSeatDto {
  seatNumber: string;
  seatType: SeatType;
}

export interface CreateBusDto {
  registrationNumber: string;
  operatorName: string;
  busType: BusType;
  totalSeats: number;
  seats: CreateSeatDto[];
}

export interface IBusRepository {
  create(data: Prisma.BusCreateInput): Promise<BusModel>;
  createBusWithSeats(busData: Omit<CreateBusDto, "seats">, seats: CreateSeatDto[]): Promise<BusWithSeats>;
  findById(id: string): Promise<BusModel | null>;
  findBusById(id: string): Promise<BusModel | null>;
  findByRegistrationNumber(regNum: string): Promise<BusModel | null>;
  findBusWithSeats(id: string): Promise<BusWithSeats | null>;
  findAll(): Promise<BusWithSeats[]>;
}

export interface ISeatRepository {
  findByBusId(busId: string): Promise<SeatModel[]>;
}
