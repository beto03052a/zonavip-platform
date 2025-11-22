# ZonaVIP Platform - Product Backlog

## Overview

This document contains the complete product backlog for the ZonaVIP platform MVP, organized by functional modules. Each user story includes acceptance criteria, story points, and priority.

**MVP Timeline**: 10 weeks  
**Total Stories**: 34  
**Estimation Scale**: Fibonacci (1, 2, 3, 5, 8, 13)

## Priority Levels

- **P0**: Critical - Must have for MVP
- **P1**: High - Should have for MVP
- **P2**: Medium - Nice to have
- **P3**: Low - Future enhancement

---

## Module A: Authentication & User Management

### A1: User Registration
**As a** new user  
**I want to** register an account with email and password  
**So that** I can access the platform and its benefits

**Acceptance Criteria**:
- User can provide email, password, name, and phone number
- Email validation (format and uniqueness)
- Password must meet security requirements (min 8 chars, uppercase, lowercase, number)
- User receives confirmation email
- User profile is created with default role 'USUARIO'
- System assigns user to entity if provided entity code

**Priority**: P0  
**Story Points**: 5  
**Sprint**: 1

---

### A2: User Login
**As a** registered user  
**I want to** log in with my credentials  
**So that** I can access my account and personalized features

**Acceptance Criteria**:
- User can log in with email and password
- System validates credentials
- JWT tokens (access + refresh) are generated
- Invalid credentials show appropriate error message
- Failed login attempts are rate-limited (max 5 attempts)
- User session is tracked

**Priority**: P0  
**Story Points**: 3  
**Sprint**: 1

---

### A3: Password Reset
**As a** user who forgot password  
**I want to** reset my password via email  
**So that** I can regain access to my account

**Acceptance Criteria**:
- User can request password reset by email
- System sends reset link to registered email
- Reset link expires after 1 hour
- User can set new password via reset link
- Old password is invalidated
- User receives confirmation email

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 2

---

### A4: Profile Management
**As a** logged-in user  
**I want to** view and edit my profile  
**So that** I can keep my information up to date

**Acceptance Criteria**:
- User can view current profile information
- User can update name, phone, photo
- User can change password (requires current password)
- Changes are validated before saving
- Profile updates are reflected immediately
- User receives confirmation of changes

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 3

---

### A5: Social Login
**As a** new or returning user  
**I want to** log in using Google or Facebook  
**So that** I can access the platform quickly without creating another password

**Acceptance Criteria**:
- User can authenticate via Google OAuth
- User can authenticate via Facebook OAuth
- New users are automatically registered
- Existing users (same email) are linked to social account
- Profile information is populated from social provider
- User can disconnect social login

**Priority**: P2  
**Story Points**: 5  
**Sprint**: 5

---

## Module B: Search & Discovery

### B1: Geolocation-Based Search
**As a** user  
**I want to** search for businesses near my current location  
**So that** I can find nearby places with discounts

**Acceptance Criteria**:
- User can allow location access
- System uses PostGIS to find businesses within configurable radius (default 5km)
- Results show distance from user
- Results are sorted by distance by default
- Map view shows business locations
- User can adjust search radius

**Priority**: P0  
**Story Points**: 8  
**Sprint**: 2

---

### B2: Category Filtering
**As a** user  
**I want to** filter businesses by category  
**So that** I can find specific types of services I need

**Acceptance Criteria**:
- User can select from predefined categories (Restaurant, Health, etc.)
- Multiple categories can be selected
- Filter updates search results in real-time
- Category counts are displayed
- User can clear filters
- Selected filters are visually indicated

**Priority**: P0  
**Story Points**: 3  
**Sprint**: 2

---

### B3: Text Search
**As a** user  
**I want to** search for businesses or products by name  
**So that** I can quickly find what I'm looking for

**Acceptance Criteria**:
- User can enter search query
- System searches business names, descriptions, and products
- Search uses OpenSearch for full-text matching
- Results show relevance ranking
- Search suggestions appear as user types
- Recent searches are saved

**Priority**: P0  
**Story Points**: 5  
**Sprint**: 3

---

### B4: Advanced Filters
**As a** user  
**I want to** apply advanced filters (rating, discount %, verified)  
**So that** I can refine my search results

**Acceptance Criteria**:
- User can filter by minimum rating
- User can filter by minimum discount percentage
- User can filter for verified businesses only
- User can filter by open now
- Multiple filters work together (AND logic)
- Filter counts update dynamically

**Priority**: P1  
**Story Points**: 5  
**Sprint**: 4

---

### B5: Business Details View
**As a** user  
**I want to** view detailed information about a business  
**So that** I can decide if I want to visit

**Acceptance Criteria**:
- User can tap/click business to see details
- Details include: description, address, hours, phone, photos
- Available discounts are prominently displayed
- Map shows exact location
- User can call business directly
- User can get directions via maps app
- User can see reviews and ratings

**Priority**: P0  
**Story Points**: 5  
**Sprint**: 3

---

## Module C: Discount Calculation & Management

### C1: View Available Discounts
**As a** user  
**I want to** see all discounts available to me  
**So that** I know what benefits I can access

**Acceptance Criteria**:
- User sees personalized discount list
- Discounts show access level (N1, N2, N3)
- User sees which plan provides each discount
- Expired discounts are not shown
- Discounts indicate validity period
- User can filter by business or category

**Priority**: P0  
**Story Points**: 5  
**Sprint**: 3

---

### C2: Automatic Best Discount Selection
**As a** user making a purchase  
**I want to** automatically receive the best available discount  
**So that** I maximize my savings without manual calculation

**Acceptance Criteria**:
- System applies formula: MAX(descuentoNivel2, descuentoPlanEntidad)
- Best discount is automatically selected
- User sees calculation breakdown
- Alternative discounts are shown for transparency
- User cannot manually override automatic selection
- Discount respects usage limits and time restrictions

**Priority**: P0  
**Story Points**: 8  
**Sprint**: 4

---

### C3: Discount Validity Verification
**As a** business owner  
**I want to** verify that a discount is valid before applying it  
**So that** I prevent fraud and ensure compliance

**Acceptance Criteria**:
- System checks user eligibility (entity membership, active plan)
- System validates discount hasn't expired
- System checks usage limits haven't been exceeded
- System verifies day/time restrictions
- Clear error messages for invalid discounts
- Validation happens in real-time

**Priority**: P0  
**Story Points**: 5  
**Sprint**: 4

---

### C4: Multi-tier Access Level Logic
**As a** system administrator  
**I want to** configure N1, N2, N3 access levels  
**So that** different user groups get appropriate discount tiers

**Acceptance Criteria**:
- N1 (Entity Level): Direct entity-business agreements
- N2 (Plan Level): Discounts through benefit plans
- N3 (Public Level): General public promotions
- Higher levels override lower levels
- Access levels are clearly indicated to users
- Admin can create agreements at any level

**Priority**: P0  
**Story Points**: 8  
**Sprint**: 3

---

### C5: Discount Usage Analytics
**As a** business owner  
**I want to** see how my discounts are being used  
**So that** I can optimize my offerings

**Acceptance Criteria**:
- Dashboard shows total redemptions
- Shows unique users who used discount
- Displays redemption trends over time
- Shows average transaction amount
- Indicates which access level drives most usage
- Can export data as CSV/PDF

**Priority**: P1  
**Story Points**: 5  
**Sprint**: 7

---

## Module D: Dashboard & Analytics

### D1: User Dashboard
**As a** user  
**I want to** see my activity dashboard  
**So that** I can track my usage and savings

**Acceptance Criteria**:
- Dashboard shows total savings to date
- Shows number of transactions
- Displays favorite businesses
- Shows recent transactions
- Charts visualize savings over time
- Shows available vs. used discounts

**Priority**: P1  
**Story Points**: 5  
**Sprint**: 6

---

### D2: Business Performance Dashboard
**As a** business owner  
**I want to** view my business performance metrics  
**So that** I can understand customer engagement

**Acceptance Criteria**:
- Shows total transactions via platform
- Displays revenue generated
- Shows customer acquisition through platform
- Charts show trends over time
- Compares performance across time periods
- Shows top-selling products/services

**Priority**: P1  
**Story Points**: 8  
**Sprint**: 7

---

### D3: Entity (Company) Dashboard
**As an** entity administrator  
**I want to** see how employees use benefits  
**So that** I can measure program success

**Acceptance Criteria**:
- Shows total active users (employees)
- Displays usage rate percentage
- Shows total savings for all employees
- Lists most popular businesses
- Shows adoption trends
- Can filter by department (if available)

**Priority**: P1  
**Story Points**: 8  
**Sprint**: 7

---

### D4: Admin Analytics Dashboard
**As a** platform administrator  
**I want to** see overall platform metrics  
**So that** I can monitor platform health and growth

**Acceptance Criteria**:
- Shows DAU/MAU (Daily/Monthly Active Users)
- Displays total transactions and GMV
- Shows growth metrics (MoM, YoY)
- Geographic heat map of activity
- Top performing categories and businesses
- System health metrics (uptime, response times)

**Priority**: P1  
**Story Points**: 8  
**Sprint**: 8

---

### D5: Custom Reports
**As an** administrator or business owner  
**I want to** generate custom reports  
**So that** I can analyze specific data points

**Acceptance Criteria**:
- User can select date range
- User can choose metrics to include
- User can filter by category, business, entity
- Reports can be exported as PDF or CSV
- Reports can be scheduled (daily, weekly, monthly)
- Email delivery option for scheduled reports

**Priority**: P2  
**Story Points**: 8  
**Sprint**: 9

---

## Module E: QR Code & Transaction Validation

### E1: Generate QR Code for Purchase
**As a** user  
**I want to** generate a QR code for my purchase  
**So that** the business can validate and apply my discount

**Acceptance Criteria**:
- User selects business and amount
- System calculates applicable discount
- QR code is generated and displayed
- QR code has 15-minute expiration
- QR code contains encrypted transaction data
- User can regenerate if expired

**Priority**: P0  
**Story Points**: 8  
**Sprint**: 5

---

### E2: Validate QR Code (Business)
**As a** business owner/cashier  
**I want to** scan and validate customer QR codes  
**So that** I can verify and complete discounted transactions

**Acceptance Criteria**:
- Business app can scan QR codes
- System validates QR code authenticity
- System checks expiration
- Shows transaction details (user, amount, discount)
- One-time use enforcement (cannot scan twice)
- Manual code entry option

**Priority**: P0  
**Story Points**: 8  
**Sprint**: 5

---

### E3: Transaction History
**As a** user  
**I want to** view my past transactions  
**So that** I can track my spending and savings

**Acceptance Criteria**:
- List of all completed transactions
- Shows date, business, amount, discount
- Can filter by date range
- Can search by business name
- Shows transaction details on tap/click
- Can download transaction receipt

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 6

---

### E4: Transaction Dispute/Support
**As a** user  
**I want to** report issues with a transaction  
**So that** I can get help resolving problems

**Acceptance Criteria**:
- User can flag transaction as problematic
- User can describe the issue
- Support ticket is created
- User receives ticket number
- Status updates are provided
- Admin can view and manage disputes

**Priority**: P2  
**Story Points**: 5  
**Sprint**: 9

---

### E5: Receipt Generation
**As a** user  
**I want to** receive a digital receipt after purchase  
**So that** I have proof of transaction

**Acceptance Criteria**:
- Receipt generated automatically after validation
- Includes all transaction details
- Shows discount breakdown
- Available as PDF download
- Sent via email
- Stored in transaction history

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 6

---

## Module F: Notifications

### F1: Push Notifications
**As a** user  
**I want to** receive push notifications about new discounts  
**So that** I don't miss opportunities

**Acceptance Criteria**:
- User receives notification for new discounts
- Notification when near a partnered business (geofence)
- Transaction confirmation notifications
- User can enable/disable notification types
- Notifications are personalized based on preferences
- Deep links to relevant content

**Priority**: P1  
**Story Points**: 5  
**Sprint**: 8

---

### F2: Email Notifications
**As a** user  
**I want to** receive email updates  
**So that** I stay informed about my account and benefits

**Acceptance Criteria**:
- Welcome email on registration
- Transaction confirmation emails
- Weekly digest of new discounts
- Password reset emails
- Account activity alerts
- User can manage email preferences

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 8

---

### F3: WhatsApp Notifications
**As a** user  
**I want to** receive WhatsApp messages for important events  
**So that** I get instant updates on my preferred channel

**Acceptance Criteria**:
- Transaction confirmation via WhatsApp
- QR code expiration reminder
- Important account alerts
- User must opt-in to WhatsApp notifications
- Messages use approved templates
- User can opt-out anytime

**Priority**: P2  
**Story Points**: 5  
**Sprint**: 8

---

### F4: In-App Notifications
**As a** user  
**I want to** see notifications within the app  
**So that** I don't miss important updates

**Acceptance Criteria**:
- Notification center in app
- Badge shows unread count
- Notifications grouped by type
- Mark as read functionality
- Clear all option
- Notifications persist for 30 days

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 8

---

## Additional User Stories

### G1: Onboarding Experience
**As a** new user  
**I want to** go through an interactive onboarding  
**So that** I understand how to use the platform

**Acceptance Criteria**:
- Welcome screens explain key features
- Location permission request with explanation
- Notification permission request
- Quick tutorial on finding and using discounts
- Can skip onboarding
- Onboarding shown only once

**Priority**: P1  
**Story Points**: 3  
**Sprint**: 4

---

### G2: Favorites/Bookmarks
**As a** user  
**I want to** save my favorite businesses  
**So that** I can quickly access them later

**Acceptance Criteria**:
- User can add business to favorites
- Favorites accessible from profile
- Remove from favorites option
- Get notified of new discounts from favorites
- Favorites sync across devices
- Export favorites list

**Priority**: P2  
**Story Points**: 2  
**Sprint**: 6

---

### G3: Business Reviews & Ratings
**As a** user  
**I want to** rate and review businesses  
**So that** I can share my experience with others

**Acceptance Criteria**:
- User can rate business (1-5 stars)
- User can write text review
- Can only review after transaction
- Reviews are moderated
- Business average rating updates
- User can edit/delete own reviews

**Priority**: P2  
**Story Points**: 5  
**Sprint**: 9

---

### G4: Referral Program
**As a** user  
**I want to** refer friends to the platform  
**So that** we both can get bonus benefits

**Acceptance Criteria**:
- User gets unique referral code
- Can share code via social media/messaging
- Both referrer and referee get bonus points
- Track referral conversions
- Referral dashboard shows stats
- Bonus is applied after referee makes first transaction

**Priority**: P3  
**Story Points**: 8  
**Sprint**: 10

---

## Sprint Planning Summary

### Sprint 1 (Week 1-2): Foundation
- A1: User Registration (5)
- A2: User Login (3)
- **Total: 8 points**

### Sprint 2 (Week 2-3): Search & Discovery
- B1: Geolocation-Based Search (8)
- B2: Category Filtering (3)
- A3: Password Reset (3)
- **Total: 14 points**

### Sprint 3 (Week 3-4): Core Features
- B5: Business Details View (5)
- B3: Text Search (5)
- A4: Profile Management (3)
- C4: Multi-tier Access Level Logic (8)
- **Total: 21 points**

### Sprint 4 (Week 4-5): Discounts
- C2: Automatic Best Discount Selection (8)
- C3: Discount Validity Verification (5)
- B4: Advanced Filters (5)
- G1: Onboarding Experience (3)
- **Total: 21 points**

### Sprint 5 (Week 5-6): QR & Transactions
- E1: Generate QR Code (8)
- E2: Validate QR Code (8)
- C1: View Available Discounts (5)
- **Total: 21 points**

### Sprint 6 (Week 6-7): User Experience
- E3: Transaction History (3)
- E5: Receipt Generation (3)
- D1: User Dashboard (5)
- G2: Favorites/Bookmarks (2)
- A5: Social Login (5)
- **Total: 18 points**

### Sprint 7 (Week 7-8): Analytics
- D2: Business Performance Dashboard (8)
- D3: Entity Dashboard (8)
- C5: Discount Usage Analytics (5)
- **Total: 21 points**

### Sprint 8 (Week 8-9): Notifications & Polish
- D4: Admin Analytics Dashboard (8)
- F1: Push Notifications (5)
- F2: Email Notifications (3)
- F3: WhatsApp Notifications (5)
- F4: In-App Notifications (3)
- **Total: 24 points**

### Sprint 9 (Week 9-10): Final Features & Testing
- E4: Transaction Dispute (5)
- D5: Custom Reports (8)
- G3: Business Reviews & Ratings (5)
- Testing, bug fixes, optimization
- **Total: 18+ points**

### Sprint 10 (Week 10): Release Preparation
- G4: Referral Program (8)
- Final testing
- Documentation
- Production deployment
- **Total: 8+ points**

---

## Backlog Metrics

**Total Story Points**: ~186  
**Average Sprint Velocity**: 18-21 points  
**MVP Critical Stories (P0)**: 14 stories, 81 points  
**High Priority Stories (P1)**: 15 stories, 73 points  
**Medium/Low Priority (P2-P3)**: 5 stories, 32 points

## Definition of Done

A user story is considered done when:
1. ✅ Code is written and peer-reviewed
2. ✅ Unit tests written and passing (>80% coverage)
3. ✅ Integration tests passing
4. ✅ Documentation updated
5. ✅ Acceptance criteria met and verified
6. ✅ QA tested and approved
7. ✅ Deployed to staging environment
8. ✅ Product Owner acceptance

## Notes

- Story points are estimates and may be adjusted during sprint planning
- Dependencies between stories should be considered during sprint planning
- Technical debt and bug fixes should be allocated ~20% of sprint capacity
- User feedback from beta testing may introduce new stories or modifications
