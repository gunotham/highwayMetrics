-- Step 1: Insert a contractor if it doesn't exist.
-- Using ON CONFLICT DO NOTHING is a safe way to ensure the contractor exists without causing an error if the script is run multiple times.
INSERT INTO contractor (id, name, created_at, updated_at)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Default Test Contractor', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update the existing highway to link it to the contractor.
UPDATE highway
SET contractor_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE id = '80f19926-2a83-43c4-9047-4d3662499b8b';
