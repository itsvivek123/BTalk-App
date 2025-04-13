# BTalk

A Next.js application for taking audio notes. Record your thoughts with your voice, and they'll be transcribed into text automatically. Save and access your notes anytime.

## Features

- Record audio notes using your microphone
- Speech-to-text conversion using Web Speech API
- Store notes in Supabase database
- View and manage your saved notes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (for database storage)

### Setup

1. Clone this repository
```bash
git clone <repository-url>
cd btalk
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Create a `notes` table with the following schema:
     ```sql
     create table notes (
       id uuid not null primary key default uuid_generate_v4(),
       title text not null,
       content text not null,
       created_at timestamp with time zone default now()
     );
     ```
   - Copy your Supabase URL and anon key 

4. Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js with TypeScript
- Tailwind CSS for styling
- Web Speech API for speech recognition
- Supabase for database storage

## Browser Compatibility

The speech recognition feature uses the Web Speech API, which is currently supported in:
- Google Chrome
- Microsoft Edge
- Safari

## License

MIT
