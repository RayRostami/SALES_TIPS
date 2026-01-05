-- Insert initial data for ticket_status table
INSERT INTO ticket_status (name, description, color, is_active) VALUES
('Open', 'Ticket is newly created and waiting to be assigned', '#FFA500', true),
('In Progress', 'Ticket is being worked on', '#0000FF', true),
('Pending', 'Waiting for additional information', '#FFFF00', true),
('Resolved', 'Ticket has been resolved', '#008000', true),
('Closed', 'Ticket is closed', '#808080', true),
('Rejected', 'Ticket was rejected', '#FF0000', true)
ON CONFLICT (name) DO NOTHING;

-- Insert initial data for ticket_type table
INSERT INTO ticket_type (name, description, is_active) VALUES
('Technical Support', 'Technical issues and system problems', true),
('Feature Request', 'Requests for new features or enhancements', true),
('Bug Report', 'Report software bugs and errors', true),
('General Inquiry', 'General questions and inquiries', true),
('Account Issue', 'Account-related problems', true),
('Other', 'Other types of requests', true)
ON CONFLICT (name) DO NOTHING;
