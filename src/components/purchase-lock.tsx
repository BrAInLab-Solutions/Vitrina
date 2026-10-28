"use client";

import { useEffect, useState } from "react";

type Status = "AWAITING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED" | string;

/** Key turns → lock closes: purchase feels reserved for the buyer. */
export function PurchaseLock({
  title,
  status,
  paymentRef,
}: {
  title: string;
  status: Status;
  paymentRef: string;
}) {
  const sealed = status === "PAID";
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setPlay(true), 120);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <div className={`purchase-lock ${play ? "is-play" : ""} ${sealed ? "is-sealed" : "is-reserve"}`}>
      <div className="purchase-lock-stage" aria-hidden="true">
        <div className="purchase-lock-ring" />
        <div className="purchase-lock-body">
          <span className="purchase-lock-shackle" />
          <span className="purchase-lock-face">
            <span className="purchase-lock-keyhole" />
          </span>
        </div>
        <div className="purchase-lock-key">
          <span className="purchase-key-head" />
          <span className="purchase-key-shaft" />
          <span className="purchase-key-teeth" />
        </div>
      </div>

      <div className="purchase-lock-copy">
        <p className="kicker">{sealed ? "Zaključano" : "Rezervisano"}</p>
        <h2 className="serif purchase-lock-title">{title}</h2>
        <p className="purchase-lock-text">
          {sealed
            ? "Uplata je potvrđena. Sajt je zaključan i rezervisan samo za vas."
            : "Osvojili ste aukciju. Ključ je okrenut — sajt je rezervisan za vas dok se uplata potvrdi."}
        </p>
        <p className="purchase-lock-ref num">Ref. {paymentRef}</p>
      </div>
    </div>
  );
}
