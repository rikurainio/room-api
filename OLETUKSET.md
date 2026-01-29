1. Oletetaan kovakoodatut kymmenen huonetta joilla on id:t 1-10. Vaihtoehtoisesti api:lla voisi olla persisted tietokanta, huoneita voisi luoda ja hallita apista, tai api voisi ladata huoneet jostain ulkoisesta lähteestä.
3. Varaukset tehdään aina UTC-aikana, ISO 8601 formaatissa
4. Varauksien kesto on minuuttien tarkkuudella
5. Huoneen voi varata minimissään 5 minuutiksi, maksimirajoitusta ei ole.
6. Varaukset eivät saa mennä ollenkaan päällekkäin
7. Varausajan alku on inklusiivinen ja loppu eksklusiivinen. Eli varausajan loppu on vapaa.
8. Koska käytössä on muistissa oleva tietokanta, kaikki tehdyt varaukset katoavat, kun palvelu käynnistetään uudelleen.