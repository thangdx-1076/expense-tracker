-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  description text NOT NULL CHECK (length(description) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for query optimization
CREATE INDEX idx_transactions_user_id_date_desc ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_id_category_id ON public.transactions(user_id, category_id);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - users see only their own transactions
CREATE POLICY "users_select_own_transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: INSERT - users insert only for themselves
CREATE POLICY "users_insert_own_transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: UPDATE - users update only their own transactions
CREATE POLICY "users_update_own_transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: DELETE - users delete only their own transactions
CREATE POLICY "users_delete_own_transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at_trigger
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();
