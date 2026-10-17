import { PanelShell, requirePanelUser } from "@/features/panel";

// Session read on every request; also required for the nonce-based CSP (11-guvenlik §8).
export const instant = false;

export default async function PanelAppLayout({ children }: LayoutProps<"/panel">) {
  const session = await requirePanelUser();
  return <PanelShell userName={session.user.name}>{children}</PanelShell>;
}
