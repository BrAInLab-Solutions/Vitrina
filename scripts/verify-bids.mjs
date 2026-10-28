const base = "http://localhost:3010";

function cookieHeader(response) {
  const raw = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [response.headers.get("set-cookie")].filter(Boolean);
  return raw.map((item) => item.split(";")[0]).join("; ");
}

async function login(email) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ email, password: "Vitrina2026!" }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Login ${email} failed: ${JSON.stringify(body)}`);
  return cookieHeader(response);
}

async function bid(cookie, slug, amountEuro) {
  const response = await fetch(`${base}/api/auctions/${slug}/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
    body: JSON.stringify({ amountEuro }),
  });
  const body = await response.json();
  return { status: response.status, body };
}

const anonymous = await fetch(`${base}/api/auctions/northline/bids`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ amountEuro: 99999 }),
});
console.log("anonymous", anonymous.status);

const studio = await login("studio@vitrina.test");
const own = await bid(studio, "northline", 3000);
console.log("own listing", own.status, own.body.error);

const state = await (await fetch(`${base}/api/auctions/northline`)).json();
const low = await bid(await login("jovan@vitrina.test"), "northline", Math.round(state.nextBid / 100) - 1);
console.log("too low", low.status, low.body.error);

const jovan = await login("jovan@vitrina.test");
const ana = await login("ana@vitrina.test");
const fresh = await (await fetch(`${base}/api/auctions/northline`)).json();
const floor = Math.round(fresh.nextBid / 100);
const [first, second] = await Promise.all([
  bid(jovan, "northline", floor),
  bid(ana, "northline", floor + 50),
]);
console.log("concurrent", first.status, second.status, first.body.error || first.body.amount, second.body.error || second.body.amount);

const after = await (await fetch(`${base}/api/auctions/northline`)).json();
const highest = Math.max(...after.bids.map((item) => item.amount));
console.log("highest matches current", highest === after.currentBid, after.currentBid, after.bidCount);

const cross = await fetch(`${base}/api/auctions/northline/bids`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "http://evil.example", Cookie: jovan },
  body: JSON.stringify({ amountEuro: floor + 500 }),
});
console.log("cross origin", cross.status);
