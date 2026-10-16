import { legalMetadata, LegalPage } from "@/features/legal";

export function generateMetadata() {
  return legalMetadata("gizlilik");
}

export default function Page() {
  return <LegalPage documentKey="gizlilik" />;
}
