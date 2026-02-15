-- Create contained user for the backend app (run in your Azure SQL database).
-- Replace <password> with the actual password before running.
CREATE USER [TRMOpenAIService] WITH PASSWORD = '<password>';
GO

ALTER ROLE db_datareader ADD MEMBER [TRMOpenAIService];
ALTER ROLE db_datawriter ADD MEMBER [TRMOpenAIService];
GO
