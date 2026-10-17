---
baslik: Form ve onay metinleri
surum: 1.0
yururluk: 2026-10-16
---

<!--
ŞABLON (sablonlar/yasal/acik-riza-ve-form-metinleri.md'den uyarlandı) — Yayın öncesi hukuki incelemeden geçmelidir.
Bu dosya sayfa olarak yayımlanmaz; formlardaki metinlerin tek kaynağıdır.
Plan: pazarlama iletisi yok (İYS yok), özel nitelikli veri toplanmıyor (K-11) → yalnızca bilgilendirme cümlesi ve not alanı uyarısı.
-->

# Form ve onay metinleri

## 1. Bilgilendirme cümlesi (randevu ve iletişim formlarının altında, kutusuz)

> Gönderdiğiniz bilgiler randevunuzu ve talebinizi yönetmek amacıyla işlenir. Ayrıntılar için [KVKK Aydınlatma Metni](/kvkk)'ni inceleyebilirsiniz.

## 2. Not alanı uyarısı (randevu ve iletişim formları)

> Alerji gibi sağlık bilgilerinizi buraya yazmayın; uygulamadan önce yüz yüze konuşuruz.

## 3. Uygulanmayan onaylar

- **Ticari elektronik ileti onayı:** Pazarlama iletisi gönderilmiyor; kutu yok.
- **Özel nitelikli veri açık rızası:** Sağlık bilgisi istenmiyor; kutu yok.
- **Çerez onayı:** Ziyaretçi çerezi yok (Çerez Politikası).

## 4. Çalışma fotoğrafı yayın izni

Stüdyoda imzalatılan ayrı metin: `content/yasal/fotograf-yayin-izni.md` (D-09'da eklenecek). Panelde "müşteri izni alındı" işareti bu metne dayanır (BR-GLR-003).

## 5. Onay kaydı (sistem tarafı)

- `kind`: `information_notice` (formun gönderildiği metin sürümü)
- `granted`: true
- `text_version`: Bu dosyanın ve KVKK aydınlatma metninin `surum` alanı
- `source`: `appointmentForm` · `contactForm`
- `subject_ref`: Randevu / talep kimliği
- `ip_hash`: Tuzlu karma (düz IP saklanmaz)
