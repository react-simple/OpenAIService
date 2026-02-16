-- Run this on existing databases to add foreign keys from Chat and Memory to User.
-- [Chat].[Email] and [Memory].[Email] reference [User].[Email].

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Chat_User' AND parent_object_id = OBJECT_ID(N'[dbo].[Chat]'))
  ALTER TABLE [dbo].[Chat] ADD CONSTRAINT [FK_Chat_User] FOREIGN KEY ([Email]) REFERENCES [dbo].[User]([Email]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Memory_User' AND parent_object_id = OBJECT_ID(N'[dbo].[Memory]'))
  ALTER TABLE [dbo].[Memory] ADD CONSTRAINT [FK_Memory_User] FOREIGN KEY ([Email]) REFERENCES [dbo].[User]([Email]);
GO
