-- Run this on existing databases that already have [dbo].[User] without the date columns.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND name = 'CreationDate')
  ALTER TABLE [dbo].[User] ADD [CreationDate] DATETIME NOT NULL DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND name = 'LastLoginDate')
  ALTER TABLE [dbo].[User] ADD [LastLoginDate] DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND name = 'LastActivityDate')
  ALTER TABLE [dbo].[User] ADD [LastActivityDate] DATETIME NULL;
GO
