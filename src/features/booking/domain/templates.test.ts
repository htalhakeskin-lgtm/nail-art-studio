import { describe, expect, it } from "vitest";

import { whatsappTemplate } from "./templates";

const input = {
  customerName: "Ayşe Kaya",
  companyName: "Nail Art Studios",
  serviceName: "Kalıcı oje",
  code: "NAS-7K2Q",
  startsAt: new Date("2026-10-27T07:00:00Z"),
  address: "Caferağa Mah. Moda Cad. No: 00, Kadıköy / İstanbul",
  manageUrl: "https://ornek.test/randevu/yonet/abc",
};

describe("panel WhatsApp templates (REQ-005c)", () => {
  it("confirm: greets by first name and carries time, place, code and the manage link", () => {
    const text = whatsappTemplate("confirm", input);
    expect(text.split("\n")[0]).toBe("Merhaba Ayşe,");
    expect(text).toContain("Tarih: 27 Ekim 2026 Salı 10:00");
    expect(text).toContain("Kod: NAS-7K2Q");
    expect(text).toContain("https://ornek.test/randevu/yonet/abc");
  });

  it("leaves the manage line out when there is no link (panel bookings)", () => {
    expect(whatsappTemplate("reminder", { ...input, manageUrl: null })).not.toContain(
      "yönetebilirsiniz",
    );
  });

  it("BR-HZM-001: no template carries a price or a promotion", () => {
    for (const key of ["confirm", "reminder", "change"] as const) {
      const text = whatsappTemplate(key, input);
      expect(text).not.toMatch(/₺|indirim|kampanya/i);
    }
  });
});
