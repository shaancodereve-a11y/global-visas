# Global Visas — Webhook Field Reference

Complete reference of all fields sent in the webhook JSON payload when an application is submitted.

---

## Metadata Fields (Always Present)

| Field | Type | Example |
|---|---|---|
| `event` | string | `"application_submitted"` |
| `timestamp` | string (ISO) | `"2026-02-27T20:44:45.631Z"` |

## Application Fields (Always Present)

| Field | Type | Example |
|---|---|---|
| `application_id` | string (UUID) | `"16a732fe-ef40-4727-b003-a8bb12c541aa"` |
| `application_status` | string | `"submitted"` |
| `application_current_step` | number | `22` |
| `application_admin_notes` | string | `""` (empty until admin adds notes) |
| `application_submitted_at` | string (ISO) | `"2026-02-27T20:44:45.571Z"` |
| `application_created_at` | string (ISO) | `"2026-02-27T20:40:06.352Z"` |

## Applicant Fields (Always Present)

| Field | Type | Example |
|---|---|---|
| `applicant_id` | string (UUID) | `"5e0ba3a0-48fb-4fd4-bcbc-b2a9da3a8ff0"` |
| `applicant_email` | string | `"user@example.com"` |
| `applicant_username` | string | `"user@example.com"` (same as email) |
| `applicant_full_name` | string | `"Syed Haider"` |
| `applicant_role` | string | `"applicant"` |
| `applicant_verified` | string | `"Yes"` or `"No"` |

---

## Form Data Fields

All Yes/No fields normalize to `"Yes"` or `"No"` strings.

### Step 1: Terms & Conditions

| Field | Type | Values |
|---|---|---|
| `termsAccepted` | string | `"Yes"` / `"No"` |

### Step 2: Application Context

| Field | Type | Values / Example |
|---|---|---|
| `outsideAustralia` | string | `"Yes"` / `"No"` |
| `currentLocation` | string | `"Pakistan"` |
| `legalStatus` | string | `"Citizen"` / `"Permanent Resident"` / etc. |
| `visaStream` | string | `"tourist"` / `"business"` / `"sponsored_family"` / `"approved_destination_status"` / `"frequent_traveller"` |
| `visitReasons` | string | Comma-separated: `"Tourism, Business"` |
| `groupProcessing` | string | `"No"` (always) |
| `specialCategory` | string | `"Yes"` / `"No"` |
| `specialCategoryType` | string | `"foreign_government"` / `"united_nations"` / `"exempt_group"` (only if specialCategory = Yes) |
| `significantDates` | string | Free text |
| `lengthOfStay` | string | `"Up to 3 months"` / `"Up to 6 months"` / `"Up to 12 months"` |
| `furtherStayLength` | string | (only if outsideAustralia = No) |
| `furtherStayEndDate` | string | (only if outsideAustralia = No) |
| `furtherStayReason` | string | (only if outsideAustralia = No) |

### Step 3: Applicant Details (Personal)

| Field | Type | Values / Example |
|---|---|---|
| `familyName` | string | `"Akber"` |
| `givenNames` | string | `"Waqas"` |
| `sex` | string | `"male"` / `"female"` / `"other"` |
| `dateOfBirth` | string | `"1996-01-30"` |
| `birthTownCity` | string | `"Lahore"` |
| `birthStateProvince` | string | `"Punjab"` |
| `birthCountry` | string | `"Pakistan"` |
| `relationshipStatus` | string | `"Married"` / `"Single"` / etc. |
| `hasOtherNames` | string | `"Yes"` / `"No"` |
| `citizenOfOtherCountry` | string | `"Yes"` / `"No"` |
| `hasNationalIdCard` | string | `"Yes"` / `"No"` |
| `isPacificAustraliaCardHolder` | string | `"Yes"` / `"No"` |
| `pacificAustraliaCardNumber` | string | (only if isPacificAustraliaCardHolder = Yes) |
| `hasGrantNumber` | string | `"Yes"` / `"No"` |
| `grantNumber` | string | (only if hasGrantNumber = Yes) |
| `hasOtherPassports` | string | `"Yes"` / `"No"` |
| `hasOtherIdentityDocs` | string | `"Yes"` / `"No"` |
| `hasHealthExamination` | string | `"Yes"` / `"No"` |
| `healthExaminationDetails` | string | (only if hasHealthExamination = Yes) |
| `hapId` | string | (only if hasHealthExamination = Yes) |

### Step 3 — Expandable Table: Other Names (when hasOtherNames = "Yes")

| Field | Format | Sub-fields |
|---|---|---|
| `otherNames` | JSON string (array) | Each item: `familyName`, `givenNames`, `reason` |
| `otherNames_count` | number | Count of items |

**Example:**
```json
"otherNames": "[{\"familyName\":\"Smith\",\"givenNames\":\"John\",\"reason\":\"Marriage\"}]",
"otherNames_count": 1
```

### Step 3 — Expandable Table: Other Citizenships (when citizenOfOtherCountry = "Yes")

| Field | Format | Description |
|---|---|---|
| `otherCitizenships` | string | Comma-separated country names |

**Example:**
```json
"otherCitizenships": "United Kingdom, Canada"
```

### Step 3 — Expandable Table: National ID Cards (when hasNationalIdCard = "Yes")

| Field | Format | Sub-fields |
|---|---|---|
| `nationalIdCards` | JSON string (array) | Each item: `familyName`, `givenNames`, `idNumber`, `country`, `issueDate`, `expiryDate` |
| `nationalIdCards_count` | number | Count of items |

**Example:**
```json
"nationalIdCards": "[{\"familyName\":\"Akber\",\"givenNames\":\"Waqas\",\"idNumber\":\"12345\",\"country\":\"Pakistan\",\"issueDate\":\"2020-01-01\",\"expiryDate\":\"2030-01-01\"}]",
"nationalIdCards_count": 1
```

### Step 3 — Expandable Table: Other Travel Documents (when hasOtherPassports = "Yes")

| Field | Format | Sub-fields |
|---|---|---|
| `otherTravelDocs` | JSON string (array) | Each item: `docType`, `name`, `docNumber`, `country`, `nationality`, `dob`, `sex`, `expiry`, `placeOfIssue`, `issueDate` |
| `otherTravelDocs_count` | number | Count of items |

### Step 3 — Expandable Table: Other Identity Documents (when hasOtherIdentityDocs = "Yes")

| Field | Format | Sub-fields |
|---|---|---|
| `otherIdentityDocs` | JSON string (array) | Each item: `familyName`, `givenNames`, `docType`, `idNumber`, `country` |
| `otherIdentityDocs_count` | number | Count of items |

### Step 4: Passport Details

| Field | Type | Example |
|---|---|---|
| `countryOfPassport` | string | `"Pakistan"` |
| `citizenOfPassportCountry` | string | `"Yes"` / `"No"` |
| `nationalityOfHolder` | string | `"Pakistan"` |
| `passportNumber` | string | `"4545676575"` |
| `dateOfIssue` | string | `"2024-01-30"` |
| `dateOfExpiry` | string | `"2030-07-11"` |
| `placeOfIssue` | string | `"Pakistan"` |

### Step 5: Travelling Companions

| Field | Type | Values |
|---|---|---|
| `hasTravellingCompanions` | string | `"Yes"` / `"No"` |

**Expandable Table (when hasTravellingCompanions = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `travellingCompanions` | JSON string (array) | Each item: `relationship`, `familyName`, `givenNames`, `sex`, `dob` |
| `travellingCompanions_count` | number | Count of items |

**Example:**
```json
"travellingCompanions": "[{\"relationship\":\"Spouse\",\"familyName\":\"Akber\",\"givenNames\":\"Fatima\",\"sex\":\"female\",\"dob\":\"1998-05-15\"}]",
"travellingCompanions_count": 1
```

### Step 6: Contact Details

| Field | Type | Example |
|---|---|---|
| `emailAddress` | string | `"user@example.com"` |
| `homePhone` | string | `"03224601609"` |
| `businessPhone` | string | `"03224601609"` |
| `mobilePhone` | string | `"03224601609"` |
| `residentialAddress1` | string | `"1014 Wirt Rd suite 265"` |
| `residentialAddress2` | string | `"Pakistan"` |
| `residentialSuburb` | string | `"Houston"` |
| `residentialState` | string | `"Punjab"` |
| `residentialPostalCode` | string | `"77055"` |
| `residentialCountry` | string | `"Pakistan"` |
| `postalSameAsResidential` | string | `"Yes"` / `"No"` |
| `postalAddress1` | string | (only if postalSameAsResidential = No) |
| `postalAddress2` | string | (only if postalSameAsResidential = No) |
| `postalSuburb` | string | (only if postalSameAsResidential = No) |
| `postalState` | string | (only if postalSameAsResidential = No) |
| `postalPostalCode` | string | (only if postalSameAsResidential = No) |
| `postalCountry` | string | (only if postalSameAsResidential = No) |

### Step 7: Non-Accompanying Members

| Field | Type | Values |
|---|---|---|
| `hasNonAccompanyingMembers` | string | `"Yes"` / `"No"` |

**Expandable Table (when hasNonAccompanyingMembers = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `nonAccompanyingMembers` | JSON string (array) | Each item: `relationship`, `familyName`, `givenNames`, `sex`, `dob`, `countryOfBirth` |
| `nonAccompanyingMembers_count` | number | Count of items |

### Step 8: Authorised Recipient

| Field | Type | Values |
|---|---|---|
| `authorisedRecipient` | string | `"Yes"` / `"No"` |

### Step 9: Entry to Australia

| Field | Type | Example |
|---|---|---|
| `departmentOffice` | string | `"Pakistan, Islamabad"` |
| `plannedArrivalDate` | string | `"2026-04-02"` |
| `plannedDepartureDate` | string | `"2026-05-20"` |
| `multipleEntry` | string | `"Yes"` / `"No"` |
| `willStudy` | string | `"Yes"` / `"No"` |
| `hasAustraliaContacts` | string | `"Yes"` / `"No"` |

**Expandable Table: Entry Dates (when multipleEntry = "Yes" and knows dates):**

| Field | Format | Sub-fields |
|---|---|---|
| `entryDates` | JSON string (array) | Each item: `reason`, `dateFrom`, `dateTo` |
| `entryDates_count` | number | Count of items |

**Expandable Table: Study Courses (when willStudy = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `studyCourses` | JSON string (array) | Each item: `courseName`, `institution`, `dateFrom`, `dateTo` |
| `studyCourses_count` | number | Count of items |

**Expandable Table: Australia Contacts (when hasAustraliaContacts = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `australiaContacts` | JSON string (array) | Each item: `relationship`, `familyName`, `givenNames`, `sex`, `dob`, `country`, `address1`, `address2`, `suburb`, `state`, `postcode`, `homePhone`, `businessPhone`, `mobilePhone`, `email`, `residencyStatus` |
| `australiaContacts_count` | number | Count of items |

### Step 10: Previous Travel

| Field | Type | Values |
|---|---|---|
| `previouslyTravelledToAustralia` | string | `"Yes"` / `"No"` |
| `previouslyAppliedForVisa` | string | `"Yes"` / `"No"` |
| `visaHeldVisa` | string | `"Yes"` / `"No"` |
| `visaNonComplied` | string | `"Yes"` / `"No"` |
| `visaRefusedCancelled` | string | `"Yes"` / `"No"` |

### Step 11: Usual Country of Residence

| Field | Type | Example |
|---|---|---|
| `usualCountryOfResidence` | string | `"Pakistan"` |

### Step 12: Employment

| Field | Type | Example |
|---|---|---|
| `employmentStatus` | string | `"Employed"` / `"Unemployed"` / `"Student"` / `"Retired"` |
| `empOrganisation` | string | `"Google"` |
| `empOccupationGrouping` | string | `"Managers"` |
| `empOrgAddress1` | string | `"1014 Wirt Rd suite 265"` |
| `empOrgSuburb` | string | `"Houston"` |
| `empOrgState` | string | `"Punjab"` |
| `empOrgPostalCode` | string | `"77055"` |
| `empOrgCountry` | string | `"Pakistan"` |
| `empStartDate` | string | `"2026-03-26"` |
| `empContactFamilyName` | string | `"Akber"` |
| `empContactGivenNames` | string | `"Waqas"` |
| `empContactBusinessPhone` | string | `"03224601609"` |
| `empContactEmail` | string | `"waqasmsp@gmail.com"` |

### Step 13: Funding

| Field | Type | Example |
|---|---|---|
| `fundingSource` | string | `"Self funded"` / `"Other person or organisation"` / `"Government"` |
| `selfFundedDetails` | string | (only if Self funded) |

### Step 14: Critical Data Confirmation

| Field | Type | Values |
|---|---|---|
| `criticalDataConfirmed` | string | `"Yes"` / `"No"` |

### Step 15: Visit Relatives (Optional)

| Field | Format | Sub-fields |
|---|---|---|
| `visitRelatives` | JSON string (array) | Each item: varies based on form |
| `visitRelatives_count` | number | Count of items |

### Step 16: Health Declarations

| Field | Type | Values |
|---|---|---|
| `healthVisitedOutside` | string | `"Yes"` / `"No"` |
| `healthEnterHospital` | string | `"Yes"` / `"No"` |
| `healthWorkHealthcare` | string | `"Yes"` / `"No"` |
| `healthAgedCare` | string | `"Yes"` / `"No"` |
| `healthTuberculosis` | string | `"Yes"` / `"No"` |
| `healthMedicalCosts` | string | `"Yes"` / `"No"` |
| `healthOngoingCare` | string | `"Yes"` / `"No"` |

**Expandable Table: Countries Visited (when healthVisitedOutside = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthVisitedCountries` | JSON string (array) | Each item: `name`, `country`, `dateFrom`, `dateTo` |
| `healthVisitedCountries_count` | number | Count of items |

**Expandable Table: Hospital Entries (when healthEnterHospital = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthHospitalEntries` | JSON string (array) | Each item: `name`, `reason`, `details` |
| `healthHospitalEntries_count` | number | Count of items |

**Expandable Table: Healthcare Work (when healthWorkHealthcare = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthWorkHealthcareEntries` | JSON string (array) | Each item: `name`, `role`, `details` |
| `healthWorkHealthcareEntries_count` | number | Count of items |

**Expandable Table: Aged Care (when healthAgedCare = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthAgedCareEntries` | JSON string (array) | Each item: `name`, `role`, `details` |
| `healthAgedCareEntries_count` | number | Count of items |

**Expandable Table: Tuberculosis Details (when healthTuberculosis = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthTbEntries` | JSON string (array) | Each item: `name`, `details` |
| `healthTbEntries_count` | number | Count of items |

**Expandable Table: Medical Costs (when healthMedicalCosts = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthMedicalCostEntries` | JSON string (array) | Each item: `name`, `condition`, `details` |
| `healthMedicalCostEntries_count` | number | Count of items |

**Expandable Table: Ongoing Care (when healthOngoingCare = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `healthOngoingCareEntries` | JSON string (array) | Each item: `name`, `details` |
| `healthOngoingCareEntries_count` | number | Count of items |

### Step 17: Character Declarations

| Field | Type | Values |
|---|---|---|
| `charConvicted` | string | `"Yes"` / `"No"` |
| `charOffenceCharged` | string | `"Yes"` / `"No"` |
| `charAcquittedInsanity` | string | `"Yes"` / `"No"` |
| `charArrestWarrant` | string | `"Yes"` / `"No"` |
| `charWarCrimes` | string | `"Yes"` / `"No"` |
| `charDomesticViolence` | string | `"Yes"` / `"No"` |
| `charSexualOffence` | string | `"Yes"` / `"No"` |
| `charSexOffenderRegister` | string | `"Yes"` / `"No"` |
| `charDeported` | string | `"Yes"` / `"No"` |
| `charVisaOverstay` | string | `"Yes"` / `"No"` |
| `charCriminalConduct` | string | `"Yes"` / `"No"` |
| `charPeopleSmuggling` | string | `"Yes"` / `"No"` |
| `charViolenceOrg` | string | `"Yes"` / `"No"` |
| `charNationalSecurity` | string | `"Yes"` / `"No"` |
| `charOutstandingDebts` | string | `"Yes"` / `"No"` |
| `charMilitaryService` | string | `"Yes"` / `"No"` |
| `charMilitaryTraining` | string | `"Yes"` / `"No"` |
| `charUnfitPlead` | string | `"Yes"` / `"No"` |

**Expandable Table: Offence Entries (when charOffenceCharged = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `charOffenceEntries` | JSON string (array) | Each item: `name`, `offenceType`, `date`, `description` |
| `charOffenceEntries_count` | number | Count of items |

**Expandable Table: Conviction Entries (when charConvicted = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `charConvictedEntries` | JSON string (array) | Each item: `name`, `offenceType`, `date`, `description` |
| `charConvictedEntries_count` | number | Count of items |

**Expandable Table: Domestic Violence Orders (when charDomesticViolence = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `charDvoEntries` | JSON string (array) | Each item: `name`, `date`, `details` |
| `charDvoEntries_count` | number | Count of items |

**Expandable Table: Military Service (when charMilitaryService = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `charMilitaryEntries` | JSON string (array) | Each item: `name`, `country`, `dateFrom`, `dateTo`, `details` |
| `charMilitaryEntries_count` | number | Count of items |

**Expandable Table: Intelligence/Security Training (when charMilitaryTraining = "Yes"):**

| Field | Format | Sub-fields |
|---|---|---|
| `charTrainingEntries` | JSON string (array) | Each item: `name`, `country`, `dateFrom`, `dateTo`, `details` |
| `charTrainingEntries_count` | number | Count of items |

### Step 18-19: Declarations

| Field | Type | Values |
|---|---|---|
| `declNoWork` | string | `"Yes"` / `"No"` |
| `declNoStudyTraining` | string | `"Yes"` / `"No"` |
| `declLeaveAustralia` | string | `"Yes"` / `"No"` |
| `declNoFurtherStay` | string | `"Yes"` / `"No"` |
| `declInformChanges` | string | `"Yes"` / `"No"` |
| `declCompleteCorrect` | string | `"Yes"` / `"No"` |
| `declReadUnderstood` | string | `"Yes"` / `"No"` |
| `declFraudulentRefusal` | string | `"Yes"` / `"No"` |
| `declFraudulentCancellation` | string | `"Yes"` / `"No"` |
| `declUnlawfulNonCitizen` | string | `"Yes"` / `"No"` |
| `declPersonalInfo` | string | `"Yes"` / `"No"` |
| `declPrivacyNotice` | string | `"Yes"` / `"No"` |
| `declBiometricConsent` | string | `"Yes"` / `"No"` |
| `declFingerprints` | string | `"Yes"` / `"No"` |
| `declFingerprintsLawEnforcement` | string | `"Yes"` / `"No"` |
| `declLawEnforcementConsent` | string | `"Yes"` / `"No"` |

---

## Key Notes for Automation Engineers

1. **All Yes/No fields** are normalized to the strings `"Yes"` or `"No"` (never boolean `true`/`false`).

2. **Expandable table fields** (e.g., `otherNames`, `travellingCompanions`) are sent as **JSON strings** — you must parse them with `JSON.parse()` in your automation.

3. **Table count fields** (e.g., `otherNames_count`, `travellingCompanions_count`) are integers showing how many items are in the corresponding array.

4. **Conditional fields** only appear in the payload when the parent Yes/No toggle is set to "Yes". If the toggle is "No", the table/expanded fields will not be present.

5. **Simple arrays** (e.g., `otherCitizenships`, `visitReasons`) are sent as comma-separated strings, not JSON arrays.

6. **All field names** are camelCase and sent as top-level keys in the JSON body.
