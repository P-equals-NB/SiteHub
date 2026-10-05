# SiteHub

A simple anonymous website hub built with HTML, CSS, JavaScript and Supabase.

## Features

- No user accounts
- Anyone can add a website
- Author name is supplied when submitting
- Search
- Categories
- Sort by newest
- Sort by most viewed
- Sort by most starred
- Sort alphabetically
- View counters
- Star counters
- Browser-level prevention of repeatedly starring the same site
- Duplicate URL prevention
- Supabase database

## Files

- index.html - page structure
- style.css - styling
- script.js - Supabase connection and application logic
- supabase.sql - database table and RLS policies

## Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase.sql`.
4. Open Supabase Project Settings -> API.
5. Copy your Project URL.
6. Copy your Publishable key / anon key.
7. Open `script.js`.
8. Replace:

   YOUR_SUPABASE_URL
   YOUR_SUPABASE_ANON_KEY

9. Open `index.html`.

For deployment, upload the three web files to GitHub Pages, Vercel, Netlify, or another static host.

## Important

Do NOT put the Supabase service_role key into `script.js`.

The frontend should use the public publishable/anon key. Database access is controlled by Supabase Row Level Security policies.
