# Nutzerkonto

Dies ist ein [Tech4Germany](https://tech4germany.org)-Projekt.

Dieses Repository ist die Implementierung für das Nutzerkonto Bund, um insbesondere die Modularität und Sicherheit des Ansatzes auf Architekturebene zu veranschaulichen.

## Architektur

![Gesamtarchitektur](/docs/architecture_complete.png)

**Modularitat**

**Sicherheit**

## Requirements
- Node.js

## Setup

### Setup Nutzerkonto Repository (dieses Repository)

- `npm install`
- eine `.env`-Datei im Root-Verzeichnis dieses Projektes mit den folgenden Attributen erstellen

|Attribute|Description | Example|
|--|--|--|
| HOST_NUTZERKONTO | base url for Mehrwertdienste of the Nutzerkonto | http://localhost:3000 |
| HOST_NUTZERKONTO_SP | base url of the service provider | http://localhost:3001 |

- die `.config`-Datei im Root-Verzeichnis dahingehend ändern, dass die `KEYCLOAK`-Variable auf die eigene Installation von Keycloak zeigt (Installation findet im folgenden Schritt statt)

### Setup [Nutzerkonto Anbieter](https://github.com/tech4germany/nutzerkonto-anbieter)

### Setup Keycloak als IAM-Komponente
TODO
