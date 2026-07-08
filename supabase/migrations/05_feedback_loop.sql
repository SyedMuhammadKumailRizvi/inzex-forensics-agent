-- Create the finding status enum
CREATE TYPE finding_status_enum AS ENUM ('pending', 'approved', 'rejected', 'rechecking');

-- Add columns to findings table
ALTER TABLE public.findings 
ADD COLUMN status finding_status_enum DEFAULT 'pending',
ADD COLUMN human_feedback TEXT;
