1. Mitä tekoäly teki hyvin
- Dockeroi kehitysympäristön ja teki ihan perus ok Dockerfilen jolla tehdä backendistä image.
- Pystytti hyvin tavallisen Fastify api:n ja loi sille yksinkertaiset testit.

2. Mitä tekoäly teki huonosti
- Unohti asentaa yhden npm paketin
- Pystytti myös melko yksinkertaisen hakemistorakenteen
- Kommentoi todella paljon koodia, jopa yksinkertaisia funktioita. (makuasia)

3. Tärkeimmät parannukset
- Docker imagen korjaus (ei devdependency kirjastolla logaamista prodissa)
- Arkkitehtuurin parantaminen, eli jaetaan koodia domaineihin. Halutessaan voisi olla vielä vaikka controllereita sun muita.