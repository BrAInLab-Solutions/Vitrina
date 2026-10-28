import type { ReactNode } from "react";
import { PreviewFrame } from "@/components/live-demo";

export function HeroLaptops() {
  return (
    <div className="hero-laptops" aria-hidden="true">
      <div className="hero-laptop hero-laptop--back">
        <div className="float-a">
          <MacBook>
            <PreviewFrame previewKey="northline" />
          </MacBook>
        </div>
      </div>
      <div className="hero-laptop hero-laptop--side">
        <div className="float-c">
          <MacBook>
            <PreviewFrame previewKey="mira" />
          </MacBook>
        </div>
      </div>
      <div className="hero-laptop hero-laptop--front">
        <div className="float-b">
          <MacBook>
            <PreviewFrame previewKey="brasa" />
          </MacBook>
        </div>
      </div>
    </div>
  );
}

function MacBook({ children }: { children: ReactNode }) {
  return (
    <div className="macbook">
      <div className="macbook-lid">
        <span className="macbook-camera" />
        <div className="macbook-display">{children}</div>
      </div>
      <div className="macbook-hinge" />
      <div className="macbook-deck">
        <span className="macbook-notch" />
      </div>
    </div>
  );
}
