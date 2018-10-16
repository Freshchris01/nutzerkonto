# Nutzerkonto

Dies ist ein [Tech4Germany](https://tech4germany.org)-Projekt.

Dieses Repository ist die Implementierung für das Nutzerkonto Bund, um insbesondere die Modularität und Sicherheit des Ansatzes auf Architekturebene zu veranschaulichen.

## Architektur

![Gesamtarchitektur](/docs/architecture_complete.png)

**Modularitat**

Um das Nutzerkonto modular zu gestalten, stellen alle Mehrwertdienste und Services erstens APIs bereit und können zweitens unabhängig voneinander in Containern gestartet werden.

Der Authentifizierungs-Prozess läuft wie im folgenden Diagramm ab. Das Session-Management (prototypisch mit Keycloak, also der Keycloak-Server) speichert die Sessions zentral während beim Anbieter-Client nur die Session-ID in Form eines Cookies abgelegt wird. Der Transfer findet selbstverständlich via TLS abgesichert statt.

![Architektur der Authentifizierung](/docs/architecture_authentication.png)

Dadurch ist der Code des Anbieters unabhängig von der IAM-Komponente (low coupling).

**Sicherheit**

Um ein gewisse Sicherheit ([BSI, 2014](https://www.bsi.bund.de/DE/Themen/ITGrundschutz/ITGrundschutzKataloge/Inhalt/_content/m/m04/m04394.html?nn=6604968)) zu erreichen wird die Session-ID für einen angemeldeten Benutzer dazu verwendet, eine auf dem Server gespeicherte Session (inklusive Access-und ID-Tokens, siehe OIDC Standard) mit dem Benutzer in Verbindung zu bringen. Die Tokens werden nach vorgegebenem  JWE Standard (RFC 7516) signiert und verschlüsselt, damit im Falle eines erfolgreichen Angriffs auf den Server die Tokens nicht direkt ausgelesen werden können.

Zusätzlich zu Benutzername und Passwort beinhaltet die Authentifizierung aller sicherheitsrelevanten Informationen einen zweiten Faktor, wie zum Beispiel TOTP oder push Token 2FA. Hierbei authentifiziert sich der Server mit Zertifikat und die Anzahl an Versuchen ist zum Schutz gegen Brute-Force-Angriffe limitiert. Des Weiteren sind die Tokens von der IDM-Komponente (in unserem Fall Keycloak) signiert.

Für weitere Details bezüglich Modularität oder Sicherheit kontakieren Sie gerne Tech4Germany.

## Requirements
- Node.js

## Setup

### 1. Setup Nutzerkonto Repository (dieses Repository)

- `npm install`
- eine `.env`-Datei im Root-Verzeichnis dieses Projektes mit den folgenden Attributen erstellen

|Attribute|Description | Example|
|--|--|--|
| HOST_NUTZERKONTO | URL für das Nutzerkonto Bund | http://localhost:3000 |
| HOST_NUTZERKONTO_SP | URL für den exemplarischen Anbieter | http://localhost:3001 |

- die `.config`-Datei im Root-Verzeichnis dahingehend ändern, dass die `KEYCLOAK`-Variable auf die eigene Installation von Keycloak zeigt (Installation findet im folgenden Schritt statt)
- `npm start`

### 2. Setup [Nutzerkonto Anbieter](https://github.com/tech4germany/nutzerkonto-anbieter)

### 3. Setup Keycloak als IAM-Komponente

Um den Prototypen zu testen, ist die Installation des Keycloak Servers eine notwendige Voraussetzung, da er die zentrale IAM-Komponente darstellt. Zusätzlich zur [offiziellen Dokumentation](https://www.keycloak.org/documentation.html) ist die [Anleitung auf codeburst.io](https://codeburst.io/keycloak-and-express-7c71693d507a) sehr empfehlenswert.

Grundsätzliche Schritte:
1. Herunterladen des [Keycloak Server Images](https://www.keycloak.org/downloads.html)
2. Entpacken des Images
3. Erstellen des ersten Benutzers ist mit dem CLI- Tool `./bin/add-user-keycloak.sh`
4. Starten des Keycloak Servers mit `./bin/standalone.sh -b=0.0.0.0`
5. optional; einrichten des SMTP Servers für den Mailversand zur Benachrichtigung von Benutzern: Realm Settings → Email → SMTP Informationen eingeben (z.B. Gmail Server Daten)
