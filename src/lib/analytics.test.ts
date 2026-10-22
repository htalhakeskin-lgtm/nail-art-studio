import { describe, expect, it } from "vitest";

import { eventForLink, redactPath, redactUrl } from "./analytics";

describe("redactPath / redactUrl (REQ-021, BR-RND-009)", () => {
  it("never sends the secret manage token or any query", () => {
    expect(redactPath("/randevu/yonet/AbC123_secret?yeni=1")).toBe("/randevu/yonet/[token]");
    expect(redactPath("/randevu/yonet/AbC123_secret/takvim.ics")).toBe(
      "/randevu/yonet/[token]/takvim.ics",
    );
    expect(redactUrl("https://ornek.test/iletisim/tesekkurler?kod=TLP-2026-0001#x")).toBe(
      "https://ornek.test/iletisim/tesekkurler",
    );
  });
});

describe("eventForLink (G-18)", () => {
  it("maps contact links to their conversion", () => {
    expect(eventForLink("https://wa.me/905423115888?text=Merhaba", "/")).toBe("whatsapp_click");
    expect(eventForLink("tel:+905423115888", "/iletisim")).toBe("call_click");
    expect(
      eventForLink("https://www.google.com/maps/dir/?api=1&destination=40.98,29.02", "/"),
    ).toBe("directions_click");
    expect(eventForLink("https://maps.apple.com/?daddr=40.98,29.02", "/iletisim")).toBe(
      "directions_click",
    );
  });

  it("tells a design request from a booking start, and ignores steps inside the flow", () => {
    expect(eventForLink("/randevu?tasarim=renkli-puantiye", "/galeri/renkli-puantiye")).toBe(
      "design_selected",
    );
    expect(eventForLink("/randevu", "/")).toBe("booking_started");
    expect(eventForLink("/randevu?hizmet=kalici-oje", "/hizmetler/kalici-oje")).toBe(
      "booking_started",
    );
    expect(eventForLink("/randevu?hizmet=kalici-oje&tarih=2026-10-23", "/randevu")).toBeNull();
    expect(eventForLink("/galeri", "/")).toBeNull();
    expect(eventForLink("https://www.instagram.com/bahadirkarasunails/", "/")).toBeNull();
  });
});
