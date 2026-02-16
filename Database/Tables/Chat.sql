CREATE TABLE [dbo].[Chat] (
  [ChatId]         INT IDENTITY(1,1) NOT NULL,
  [Email]          NVARCHAR(256) COLLATE Latin1_General_CI_AI NOT NULL,
  [ChatStartDate]  DATETIME NOT NULL,
  [ChatUpdate]     DATETIME NOT NULL,
  [Title]          NVARCHAR(500) NOT NULL,
  [Content]        NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_Chat] PRIMARY KEY ([ChatId]),
  CONSTRAINT [AK_Chat_Email_ChatStartDate] UNIQUE ([Email], [ChatStartDate]),
  CONSTRAINT [FK_Chat_User] FOREIGN KEY ([Email]) REFERENCES [dbo].[User]([Email])
);
