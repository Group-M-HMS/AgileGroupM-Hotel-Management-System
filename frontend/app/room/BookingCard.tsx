import { BookNowButton } from "./BookNowButton";

export function BookingCard({
  price,
  maxOccupancy,
  sizeSqm,
  bedType,
  roomId,
  checkIn,
  checkOut,
  guests,
}: {
  price: number;
  maxOccupancy: number;
  sizeSqm: number;
  bedType: { count: number; type: string };
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-sand bg-white px-6 pb-6 pt-3 shadow-soft">
      <p className="whitespace-nowrap font-lora text-[30px] font-normal text-jungle-dark">
        ${price}{" "}
        <span className="font-outfit text-[16px] font-normal text-jungle/60">/ night</span>
      </p>
      <div className="flex flex-col gap-2 border-t border-sand pt-4 font-outfit text-[14px] text-jungle/80">
        <div className="flex items-center justify-between">
          <span className="font-normal">Max Guests</span>
          <span className="font-medium">
            {maxOccupancy} {maxOccupancy === 1 ? "Guest" : "Guests"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-normal">Room Size</span>
          <span className="font-medium">{sizeSqm} m&sup2;</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-normal">Bed Type</span>
          <span className="font-medium">
            {bedType.count} {bedType.type} Bed{bedType.count > 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <BookNowButton
        roomId={roomId}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        price={price}
      />
    </div>
  );
}
