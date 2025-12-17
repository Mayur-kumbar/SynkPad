import crypto from "crypto";

export default function generateEmailToken() {
  return crypto.randomBytes(32).toString("hex");
}
