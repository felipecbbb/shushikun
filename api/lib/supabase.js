const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://fapciumbeoawyrkijpxe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcGNpdW1iZW9hd3lya2lqcHhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1MTU3OCwiZXhwIjoyMDg5OTI3NTc4fQ.8jeCzts-RN6vCbNnksSP-qUsEzWSQZ_AL_FrfCyjIO0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
