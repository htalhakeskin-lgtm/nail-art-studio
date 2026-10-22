import { describe, expect, it } from "vitest";

import { appointmentShareMessage, groupByDayPart, serviceSlugForWork } from "./messages";

describe("appointment texts", () => {
  it("PRJ-01: the WhatsApp text carries code, service and time, never a price", () => {
    const message = appointmentShareMessage("Merhaba.", {
      code: "NAS-7K2Q",
      serviceName: "Kalıcı oje",
      startsAt: new Date("2026-10-27T07:00:00Z"),
    });
    expect(message).toBe(
      "Merhaba. Online randevu talebim:\nKod: NAS-7K2Q\nHizmet: Kalıcı oje\nTarih: 27 Ekim 2026 Salı 10:00",
    );
    expect(message).not.toMatch(/₺/);
  });

  it("REQ-011: a gallery work opens the booking with a matching service", () => {
    expect(serviceSlugForWork({ technique: "protez", style: "rengarenk" })).toBe("protez-tirnak");
    expect(serviceSlugForWork({ technique: "kalici-oje", style: "desenli" })).toBe(
      "el-boyamasi-nail-art",
    );
    expect(serviceSlugForWork({ technique: "kalici-oje", style: "sade" })).toBe("kalici-oje");
    expect(serviceSlugForWork({ technique: "jel", style: "simli" })).toBe("jel-guclendirme");
  });

  it("groups times into morning, afternoon and evening, leaving empty groups out", () => {
    const groups = groupByDayPart([{ clock: "10:00" }, { clock: "12:00" }, { clock: "18:30" }]);
    expect(groups.map((group) => [group.label, group.slots.length])).toEqual([
      ["Sabah", 1],
      ["Öğleden sonra", 1],
      ["Akşam", 1],
    ]);
    expect(groupByDayPart([{ clock: "14:00" }]).map((group) => group.label)).toEqual([
      "Öğleden sonra",
    ]);
  });
});
