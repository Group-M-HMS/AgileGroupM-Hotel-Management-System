import { BookNowButton } from "./BookNowButton";

function formatMaxGuests(maxAdults: number, maxChildren: number): string {
  const adultsPart = `${maxAdults} ${maxAdults === 1 ? "Adult" : "Adults"}`;
  if (maxChildren === 0) {
    return adultsPart;
  }
  const childrenPart = `${maxChildren} ${maxChildren === 1 ? "Child" : "Children"}`;
  return `${adultsPart}, ${childrenPart}`;
}

export function BookingCard({
  price,
  maxAdults,
  maxChildren,
  sizeSqm,
  bedType,
  roomId,
  checkIn,
  checkOut,
  guests,
}: {
  price: number;
  maxAdults: number;
  maxChildren: number;
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
            {formatMaxGuests(maxAdults, maxChildren)}
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
