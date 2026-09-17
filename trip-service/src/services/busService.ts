import { ConflictError, NotFoundError, ValidationError } from "@billing/utils";
import { BusType, SeatType } from "../generated/prisma/client";
import { BusWithSeats, CreateBusDto, IBusRepository, ISeatRepository, SeatModel } from "../interface/busInterface";

export class BusService {
  private readonly busRepository: IBusRepository;
  private readonly seatRepository: ISeatRepository;

  constructor({
    busRepository,
    seatRepository,
  }: {
    busRepository: IBusRepository;
    seatRepository: ISeatRepository;
  }) {
    this.busRepository = busRepository;
    this.seatRepository = seatRepository;
  }

  async createBus(data: CreateBusDto): Promise<BusWithSeats> {
    const { registrationNumber, operatorName, busType, totalSeats, seats } = data;

    if (!registrationNumber || typeof registrationNumber !== "string" || registrationNumber.trim().length === 0) {
      throw new ValidationError("Registration number is required and must be non-empty");
    }

    if (!operatorName || typeof operatorName !== "string" || operatorName.trim().length === 0) {
      throw new ValidationError("Operator name is required and must be non-empty");
    }

    if (!busType || !Object.values(BusType).includes(busType)) {
      throw new ValidationError(`Invalid busType. Allowed values: ${Object.values(BusType).join(", ")}`);
    }

    if (!totalSeats || typeof totalSeats !== "number" || totalSeats <= 0) {
      throw new ValidationError("totalSeats must be a positive integer");
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      throw new ValidationError("Seats array is required");
    }

    if (seats.length !== totalSeats) {
      throw new ValidationError(`Seats array length (${seats.length}) must match totalSeats (${totalSeats})`);
    }

    const seenSeats = new Set<string>();
    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      if (!seat.seatNumber || typeof seat.seatNumber !== "string" || seat.seatNumber.trim().length === 0) {
        throw new ValidationError(`Seat at position ${i + 1} has an invalid seatNumber`);
      }
      if (!seat.seatType || !Object.values(SeatType).includes(seat.seatType)) {
        throw new ValidationError(
          `Seat ${seat.seatNumber} has invalid seatType. Allowed values: ${Object.values(SeatType).join(", ")}`
        );
      }
      const trimmedNum = seat.seatNumber.trim();
      if (seenSeats.has(trimmedNum)) {
        throw new ValidationError(`Duplicate seatNumber '${trimmedNum}' provided in seat layout`);
      }
      seenSeats.add(trimmedNum);
    }

    const trimmedRegNum = registrationNumber.trim().toUpperCase();

    const existingBus = await this.busRepository.findByRegistrationNumber(trimmedRegNum);
    if (existingBus) {
      throw new ConflictError(`Bus with registration number '${trimmedRegNum}' already exists`);
    }

    return await this.busRepository.createBusWithSeats(
      {
        registrationNumber: trimmedRegNum,
        operatorName: operatorName.trim(),
        busType,
        totalSeats,
      },
      seats.map((s) => ({
        seatNumber: s.seatNumber.trim(),
        seatType: s.seatType,
      }))
    );
  }

  async getBusLayout(busId: string): Promise<BusWithSeats> {
    if (!busId || typeof busId !== "string" || busId.trim().length === 0) {
      throw new ValidationError("Bus ID is required");
    }

    const bus = await this.busRepository.findBusWithSeats(busId.trim());
    if (!bus) {
      throw new NotFoundError("Bus not found");
    }

    return bus;
  }
}
