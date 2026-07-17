# ChroniCare Project Summary

Status: Submission draft

## Submission-Ready Short Summary

ChroniCare is a web-based Care Circle that helps people living with chronic illness and their caregivers coordinate long-term daily care. Patients receive a simple, supportive experience for profile-bound check-ins and care routines, while caregivers can manage clearly separated Patient Profiles, review daily-care context, and coordinate next steps. The hackathon scenario uses synthetic type 2 diabetes data to make the workflow concrete, but ChroniCare is designed as a non-diagnostic care-coordination product rather than a diabetes treatment tool. Its safety model keeps authorization on the server, separates every Patient Profile, distinguishes unknown information from information explicitly reported as absent, and avoids presenting recorded health data as medical advice.

## One-Sentence Version

ChroniCare helps chronic illness patients and their caregivers keep daily-care context, routines, and family coordination together in one safely separated Care Circle.

## Problem and Approach

Long-term care information is often fragmented across family conversations, daily observations, reminders, and health documents. This makes it difficult for patients and caregivers to maintain a shared, accurate picture of what happened and what should be discussed next with a qualified health professional.

ChroniCare addresses this coordination gap through separate Patient and Caregiver experiences. A Patient signs in with a profile-bound access code and can complete a check-in. An authorized Caregiver sees only the selected Patient Profile and can maintain medication and reminder records. The target MVP also includes human-reviewed document extraction, guarded AI support for navigation and doctor-visit preparation, an open-dashboard SOS coordination alert, and a static Tangerang facility/BPJS helper. These target capabilities may only be described as working in the final submission after their implementation and QA packets are marked `Done`.

## Product Boundaries

ChroniCare does not diagnose conditions, recommend medication, change doses, interpret laboratory values as clinical truth, prescribe nutrition, dispatch emergency services, or replace doctors, hospitals, ambulances, or BPJS. The demo uses fictional people and synthetic health data only.

## Public Links

- Source code: `[INSERT PUBLIC REPOSITORY URL]`
- Live application: `[INSERT PUBLIC DEPLOYMENT URL, OR REMOVE THIS LINE]`
- Public design file: `[INSERT PUBLIC VIEW-ONLY FIGMA PROJECT URL, OR REMOVE THIS LINE]`
- Demo video: `[INSERT PUBLIC VIDEO URL]`

Remove every bracketed instruction before submission. Do not publish a link until it is accessible without a team account or access request.
