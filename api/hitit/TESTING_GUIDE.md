# Hitit NDC API Testing Guide

## Environment Setup

Add these to your `.env` file:

```env
HITIT_USERNAME=PSA27463763
HITIT_PASSWORD=Test12345
HITIT_BASE_URL=https://pia-stage.crane.aero
HITIT_AGENCY_ID=PSA27463763
HITIT_EMAIL=admin@hititcs.com
HITIT_AGENCY_NAME=HITIT COMPUTER SERVICES
```

```

## Quick Verification (Recommended)

To verifying the enhancements for Multi-City AirShopping and Detailed Pricing without making actual API calls, run the included verification script:

```bash
node api/hitit/test_mapper_revised.js
```

This script simulates a Hitit API response and tests:
- **Leg Splitting** (Departure vs Return)
- **Cabin Info Extraction** (e.g., ECONOMY)
- **Infant Pricing & Counts**

If successful, you will see a detailed breakdown of the mapped response.

## Prerequisites for DoAirShopping

Before testing `doAirShopping`, you need to:

1. **Get General Parameters** - To know available currencies, cabin classes, and trip types
2. **Get Airline Profile** - To know available routes/ports

---

## Step 1: Get General Parameters

### Postman Request

**Method:** `GET`  
**URL:** `http://localhost:YOUR_PORT/api/hitit/general-params`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:** Will contain:
- Available currencies (e.g., PKR, USD)
- Cabin classes (e.g., Y, C, F)
- Trip types (OneWay, RoundTrip, MultiDestination)
- Passenger type age limits

---

## Step 2: Get Airline Profile

### Postman Request

**Method:** `GET`  
**URL:** `http://localhost:YOUR_PORT/api/hitit/airline-profile?airlineCode=PK`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:** Will contain available origin-destination port combinations

---

## Step 3: DoAirShopping - One Way (ISB-KHI)

### Postman Request

**Method:** `POST`  
**URL:** `http://localhost:YOUR_PORT/api/hitit/search-flights`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (JSON):**
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
  "airlineCode": "PK",
  "useCitySearch": false
}
```

---

## Step 4: DoAirShopping - Round Trip (KHI-ISB-KHI)

### Postman Request

**Method:** `POST`  
**URL:** `http://localhost:YOUR_PORT/api/hitit/search-flights`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "originDestCriteria": [
    {
      "originCode": "KHI",
      "destCode": "ISB",
      "departureDate": "2024-12-20"
    },
    {
      "originCode": "ISB",
      "destCode": "KHI",
      "departureDate": "2024-12-25"
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
  "tripType": "RoundTrip",
  "airlineCode": "PK",
  "useCitySearch": false
}
```

---

## Step 5: DoAirShopping - Multi Destination (KHI-ISB LHE-KHI)

### Postman Request

**Method:** `POST`  
**URL:** `http://localhost:YOUR_PORT/api/hitit/search-flights`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "originDestCriteria": [
    {
      "originCode": "KHI",
      "destCode": "ISB",
      "departureDate": "2024-12-20"
    },
    {
      "originCode": "LHE",
      "destCode": "KHI",
      "departureDate": "2024-12-25"
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
  "tripType": "MultiDestination",
  "airlineCode": "PK",
  "useCitySearch": false
}
```

---

## Step 6: DoAirShopping - Multiple Passenger Types (ADT + CHD + INF)

### Postman Request

**Method:** `POST`  
**URL:** `http://localhost:YOUR_PORT/api/hitit/search-flights`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (JSON):**
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
    },
    {
      "paxID": "PAX-ADT2",
      "ptc": "ADT",
      "birthdate": "1985-05-15"
    },
    {
      "paxID": "PAX-CHD1",
      "ptc": "CHD",
      "birthdate": "2015-09-20"
    },
    {
      "paxID": "PAX-INF1",
      "ptc": "INF",
      "birthdate": "2023-01-01"
    }
  ],
  "currency": "PKR",
  "cabinClass": "Y",
  "tripType": "OneWay",
  "airlineCode": "PK",
  "useCitySearch": false
}
```

---

## Direct NDC API Testing (Postman)

If you want to test directly against the Hitit NDC API:

### DoGeneralParams

**Method:** `POST`  
**URL:** `https://pia-stage.crane.aero/DoGeneralParams`

**Headers:**
```
Authorization: Basic UFNBMjc0NjM3NjM6VGVzdDEyMzQ1
Content-Type: application/xml
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
  <DoGeneralParams>
  </DoGeneralParams>
</CraneNDCService>
```

**Note:** The Authorization header uses Basic Auth with base64 encoded `username:password`
- Username: `PSA27463763`
- Password: `Test12345`
- Base64: `PSA27463763:Test12345` = `UFNBMjc0NjM3NjM6VGVzdDEyMzQ1`

---

### DoAirlineProfile

**Method:** `POST`  
**URL:** `https://pia-stage.crane.aero/DoAirlineProfile`

**Headers:**
```
Authorization: Basic UFNBMjc0NjM3NjM6VGVzdDEyMzQ1
Content-Type: application/xml
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
  <DoAirlineProfile>
    <AirlineDesigCode>PK</AirlineDesigCode>
  </DoAirlineProfile>
</CraneNDCService>
```

---

### DoAirShopping - One Way (ISB-KHI)

**Method:** `POST`  
**URL:** `https://pia-stage.crane.aero/DoAirShopping`

**Headers:**
```
Authorization: Basic UFNBMjc0NjM3NjM6VGVzdDEyMzQ1
Content-Type: application/xml
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

### DoAirShopping - Round Trip (KHI-ISB-KHI)

**Method:** `POST`  
**URL:** `https://pia-stage.crane.aero/DoAirShopping`

**Headers:**
```
Authorization: Basic UFNBMjc0NjM3NjM6VGVzdDEyMzQ1
Content-Type: application/xml
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

## Testing Flow Summary

1. ✅ **Get General Parameters** → Know available currencies, cabin classes, trip types
2. ✅ **Get Airline Profile** → Know available routes
3. ✅ **DoAirShopping** → Search for flights
4. ✅ **DoOrderCreate** → Create reservation (use OfferID from DoAirShopping response)
5. ✅ **DoOrderRetrieve** → View PNR details
6. ✅ **DoTicketPreview** → Preview pricing before ticketing
7. ✅ **DoOrderChange** → Complete ticketing with payment

---

## Important Notes

- **Dates:** Use format `YYYY-MM-DD` (e.g., `2024-12-20`)
- **Passenger Types:** 
  - `ADT` = Adult (12+ years)
  - `CHD` = Child (2-11 years)
  - `INF` = Infant (under 2 years)
- **Currency:** Use `PKR` for Pakistan Rupees
- **Cabin Classes:** 
  - `Y` = Economy
  - `C` = Business
  - `F` = First
- **Trip Types:**
  - `OneWay` = One way flight
  - `RoundTrip` = Round trip
  - `MultiDestination` = Multi-city

---

## Response Structure

The `DoAirShopping` response will contain:
- `OfferList` - List of available flight offers
- `DataLists` - Contains:
  - `OriginDestList` - Origin-destination pairs
  - `PaxJourneyList` - Journey options
  - `PaxSegmentList` - Flight segments
  - `PaxList` - Passenger information
- `OfferItem` - Individual offer items with pricing

Save the `OfferID` and `OfferItemID` from the response to use in `DoOrderCreate`.

