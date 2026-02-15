CREATE TABLE [dbo].[Error] (
  [Id]           INT           IDENTITY(1, 1) NOT NULL,
  [CreatedAt]    DATETIME      NOT NULL,
  [Message]      NVARCHAR(500) NULL,
  [FullException] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_Error] PRIMARY KEY ([Id])
);
