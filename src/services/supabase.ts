import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project details
const supabaseUrl = 'https://ymdaacydpsznzbobppvk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZGFhY3lkcHN6bnpib2JwcHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzcwNzcsImV4cCI6MjA5MTMxMzA3N30.DAvImMrafbZiPp-GDDMwvxyL8qKXRzrpMHaCG58Q-ic';

export const supabase = createClient(supabaseUrl, supabaseKey);
