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
    <div className="flex flex-col gap-6 rounded-3xl border border-sand bg-white p-6 shadow-soft">
      <div>
        <p className="font-jakarta text-[12px] font-medium uppercase tracking-[2px] text-sage">
          Nightly Rate
        </p>
        <p className="mt-1 whitespace-nowrap font-fraunces text-[34px] font-normal text-jungle-dark">
          ${price}{" "}
          <span className="font-jakarta text-[16px] font-normal text-jungle/60">/ night</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-sand pt-5 font-jakarta text-[14px] text-jungle/80">
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
