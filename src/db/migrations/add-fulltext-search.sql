-- Add tsvector column for full-text search
ALTER TABLE advocates ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION advocates_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.degree, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.payload::text, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger for insert and update
DROP TRIGGER IF EXISTS advocates_search_update ON advocates;
CREATE TRIGGER advocates_search_update
  BEFORE INSERT OR UPDATE ON advocates
  FOR EACH ROW
  EXECUTE FUNCTION advocates_search_trigger();

-- Create GIN index for fast searching
CREATE INDEX IF NOT EXISTS advocates_search_idx ON advocates USING GIN(search_vector);

-- Update existing records
UPDATE advocates SET search_vector = 
  setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(degree, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(payload::text, '')), 'D');