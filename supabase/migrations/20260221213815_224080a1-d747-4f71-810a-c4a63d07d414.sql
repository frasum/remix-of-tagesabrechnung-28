CREATE INDEX IF NOT EXISTS idx_waiter_shifts_session ON waiter_shifts (session_id);
CREATE INDEX IF NOT EXISTS idx_expenses_session ON expenses (session_id);
CREATE INDEX IF NOT EXISTS idx_advances_session ON advances (session_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_shifts_session ON kitchen_shifts (session_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_shift ON card_transactions (waiter_shift_id);
CREATE INDEX IF NOT EXISTS idx_bank_deposits_restaurant ON bank_deposits (restaurant_id);