# EMR Appointment Scheduling & Queue Management

This project implements a functional, end-to-end feature for Appointment Scheduling and Queue Management (Feature B) for an Electronic Medical Records (EMR) system. It includes both backend service logic and frontend integration.

## Project Structure

- `appointment_service.py` — Python backend service that simulates Lambda/AppSync logic with mock data
- `EMR_Frontend__Assignment.jsx` — React + Tailwind frontend component with full appointment management functionality
- `src/main.jsx` — React entry point
- `src/index.css` — Tailwind CSS styles

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React (icons)
- **Backend**: Python 3.x (simulating Lambda/AppSync/GraphQL)
- **Data Layer**: PostgreSQL (simulated via Python dictionaries)
- **Build Tool**: Vite

## GraphQL Query Structure

The backend service implements the following GraphQL-like contract:

### Queries

```graphql
query GetAppointments($filters: GetAppointmentsInput) {
  getAppointments(filters: $filters) {
    id
    patientName
    date
    time
    duration
    doctorName
    status
    mode
    purpose
  }
}
```

**GetAppointmentsInput:**
```graphql
input GetAppointmentsInput {
  date: String      # Optional: YYYY-MM-DD format
  status: String    # Optional: "Scheduled", "Confirmed", "Completed", "Cancelled", "Upcoming"
  doctorName: String # Optional: Filter by doctor name
}
```

**Appointment Type:**
```graphql
type Appointment {
  id: ID!
  patientName: String!
  date: String!      # YYYY-MM-DD format
  time: String!      # HH:MM format
  duration: Int!     # Duration in minutes
  doctorName: String!
  status: String!    # Scheduled | Confirmed | Completed | Cancelled | Upcoming
  mode: String!      # In-person | Teleconsult
  purpose: String    # Optional purpose/description
}
```

### Mutations

```graphql
mutation CreateAppointment($input: CreateAppointmentInput!) {
  createAppointment(input: $input) {
    id
    patientName
    date
    time
    duration
    doctorName
    status
    mode
    purpose
  }
}

mutation UpdateAppointmentStatus($id: ID!, $newStatus: String!) {
  updateAppointmentStatus(id: $id, newStatus: $newStatus) {
    id
    status
    patientName
    date
    time
    doctorName
  }
}

mutation DeleteAppointment($id: ID!) {
  deleteAppointment(id: $id)
}
```

**CreateAppointmentInput:**
```graphql
input CreateAppointmentInput {
  patientName: String!
  date: String!      # YYYY-MM-DD format
  time: String!      # HH:MM format
  duration: Int!
  doctorName: String!
  mode: String!      # In-person | Teleconsult
  purpose: String    # Optional
  status: String     # Optional, defaults to "Scheduled"
}
```

## Data Consistency & Transaction Management

### How Data Consistency is Enforced

The Python service (`appointment_service.py`) implements business logic that would be enforced at the database and service layer in production:

#### 1. **Database Transactions**
In production, all write operations would be wrapped in database transactions:
```sql
BEGIN TRANSACTION;
  UPDATE appointments SET status = 'Confirmed' WHERE id = 'appt_123';
  -- Additional related updates (e.g., notifications, audit logs)
COMMIT;
```
If any error occurs, the transaction is rolled back to maintain consistency.

#### 2. **Unique Constraints & Indexes**
The database schema would include constraints to prevent duplicate appointments:
```sql
CREATE UNIQUE INDEX idx_doctor_time_slot 
ON appointments(doctor_name, date, time) 
WHERE status != 'Cancelled';
```
This ensures that a doctor cannot have overlapping appointments on the same date/time.

#### 3. **Idempotency Keys**
For create operations, an idempotency key would be included in the request:
```python
# In production Lambda handler
idempotency_key = event.get('idempotencyKey')
if idempotency_key:
    # Check if this request was already processed
    existing = check_idempotency(idempotency_key)
    if existing:
        return existing  # Return cached result
```
This prevents duplicate appointments from retry requests.

#### 4. **Optimistic Locking**
For update operations, a version column would prevent concurrent modifications:
```sql
UPDATE appointments 
SET status = 'Completed', version = version + 1 
WHERE id = 'appt_123' AND version = 5;
-- If version doesn't match, update fails (someone else modified it)
```
Alternatively, `SELECT ... FOR UPDATE` would lock the row during the transaction:
```sql
BEGIN;
  SELECT * FROM appointments WHERE id = 'appt_123' FOR UPDATE;
  UPDATE appointments SET status = 'Completed' WHERE id = 'appt_123';
COMMIT;
```

#### 5. **AppSync Subscriptions for Real-time Updates**
After a successful mutation, AppSync would publish a subscription event:
```python
# In update_appointment_status() after successful DB commit:
appsync_client.publish(
    topic='onUpdateAppointment',
    payload={
        'id': appointment_id,
        'status': new_status,
        'updatedAt': datetime.now().isoformat()
    }
)
```
Subscribed clients would receive real-time updates without polling.

### Overlap Detection Logic

The service implements overlap detection in the `create_appointment()` function:
- Converts appointment times to minutes since midnight
- Checks for overlapping time ranges for the same doctor on the same date
- Excludes cancelled appointments from conflict checks
- Raises `ValueError` if a conflict is detected

In production, this would be enforced at the database level with constraints and checked in the service layer before insertion.

## Features Implemented

### Backend Service (`appointment_service.py`)

1. **Mock Data**: 11+ hardcoded appointments with all required fields
2. **get_appointments(filters)**: Query function with optional date, status, and doctorName filters
3. **create_appointment(payload)**: 
   - Validates required fields (patientName, date, time, duration, doctorName, mode)
   - Generates unique appointment ID
   - Sets default status to "Scheduled"
   - Prevents time conflicts for the same doctor on the same date
4. **update_appointment_status(id, new_status)**: Updates appointment status with comments explaining AppSync subscriptions
5. **delete_appointment(id)**: Deletes an appointment by ID

### Frontend Component (`EMR_Frontend__Assignment.jsx`)

1. **Data Fetching**: Uses `useEffect` to initialize with data from `get_appointments()`
2. **Calendar Widget**: Interactive calendar with date click handler that filters appointments
3. **Tab Filtering**: 
   - **Today**: Shows appointments for the selected date
   - **Upcoming**: Shows future appointments with status Scheduled/Confirmed/Upcoming
   - **Past**: Shows past appointments or those with Completed/Cancelled status
4. **Status Updates**: Buttons to update appointment status (Confirm, Mark Completed, Cancel) via backend
5. **Create Appointment**: Full form with validation that calls `create_appointment()` and refreshes the list
6. **No Frontend-Only Mutations**: All state changes go through the backend service adapter

## Installation & Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Build for Production**:
```bash
npm run build
```

4. **Preview Production Build**:
```bash
npm run preview
```

## Testing the Backend Service

You can test the Python service directly:

```bash
python appointment_service.py
```

This will:
- Print the total number of mock appointments
- Show appointments filtered by date
- Attempt to create a conflicting appointment (should fail)
- Create a non-conflicting appointment (should succeed)

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Vercel or Netlify
3. Configure environment variables if needed

### Backend Deployment (AWS Lambda + AppSync)

1. Package `appointment_service.py` as a Lambda function
2. Configure AppSync resolvers to call the Lambda
3. Set up Aurora PostgreSQL database
4. Configure subscriptions for real-time updates
5. Set up proper IAM roles and permissions

## Key Design Decisions

1. **Service Adapter Pattern**: The frontend uses a `ServiceAdapter` that simulates API calls to the Python backend. In production, this would make HTTP requests to AppSync/GraphQL endpoints.

2. **No Direct State Mutations**: All appointment modifications go through the backend service, ensuring business logic (validation, overlap detection) is always enforced.

3. **Client-Side Filtering for Complex Queries**: For "Upcoming" and "Past" tabs, the frontend fetches all appointments and filters client-side, as the mock backend only supports simple filters. In production, the GraphQL query would support date range filters.

4. **Immediate Refresh After Mutations**: After any create/update/delete operation, the appointment list is refreshed from the backend to ensure UI consistency.


