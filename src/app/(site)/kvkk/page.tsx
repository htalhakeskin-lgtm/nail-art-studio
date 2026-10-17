import { legalMetadata, LegalPage } from "@/features/legal";

export function generateMetadata() {
  return legalMetadata("kvkk");
}

export default function Page() {
  return <LegalPage documentKey="kvkk" />;
}
