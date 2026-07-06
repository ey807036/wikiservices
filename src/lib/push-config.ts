// VAPID public key is safe to expose in client code (it's the "public" half).
export const VAPID_PUBLIC_KEY =
  "BOuYKzBVQ2My8mwJNJGBSPpb2bUkdGA-52WbrlSpk1IpbFBnIqQOn2EsVCq6xNyPV43izY1__5sOr6kURXogalg";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}
