# Security Specification for Clinic Flow

## Data Invariants
1. A patient cannot be created without a 'RECEPTION' status.
2. Only nurses can update patient vitals.
3. Only doctors can create consultations and order lab tests/treatments.
4. Only cashiers can mark an invoice as paid.
5. Users can only access dashboards matching their role prefix (simulated via UI, but rules must enforce field-level security).
6. Admin ID `ceo.codorah@gmail.com` has full access.

## The Dirty Dozen (Attacker Payloads)
1. **The Ghost Role**: A user attempts to set their own role to 'admin' during profile creation.
2. **The Status Jump**: A patient is moved directly from RECEPTION to DISCHARGED, skipping nurse and doctor.
3. **The Vital Spoof**: A reception user tries to update patient temperature.
4. **The Price Poison**: A doctor tries to set a negative cost for a consultation.
5. **The ID Poison**: An attacker injects a 2MB string as a patient ID.
6. **The Unverified Write**: A user without an email_verified token tries to create a patient.
7. **The Relational Breach**: A nurse tries to update a patient who isn't currently assigned or in the NURSE_QUEUE.
8. **The Ghost Treatment**: A user creates an invoice for a treatment ID that doesn't exist.
9. **The Timestamp Forge**: A client provides a backdated `createdAt` timestamp.
10. **The PII Leak**: A lab technician tries to read all patient phone numbers globally without a specific patient assignment.
11. **The Admin Lockout**: A user tries to delete the admin user profile.
12. **The Double Pay**: A user tries to update a 'paid' invoice back to 'pending'.

## Test Runner (Draft Plan)
- Test `patients` create: requires role in ['admin', 'reception'].
- Test `patients` update (vitals): requires role in ['admin', 'nurse'].
- Test `patients` update (consultation): requires role in ['admin', 'doctor'].
- Test `invoices` update: only 'cashier' can change status to 'paid'.
