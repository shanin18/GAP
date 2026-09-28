# GAP workspace: admin and staff operating guide

This guide describes the implemented workflow. Sign in at `/admin`. The separate `/staff` page is an authenticated overview of the same records you are permitted to access.

## 1. Roles and responsibilities

There are **two login roles**. There is no separate manager, counsellor, student or content-editor login role.

- **Admin:** manages the team, assigns cases, oversees every lead/application/document, and manages website content and settings.
- **Staff:** handles assigned student cases, updates progress, uploads/reviews their application documents, and manages their own account. The database value for this role remains `editor` for compatibility with existing accounts; its displayed label is Staff.
- **Visitors/students:** can browse the website and send public enquiry/application forms. These actions do not give them a staff login or access to private records.

| Capability | Admin | Staff |
| --- | --- | --- |
| Dashboard and reminders | Team-wide | Assigned cases only |
| Read/update leads and applications | All records | Only records assigned to their account |
| Create a lead/application manually | Yes; choose an assignee | Yes; automatically assigned to the creator |
| Assign/reassign a case | Yes | No; assignee is read-only |
| Unassigned public submissions | Review and allocate | Not visible until assigned |
| Private documents and downloads | All | Documents belonging to assigned applications |
| Delete CRM records | Yes | No |
| Website content and settings | Manage | Hidden from sidebar; cannot create/update/delete |
| Countries/universities in application selectors | Available | Available as reference data |
| Users | Manage accounts and roles | Own account only; cannot change role |
| Verification status | View system status | View system status |

Restrictions apply to API requests and direct record URLs, not just the sidebar. Public website content remains publicly readable. Hiding its management links does not make it confidential.

Admin access retains safeguards: Website Content and Site Settings cannot be deleted, an admin cannot delete their own account, and the last admin cannot be demoted. Generated fields remain system-managed.

## 2. Every sidebar item

### Dashboard

Admin sees overall counts, the application pipeline, recent submissions, and records needing attention. Staff sees counts and recent records within their assigned workload. Counts are summaries; open a record to work on it. Dashboard totals may require a refresh after another person makes changes. Reminders update separately.

### Leads

A lead is an enquiry from someone interested in studying abroad, not yet necessarily a formal application. Use it to contact the student, assess their plans, record conversations, and decide the next step.

| Field | Purpose and owner |
| --- | --- |
| Name, Email, Phone | Contact details. Correct mistakes when confirmed with the student. |
| Interested Country | Destination mentioned in the enquiry. |
| Message | The student's original enquiry. |
| Source Page | Website path where the enquiry was submitted; `/` means homepage. Read-only in the admin form. |
| Status | Current enquiry stage; staff update it as work progresses. |
| Assigned To | Person responsible. Admin selects them; staff see their email, read-only. |
| Follow Up At | Date and time of the next contact. Set/reschedule it and save. |
| Application | Optional connection to the student's application. See the conversion workflow below. |
| Staff Notes | Internal conversation notes, decisions and next steps. Do not put passwords here. |
| Email verification status | System status only. Verification is not enabled; neither role manually checks a box to verify a mailbox. |

Lead statuses:

1. **New:** not contacted yet.
2. **Contacted:** first contact has been made.
3. **Qualified:** the enquiry is suitable to proceed.
4. **Application started:** the student is moving through an application; track subsequent actions on that application.
5. **Not proceeding:** no further action is planned.

### Applications

The formal student case, including destination, institution, study level, intake, progress and documents. A student can submit the website application form directly, or staff can create a case on their behalf.

- **Reference:** generated automatically when saved; use it to identify the application.
- **Student/contact/study fields:** record the student's details and intended programme.
- **Status:** reflects the actual stage, not simply the latest conversation.
- **Priority:** Low, Normal, High or Urgent, based on the case's needs.
- **Assigned To:** responsible account. Only admins can change it.
- **Next Action / Next Action At:** describe what must happen and when; the date feeds Reminders.
- **Documents:** checklist entries with labels, statuses and links to private document records.
- **Status History:** recorded automatically when the status changes; read-only.
- **Internal Notes:** working notes for the team.

Application stages are **Submitted → Profile review → Documents required → Ready to apply → Submitted to university → Offer received → Enrolled**. Use **Closed** when a case ends without further work. Choose the stage matching reality; the app does not submit anything to a university when a status changes.

### Documents

Private supporting files linked to an application: identity/passport, academic, English-language, financial or other evidence. Supported uploads include PDF, JPEG, PNG and WebP, up to 4 MB on Vercel or 10 MB locally. Cloudinary-backed documents remain accessible through the workspace's permission checks.

1. Choose the application you are working on.
2. Choose the document type and upload the file.
3. Save, then review the contents.
4. Mark **received**, **approved**, or **needs-update** and explain any issue in the review note.
5. If using the application's document checklist, attach the document there and update that checklist entry too. The checklist status and document review status are separate fields.

Uploaded By is recorded automatically. Staff cannot attach documents to another staff member's application. When an application is reassigned, access to its documents follows the new assignment. These files must not be uploaded through public Media.

### Website Content — admin management

Edits page text, buttons, links and images for predefined website sections. Generated titles, labels and original text explain where each entry appears. Edit Website content, not the original reference. Save and check the public page. See [CMS editing instructions](CMS-EDITING.md) for image precedence, homepage visibility and ordering.

### Media — admin management

Public website images and assets used by content records. Use for website photos/logos, never passports or private student evidence.

### Countries — admin management

Study destinations: introduction, details, images, highlights, journey steps, related universities/news and SEO. These also supply destination choices elsewhere in the site. Staff can select reference records in applications without managing the directory.

### Universities — admin management

University profiles: country/city, logo, links, highlights and publishing. Featured published universities can appear as homepage partners. Staff choose a university when recording an application.

### Services — admin management

Consultancy services: titles, summaries, descriptions, images, checklists and display order.

### Testimonials — admin management

Student stories, photos, ratings and related destinations/universities. Publish only approved content with permission to use it.

### News — admin management

Articles, cover images, formatted body text, summaries, SEO and publishing date. Draft or future-scheduled articles do not appear publicly until publication conditions are met.

### Site Settings — admin management

Site name, default SEO, contact information, favicon, social links and maintenance mode/message. Review carefully because these settings affect the whole public website. Keep the existing settings record rather than creating duplicates.

### Users

Only admins see Users in the sidebar. Admin creates staff accounts, sets roles, and manages team access. Assign cases using the account's email. There is currently no separate staff display-name field.

### My Account

Both roles have a separate My Account link to `/admin/account` for their own email/password and account details. Staff cannot change their role. Staff opening a Users management page directly are redirected to My Account. Their own user API access remains available so account settings continue to work; other user accounts remain inaccessible.

### Logout

Ends the current login session. Log out on shared devices. Authentication is required again to access private workspace records.

## 3. Admin's daily workflow

1. Open Dashboard and Reminders to review the team's outstanding workload.
2. Open Leads and Applications; use an empty Assigned To filter to find unassigned public submissions.
3. Review for duplicates before assigning. Assign each record to the staff member handling it and save.
4. If a lead and application belong to the same student, assign both to the same staff member and link them. Assignments are independent: reassigning the lead does not reassign its application automatically.
5. Monitor overdue follow-ups, urgent applications and documents needing updates.
6. Reassign cases if a team member is unavailable. Reassign their open work before removing an account.
7. Manage website publishing, settings and team accounts as needed.

An empty staff dashboard can be correct: no records have been assigned to that account yet. Admin must allocate existing test/public records before staff can see them.

## 4. Staff's daily workflow

1. Sign in with your own staff account and open Reminders.
2. Review assigned new leads, then contact students using their supplied details.
3. Update the lead status, write useful notes and set the next follow-up time. Save.
4. For students ready to apply, follow the application workflow below.
5. Review assigned applications, collect documents, update status, and set the next action/date.
6. After completing a follow-up, reschedule or clear its date. Opening a reminder does not complete it.
7. Ask an admin to reassign a case or correct access. Do not use another employee's credentials.

New manual leads/applications created by staff are assigned to that staff account automatically when saved. Public submissions remain unassigned until an admin allocates them.

## 5. Enquiry versus application, without duplicates

**Path A: enquiry first**

The student sends the enquiry form → a Lead is created → admin assigns it → staff contacts the student → staff opens the lead's Application **+** action, enters application details and saves the new application → staff saves the lead with that application selected → staff changes the lead status to Application started and tracks future tasks on the application.

Creating an application does not automatically copy every lead field. Check and enter the student's details. Always confirm the selected reference and save the lead after closing the creation dialog.

**Path B: student applies directly**

The student sends the public application form → an Application is created → admin assigns it → staff handles the case. A lead is not required.

**Path C: the student has both**

If the same student previously enquired and later applied, link the lead to their existing application. This connection is a shortcut between the records, not a second submission. Ask an admin to assign both records to you if necessary. Never create a duplicate merely because an application is not visible to your account.

An empty application selector means there are no accessible matching applications. For staff it only lists assigned applications. It loads options from the server so permissions and available records are respected.

## 6. Follow-up reminders

- Find **Reminders** in the admin header. Each item links to its lead/application and shows the due date/time.
- Updates occur every **15 seconds while the tab is visible**, and when you return to it. This is near-real-time polling, not instant push messaging.
- Admin sees team reminders. Staff sees only reminders for their assigned records.
- Leads use Follow Up At; applications use Next Action At. Pick both date and time, then save.
- Dates at or before the current time are due, including overdue items.
- Leads marked Not proceeding or Application started are excluded. Applications marked Enrolled or Closed are excluded.
- After acting, set the next date, clear the date, or choose the appropriate final status. Merely opening the panel does not dismiss a task.
- The panel lists up to the earliest 20 leads and 20 applications; its total includes all due matches.
- If loading fails, the panel reports it and retries. Do not interpret an unavailable panel as zero tasks.
- No email, SMS, OS notification, or background reminder is sent while everyone is logged out. A hosting scheduler/notification delivery service would be a separate addition.

## 7. Read-only fields and verification

Read-only descriptions identify values maintained by the system or an admin. Email verification is currently **not enabled**: a valid email address format does not prove mailbox ownership. The displayed status is informational. Neither staff nor admin can change verification fields through ordinary create/update API requests. The unused Verified At field is hidden.

## 8. Quick role QA after setup

1. Admin assigns one test lead and application to Staff A, and another pair to Staff B.
2. Staff A sees only their assigned CRM records on Dashboard, lists, Reminders and `/staff`.
3. Opening Staff B's record or document URL as Staff A is denied or returns not found. API lists also exclude it.
4. Staff A cannot change Assigned To, role, website content or settings through the API.
5. Staff A creates an application; after saving it belongs to Staff A. They can upload a document for it, but cannot link a document/lead to Staff B's application.
6. Set a follow-up in the past. It appears in Reminders within the next refresh. Move the date into the future and confirm it disappears.
7. Admin reassigns the application to Staff B. Staff A loses access; Staff B gains access to it and its documents after refreshing.

Automated permission checks: `node --import tsx scripts/test-staff-access.mjs`. These check policy functions and hooks; they do not replace the browser/API checks against a running database.
