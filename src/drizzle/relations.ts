import { relations } from "drizzle-orm/relations";
import { user, chatBotInteraction, subscription, email, toEmails, emailAddress, replyToEmails, ccEmails, bccEmails, account, thread, emailAttachment } from "./schema";

export const chatBotInteractionRelations = relations(chatBotInteraction, ({one}) => ({
	user: one(user, {
		fields: [chatBotInteraction.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	chatBotInteractions: many(chatBotInteraction),
	subscriptions: many(subscription),
	accounts: many(account),
}));

export const subscriptionRelations = relations(subscription, ({one}) => ({
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id]
	}),
}));

export const toEmailsRelations = relations(toEmails, ({one}) => ({
	email: one(email, {
		fields: [toEmails.a],
		references: [email.id]
	}),
	emailAddress: one(emailAddress, {
		fields: [toEmails.b],
		references: [emailAddress.id]
	}),
}));

export const emailRelations = relations(email, ({one, many}) => ({
	toEmails: many(toEmails),
	replyToEmails: many(replyToEmails),
	ccEmails: many(ccEmails),
	bccEmails: many(bccEmails),
	emailAttachments: many(emailAttachment),
	emailAddress: one(emailAddress, {
		fields: [email.fromId],
		references: [emailAddress.id]
	}),
	thread: one(thread, {
		fields: [email.threadId],
		references: [thread.id]
	}),
}));

export const emailAddressRelations = relations(emailAddress, ({one, many}) => ({
	toEmails: many(toEmails),
	replyToEmails: many(replyToEmails),
	ccEmails: many(ccEmails),
	bccEmails: many(bccEmails),
	emails: many(email),
	account: one(account, {
		fields: [emailAddress.accountId],
		references: [account.id]
	}),
}));

export const replyToEmailsRelations = relations(replyToEmails, ({one}) => ({
	email: one(email, {
		fields: [replyToEmails.a],
		references: [email.id]
	}),
	emailAddress: one(emailAddress, {
		fields: [replyToEmails.b],
		references: [emailAddress.id]
	}),
}));

export const ccEmailsRelations = relations(ccEmails, ({one}) => ({
	email: one(email, {
		fields: [ccEmails.a],
		references: [email.id]
	}),
	emailAddress: one(emailAddress, {
		fields: [ccEmails.b],
		references: [emailAddress.id]
	}),
}));

export const bccEmailsRelations = relations(bccEmails, ({one}) => ({
	email: one(email, {
		fields: [bccEmails.a],
		references: [email.id]
	}),
	emailAddress: one(emailAddress, {
		fields: [bccEmails.b],
		references: [emailAddress.id]
	}),
}));

export const threadRelations = relations(thread, ({one, many}) => ({
	account: one(account, {
		fields: [thread.accountId],
		references: [account.id]
	}),
	emails: many(email),
}));

export const accountRelations = relations(account, ({one, many}) => ({
	threads: many(thread),
	emailAddresses: many(emailAddress),
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const emailAttachmentRelations = relations(emailAttachment, ({one}) => ({
	email: one(email, {
		fields: [emailAttachment.emailId],
		references: [email.id]
	}),
}));