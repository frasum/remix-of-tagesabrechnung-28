

## Plan: Lohnabrechnungsdaten aus thaitime importieren

### Übersicht

Die thaitime `employees`-Tabelle enthält umfangreiche Lohnabrechnungsdaten (Steuerklasse, Steuer-ID, SV-Nr., Krankenkasse, Urlaubsdaten etc.), die in das Tagesabrechnungssystem übernommen werden sollen. Dafür müssen neue Spalten in der `staff`-Tabelle angelegt, die thaitime `sync-employees` Edge Function erweitert und die lokale Import-Funktion erstellt werden.

### Neue Felder in der `staff`-Tabelle

```text
tax_class          text       (Steuerklasse: I-VI)
is_minijob         boolean    (Minijob 450€-Basis)
is_sv_exempt       boolean    (SV-befreit)
date_of_birth      date       (Geburtsdatum)
employment_start   date       (Einstellungsdatum)
employment_end     date       (Austrittsdatum)
tax_id             text       (Steuer-ID)
social_security_nr text       (Sozialversicherungsnr.)
nationality        text       (Staatsangehörigkeit)
personnel_group    text       (Personengruppe)
health_insurance   text       (Krankenkasse)
vacation_days_contractual  integer  (Urlaubstage vertraglich)
vacation_days_previous     integer  (Resturlaub Vorjahr)
vacation_days_current      integer  (Urlaubstage aktuelles Jahr)
vacation_days_taken        integer  (Genommene Urlaubstage)
sick_days_total            integer  (Kranktage gesamt)
```

### Umsetzung (3 Schritte)

**1. DB-Migration** — 16 neue Spalten zur `staff`-Tabelle hinzufügen (alle nullable, keine Breaking Changes).

**2. thaitime `sync-employees` erweitern** — Die bestehende Edge Function im thaitime-Projekt liefert aktuell nur Basisdaten. Sie muss um die Lohnabrechnungsfelder erweitert werden (Select + Mapping). Dies erfordert eine Änderung im thaitime-Projekt.

**3. Lokale Edge Function `sync-thaitime-staff`** — Ruft die erweiterte thaitime-API auf, gleicht per `perso_nr` ab, und importiert/aktualisiert alle Felder inkl. der neuen Lohnabrechnungsdaten.

**4. Import-Button** — Button auf der Mitarbeiterverwaltungsseite, der den Import auslöst und das Ergebnis als Toast anzeigt.

**5. Staff-Dialog erweitern** (optional) — Die neuen Felder im Bearbeitungsdialog anzeigen (read-only oder editierbar), gruppiert unter "Lohnabrechnungsdaten" und "Urlaubsdaten" wie im Screenshot.

### Feld-Mapping thaitime → Tagesabrechnung

```text
thaitime.employees              →  staff
──────────────────────────────────────────────
tax_class                       →  tax_class
is_minijob                      →  is_minijob
is_sv_exempt                    →  is_sv_exempt
date_of_birth                   →  date_of_birth
employment_start_date           →  employment_start
employment_end_date             →  employment_end
tax_id                          →  tax_id
social_security_number          →  social_security_nr
nationality                     →  nationality
personnel_group                 →  personnel_group
health_insurance                →  health_insurance
vacation_days_contractual       →  vacation_days_contractual
vacation_days_previous_year     →  vacation_days_previous
vacation_days_current_year      →  vacation_days_current
vacation_days_taken             →  vacation_days_taken
```

### Hinweis

Das `THAITIME_SYNC_API_KEY` Secret ist bereits konfiguriert. Die thaitime `sync-employees` Edge Function muss im thaitime-Projekt um die zusätzlichen Felder erweitert werden — das kann parallel oder vorher erfolgen.

