CREATE TABLE [dbo].[Memory] (
  [Email]   NVARCHAR(256) COLLATE Latin1_General_CI_AI NOT NULL,
  [Memory] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_Memory] PRIMARY KEY ([Email])
);
