# School Suite · Front-end prototype (v1.0.2)

An early front end for School Suite, the school management platform built at [CaChi Cloud](https://cachicloud.com) for Nigerian primary and secondary schools. It runs on sample data so every screen can be tried without a server.

Built by Caleb Samson Etekpe, co-founder and CTO of CaChi Cloud.

## What's in it

- **Separate logins** for students, parents, teachers and admins, designed for people with little computer experience. Students and parents sign in with a 4-digit PIN from the school.
- **Admin portal:** overview, class and subject assignments (assign, reassign, remove, with a history of changes), teachers, result approval, and login management with PIN resets.
- **Teacher portal:** score entry per class, assigned classes, change history and timetable.
- **Student portal:** results, fees and payment history, school news, timetable and profile.
- **Report cards** that can be printed or saved as PDF.
- **Charts** for performance at a glance, and GSAP page transitions.

> This prototype uses sample data only. The production version adds a PHP and MySQL backend with a 22-table schema, a JSON API and automated API checks, and is kept private.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Bootstrap · GSAP · Framer Motion

## Run it locally

```bash
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Project structure

| Folder | What it holds |
| --- | --- |
| `src/pages/Landing.tsx` | Landing page and login chooser |
| `src/portals/` | Admin, teacher and student portals |
| `src/components/` | Report card, charts, portal frame and shared UI |
| `src/data/mock.ts` | Sample school, classes, students, scores and fees |
