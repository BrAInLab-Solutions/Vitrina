import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-24">
      <p className="kicker">404</p>
      <h1 className="serif mt-3 text-5xl">Ova stranica nije u sali.</h1>
      <Link href="/aukcije" className="btn btn-gold mt-6">Istraži aukcije</Link>
    </div>
  );
}
