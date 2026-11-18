# ScholarBeacon — Web Admin Panel (Next.js)

A clean, modern, and intuitive Web Admin Panel for managing scholarships, internships, official sources, and crawler review queues for the **ScholarBeacon** platform.

---

## 🚀 Key Features

1. **Dashboard Overview:** Real-time statistics from MongoDB (total scholarships, internships, active government sources, pending crawler review queue items).
2. **Scholarships & Internships Management (CRUD):**
   - Filter by opportunity classification (**Scholarships vs. Internships vs. All**).
   - Filter by degree levels (**Bachelors, Masters, PhD, Internship, Post-Doctoral**).
   - Full schema support: financial coverage (stipends, airfare, tuition waivers, health insurance), eligibility (minimum GPA, English tests), deadlines, and official source links.
   - Fast real-time search across titles, providers, universities, and host nations.
   - One-click update and deactivation/delete with safety dialogs.
3. **Automated Crawler Review Queue:**
   - Works in tandem with the 24/7 `monitor-scheduler.js`.
   - Any changes detected on official external sites (e.g. deadline extensions, stipend updates) land here **requiring Administrator Permission**.
   - Side-by-side comparison of **Current DB Value vs. Crawled Official Value**.
   - One-click **Approve & Update DB** or **Reject Change**.
4. **Official Sources Registry:**
   - Live health monitoring of the 23 monitored government & embassy bodies (DAAD, Chevening, Fulbright, CSC, MEXT, HEC, etc.).
   - Instant **"Crawl Now"** trigger for manual testing.

---

## 🛠️ How to Run

### Development Mode:
```bash
# From workspace root:
npm run dev:admin

# Or from admin directory:
cd admin
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Default Admin Credentials:
- **Email:** `admin@scholarpath.internal`
- **Password:** `ScholarPathAdmin2026!Secure`
*(Or any administrator account registered in your database)*

### Production Build:
```bash
npm run build --prefix admin
npm run start --prefix admin
```

