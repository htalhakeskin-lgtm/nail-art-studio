import { legalMetadata, LegalPage } from "@/features/legal";

export function generateMetadata() {
  return legalMetadata("randevu");
}

export default function Page() {
  return <LegalPage documentKey="randevu" />;
}
