CREATE TABLE [dbo].[User] (
  [Email]           NVARCHAR(256) COLLATE Latin1_General_CI_AI NOT NULL,
  [IsEnabled]       BIT           NOT NULL,
  [CreationDate]    DATETIME      NOT NULL DEFAULT GETDATE(),
  [LastLoginDate]   DATETIME      NULL,
  [LastActivityDate] DATETIME     NULL,
  CONSTRAINT [PK_User] PRIMARY KEY ([Email])
);
