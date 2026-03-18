// Root page — middleware redirects to /fr or /en
// This file exists as a fallback; it should never render
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/fr");
}
