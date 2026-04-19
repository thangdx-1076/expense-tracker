-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - users see only their own categories
CREATE POLICY "users_select_own_categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: INSERT - users insert only for themselves
CREATE POLICY "users_insert_own_categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: UPDATE - users update only their own categories
CREATE POLICY "users_update_own_categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: DELETE - users delete only their own categories
CREATE POLICY "users_delete_own_categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at_trigger
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();
