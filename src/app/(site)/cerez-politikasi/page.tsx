import { legalMetadata, LegalPage } from "@/features/legal";

export function generateMetadata() {
  return legalMetadata("cerez");
}

export default function Page() {
  return <LegalPage documentKey="cerez" />;
}
