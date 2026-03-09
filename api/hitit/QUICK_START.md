# Hitit NDC API - Quick Start Guide

## 🔧 Setup

Add to `.env`:
```env
HITIT_USERNAME=PSA27463763
HITIT_PASSWORD=Test12345
HITIT_BASE_URL=https://pia-stage.crane.aero
HITIT_AGENCY_ID=PSA27463763
```

---

## 📋 Prerequisites (Run These First!)

### 1. DoGeneralParams
**Purpose:** Get available currencies, cabin classes, trip types

**Postman:**
- **Method:** `POST`
- **URL:** `https://pia-stage.crane.aero/DoGeneralParams`
- **Auth:** Basic Auth (Username: `PSA27463763`, Password: `Test12345`)
- **Headers:** `Content-Type: application/xml`
- **Body:** See TESTING_GUIDE.md

---

### 2. DoAirlineProfile
**Purpose:** Get available routes/ports

**Postman:**
- **Method:** `POST`
- **URL:** `https://pia-stage.crane.aero/DoAirlineProfile`
- **Auth:** Basic Auth
- **Headers:** `Content-Type: application/xml`
- **Body:** See TESTING_GUIDE.md

---

## ✈️ DoAirShopping - Test Cases

### Test 1: One Way (ISB-KHI)

**Postman:**
- **Method:** `POST`
- **URL:** `https://pia-stage.crane.aero/DoAirShopping`
- **Auth:** Basic Auth (Username: `PSA27463763`, Password: `Test12345`)
- **Headers:**
  ```
  Content-Type: application/xml
  Authorization: Basic UFNBMjc0NjM3NjM6VGVzdDEyMzQ1
  ```

**Body (XML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  <Party>
    <Sender>
      <TravelAgency>
        <AgencyID>PSA27463763</AgencyID>
        <ContactInfo>
          <EmailAddress>
            <EmailAddressText>admin@hititcs.com</EmailAddressText>
          </EmailAddress>
        </ContactInfo>
        <Name>HITIT COMPUTER SERVICES</Name>
      </TravelAgency>
    </Sender>
  </Party>
  <DoAirShopping>
    <CoreRequest>
      <AirlineDesigCode>PK</AirlineDesigCode>
      <CurCode>PKR</CurCode>
      <CabinTypeCode>Y</CabinTypeCode>
      <TripType>OneWay</TripType>
    </CoreRequest>
    <OriginDestCriteriaList>
      <OriginDestCriteria>
        <OriginCode>ISB</OriginCode>
        <DestCode>KHI</DestCode>
        <DepartureDate>2024-12-20</DepartureDate>
      </OriginDestCriteria>
    </OriginDestCriteriaList>
    <PaxList>
      <Pax>
        <PaxID>PAX-ADT1</PaxID>
        <PTC>ADT</PTC>
        <Birthdate>1990-01-01</Birthdate>
      </Pax>
    </PaxList>
  </DoAirShopping>
</CraneNDCService>
```

---

### Test 2: Round Trip (KHI-ISB-KHI)

**Postman:**
- **Method:** `POST`
- **URL:** `https://pia-stage.crane.aero/DoAirShopping`
- **Auth:** Basic Auth
- **Headers:** `Content-Type: application/xml`

**Body (XML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  <Party>
    <Sender>
      <TravelAgency>
        <AgencyID>PSA27463763</AgencyID>
        <ContactInfo>
          <EmailAddress>
            <EmailAddressText>admin@hititcs.com</EmailAddressText>
          </EmailAddress>
        </ContactInfo>
        <Name>HITIT COMPUTER SERVICES</Name>
      </TravelAgency>
    </Sender>
  </Party>
  <DoAirShopping>
    <CoreRequest>
      <AirlineDesigCode>PK</AirlineDesigCode>
      <CurCode>PKR</CurCode>
      <CabinTypeCode>Y</CabinTypeCode>
      <TripType>RoundTrip</TripType>
    </CoreRequest>
    <OriginDestCriteriaList>
      <OriginDestCriteria>
        <OriginCode>KHI</OriginCode>
        <DestCode>ISB</DestCode>
        <DepartureDate>2024-12-20</DepartureDate>
      </OriginDestCriteria>
      <OriginDestCriteria>
        <OriginCode>ISB</OriginCode>
        <DestCode>KHI</DestCode>
        <DepartureDate>2024-12-25</DepartureDate>
      </OriginDestCriteria>
    </OriginDestCriteriaList>
    <PaxList>
      <Pax>
        <PaxID>PAX-ADT1</PaxID>
        <PTC>ADT</PTC>
        <Birthdate>1990-01-01</Birthdate>
      </Pax>
    </PaxList>
  </DoAirShopping>
</CraneNDCService>
```

---

### Test 3: Multi Destination (KHI-ISB LHE-KHI)

**Postman:**
- **Method:** `POST`
- **URL:** `https://pia-stage.crane.aero/DoAirShopping`
- **Auth:** Basic Auth
- **Headers:** `Content-Type: application/xml`

**Body (XML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CraneNDCService>
  <Party>
    <Sender>
      <TravelAgency>
        <AgencyID>PSA27463763</AgencyID>
        <ContactInfo>
          <EmailAddress>
            <EmailAddressText>admin@hititcs.com</EmailAddressText>
          </EmailAddress>
        </ContactInfo>
        <Name>HITIT COMPUTER SERVICES</Name>
      </TravelAgency>
    </Sender>
  </Party>
  <DoAirShopping>
    <CoreRequest>
      <AirlineDesigCode>PK</AirlineDesigCode>
      <CurCode>PKR</CurCode>
      <CabinTypeCode>Y</CabinTypeCode>
      <TripType>MultiDestination</TripType>
    </CoreRequest>
    <OriginDestCriteriaList>
      <OriginDestCriteria>
        <OriginCode>KHI</OriginCode>
        <DestCode>ISB</DestCode>
        <DepartureDate>2024-12-20</DepartureDate>
      </OriginDestCriteria>
      <OriginDestCriteria>
        <OriginCode>LHE</OriginCode>
        <DestCode>KHI</DestCode>
        <DepartureDate>2024-12-25</DepartureDate>
      </OriginDestCriteria>
    </OriginDestCriteriaList>
    <PaxList>
      <Pax>
        <PaxID>PAX-ADT1</PaxID>
        <PTC>ADT</PTC>
        <Birthdate>1990-01-01</Birthdate>
      </Pax>
    </PaxList>
  </DoAirShopping>
</CraneNDCService>
```

---

## 🔑 Authentication

**Basic Auth Credentials:**
- Username: `PSA27463763`
- Password: `Test12345`
- Base64 Encoded: `UFNBMjc0NjM3NjM6VGVzdDEyMzQ1`

**Header Format:**
```
Authorization: Basic UFNBMjc0NjM3NjM6VGVzdDEyMzQ1
```

---

## 📝 Important Notes

1. **Date Format:** Use `YYYY-MM-DD` (e.g., `2024-12-20`)
2. **Currency:** Use `PKR` for Pakistan Rupees
3. **Cabin Classes:** `Y` (Economy), `C` (Business), `F` (First)
4. **Passenger Types:**
   - `ADT` = Adult (12+ years)
   - `CHD` = Child (2-11 years)
   - `INF` = Infant (under 2 years)
5. **Trip Types:**
   - `OneWay` = One way flight
   - `RoundTrip` = Round trip
   - `MultiDestination` = Multi-city

---

## 📦 Response

The response will contain:
- `OfferList` - Available flight offers
- `OfferID` - Save this for `DoOrderCreate`
- `OfferItemID` - Save this for `DoOrderCreate`
- `DataLists` - Flight segments, passengers, etc.

---

## 🚀 Via Backend API

If using the backend API endpoints:

**Search Flights:**
- **Method:** `POST`
- **URL:** `http://localhost:YOUR_PORT/api/hitit/search-flights`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body (JSON):**
```json
{
  "originDestCriteria": [
    {
      "originCode": "ISB",
      "destCode": "KHI",
      "departureDate": "2024-12-20"
    }
  ],
  "paxList": [
    {
      "paxID": "PAX-ADT1",
      "ptc": "ADT",
      "birthdate": "1990-01-01"
    }
  ],
  "currency": "PKR",
  "cabinClass": "Y",
  "tripType": "OneWay",
  "airlineCode": "PK"
}
```

---

## 📚 Full Documentation

See `TESTING_GUIDE.md` for complete testing guide with all endpoints.

